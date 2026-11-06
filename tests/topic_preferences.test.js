const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');
const { runInContext } = require('node:vm');
const { JSDOM } = require('jsdom');
const { CRITERIA, SURVEY_VERSION } = require('../src/js/criteria.js');

const root = path.join(__dirname, '..');
const srcDir = path.join(root, 'src');
const storageKey = 'ahp_cave_survey_progress_data';
const html = readFileSync(path.join(srcDir, 'index.html'), 'utf8');
const scripts = ['src/js/criteria.js', 'src/js/app.js'].map((file) => readFileSync(path.join(root, file), 'utf8'));

async function openSurvey(t, saved) {
  const dom = new JSDOM(html, { url: 'https://survey.example/', runScripts: 'outside-only' });
  t.after(() => dom.window.close());
  const { window } = dom;
  window.HTMLElement.prototype.scrollIntoView = function () {};
  let desktopLayout;
  window.matchMedia = () => {
    desktopLayout = new window.EventTarget();
    desktopLayout.matches = false;
    return desktopLayout;
  };
  window.alert = () => {};
  if (saved) window.localStorage.setItem(storageKey, JSON.stringify(saved));
  await new Promise((resolve) => window.document.addEventListener('DOMContentLoaded', resolve, { once: true }));
  scripts.forEach((script) => runInContext(script, dom.getInternalVMContext()));
  window.document.dispatchEvent(new window.Event('DOMContentLoaded'));
  const document = window.document;
  const change = (element) => element.dispatchEvent(new window.Event('change', { bubbles: true }));
  const choose = (group, value) => {
    const radio = document.querySelector(`input[name="confianca_${group}"][value="${value}"]`);
    assert.ok(radio, `${group} must offer ${value}`);
    radio.checked = true;
    change(radio);
  };
  const profile = () => {
    document.getElementById('evaluatorName').value = 'Test Expert';
    document.getElementById('evaluatorEmail').value = 'expert@example.org';
    document.getElementById('evaluatorEducation').value = 'PhD in Geology';
    choose('GLOBAL', 'high');
    for (const group of ['A', 'B', 'C', 'D', 'E']) choose(group, 'skip');
  };
  const answer = (step) => {
    const section = document.getElementById(`stepView_${step}`);
    section.querySelectorAll('.criteria-card-item').forEach((card) => {
      const radio = card.querySelector('input[type="radio"]');
      radio.checked = true;
      change(radio);
      const select = card.querySelector('select');
      select.value = 'Equal importance';
      change(select);
    });
  };
  const active = () => Number(document.querySelector('.step-view.active').dataset.stepIndex);
  const resizeToDesktop = (matches) => {
    desktopLayout.matches = matches;
    desktopLayout.dispatchEvent(new window.Event('change'));
  };
  return { window, document, choose, profile, answer, active, resizeToDesktop };
}

test('mobile navigation validates the profile and desktop always displays all comparisons', async (t) => {
  const { window, document, profile, choose, active, resizeToDesktop } = await openSurvey(t);
  const navigation = document.getElementById('mobileStepSelect');
  const navigate = (step) => {
    navigation.value = String(step);
    navigation.dispatchEvent(new window.Event('change', { bubbles: true }));
  };
  navigate(2);
  assert.equal(active(), 1);
  assert.equal(navigation.value, '1');
  profile();
  assert.equal(navigation.querySelector('option[value="3"]').disabled, true);
  choose('A', 'high');
  assert.equal(navigation.querySelector('option[value="3"]').disabled, false);
  navigate(3);
  assert.equal(active(), 3);
  assert.equal(document.getElementById('stepperPill_3').getAttribute('aria-current'), 'step');
  const matrix = document.getElementById('matrixContainer_step_3');
  assert.equal(matrix.classList.contains('mode-step'), true);
  resizeToDesktop(true);
  assert.equal(matrix.classList.contains('mode-step'), false);
  assert.equal(document.querySelector('#stepView_3 .step-nav-footer').classList.contains('d-none'), false);
  matrix.querySelector('.btn-mode-single').click();
  assert.equal(matrix.classList.contains('mode-step'), false);
  resizeToDesktop(false);
  assert.equal(matrix.classList.contains('mode-step'), true);
  navigate(8);
  assert.equal(active(), 8);
  assert.equal(navigation.value, '8');
});

test('confidence radios start unchecked and Main Criteria cannot be skipped', async (t) => {
  const { document, profile, choose } = await openSurvey(t);
  assert.equal(document.querySelectorAll('#confidenceTableBody tr').length, 6);
  assert.equal(document.querySelectorAll('#confidenceTableBody input:checked').length, 0);
  assert.equal(document.querySelector('#stepperPill_2 .stepper-name-label').textContent, 'Main Criteria');
  assert.equal(document.querySelector('#stepView_2 .step-title').textContent, 'Step 2: Main Criteria');
  assert.doesNotMatch(document.querySelector('#confidenceRow_2 th').textContent, /A to E/);
  assert.equal(document.querySelector('input[name="confianca_GLOBAL"][value="skip"]'), null);
  profile();
  assert.equal(document.getElementById('stepperPill_2').disabled, false);
  for (let step = 3; step <= 7; step++) {
    assert.equal(document.getElementById(`stepperPill_${step}`).disabled, true);
    assert.equal(document.querySelectorAll(`#stepView_${step} input:not(:disabled), #stepView_${step} select:not(:disabled)`).length, 0);
  }
  choose('A', 'low');
  assert.equal(document.querySelectorAll('input[name="confianca_A"]:checked').length, 1);
  assert.equal(document.querySelector('input[name="confianca_A"][value="skip"]').checked, false);
});

test('Step 1 requires education and an explicit choice for every topic', async (t) => {
  const { document, profile, active } = await openSurvey(t);
  profile();
  document.getElementById('evaluatorEducation').value = '  ';
  document.getElementById('btnNextStep1').click();
  assert.equal(active(), 1);
  assert.match(document.getElementById('validationAlert').textContent, /Academic Background/);
  document.getElementById('evaluatorEducation').value = 'MSc in Engineering';
  const confidenceE = document.querySelector('input[name="confianca_E"]:checked');
  confidenceE.checked = false;
  confidenceE.dispatchEvent(new document.defaultView.Event('change', { bubbles: true }));
  document.getElementById('stepperPill_8').click();
  assert.equal(active(), 1);
  assert.match(document.getElementById('validationAlert').textContent, /confidence level/);
});

test('navigation skips declined topics in both directions and progress counts active comparisons', async (t) => {
  const { document, profile, choose, answer, active } = await openSurvey(t);
  profile();
  choose('C', 'moderate');
  assert.match(document.getElementById('ahpProgressText').textContent, /0 of 16/);
  document.getElementById('btnNextStep1').click();
  assert.equal(active(), 2);
  document.querySelector('#stepView_2 .btn-step-next').click();
  assert.equal(active(), 5);
  document.querySelector('#stepView_5 .btn-step-prev').click();
  assert.equal(active(), 2);
  document.getElementById('stepperPill_3').click();
  assert.equal(active(), 2);
  answer(2);
  assert.match(document.getElementById('ahpProgressText').textContent, /10 of 16/);
  document.getElementById('stepperPill_8').click();
  document.querySelector('#stepView_8 .btn-step-prev').click();
  assert.equal(active(), 5);
});

test('answers survive opting out and reload, and return when the topic is enabled', async (t) => {
  const first = await openSurvey(t);
  first.profile();
  first.choose('A', 'very_high');
  first.answer(3);
  first.choose('A', 'skip');
  assert.match(first.document.getElementById('ahpProgressText').textContent, /0 of 10/);
  const saved = JSON.parse(first.window.localStorage.getItem(storageKey));
  saved.currentStep = 3;
  const second = await openSurvey(t, saved);
  assert.equal(second.active(), 1);
  assert.equal(second.document.getElementById('evaluatorEducation').value, 'PhD in Geology');
  assert.equal(second.document.querySelector('input[name="confianca_A"]:checked').value, 'skip');
  assert.equal(second.document.querySelector('#stepView_3 input:checked').disabled, true);
  second.choose('A', 'high');
  assert.match(second.document.getElementById('ahpProgressText').textContent, /10 of 20/);
  assert.equal(second.document.querySelector('#stepView_3 select').disabled, false);
  second.document.getElementById('stepperPill_8').click();
  assert.match(second.document.getElementById('summaryEducation').textContent, /PhD/);
  assert.match(second.document.querySelector('.review-step-btn[data-target-step="3"]').textContent, /High confidence/);
});

test('submission requires Main Criteria and omits all answers in declined topics', async (t) => {
  const { window, document, profile, choose, answer, active } = await openSurvey(t);
  profile();
  choose('A', 'high');
  answer(3);
  choose('A', 'skip');
  let payload;
  window.fetch = async (_url, options) => {
    payload = JSON.parse(options.body);
    return { ok: true, status: 200, text: async () => '{"success":true}' };
  };
  document.getElementById('stepperPill_8').click();
  document.getElementById('submitBtn').click();
  assert.equal(payload, undefined);
  assert.equal(active(), 2);
  assert.match(document.getElementById('validationAlert').textContent, /Main Criteria/);
  answer(2);
  document.getElementById('stepperPill_8').click();
  document.getElementById('submitBtn').click();
  assert.equal(payload.formacao, 'PhD in Geology');
  assert.equal(payload.confianca_GLOBAL, 'high');
  assert.equal(payload.confianca_A, 'skip');
  assert.equal(Object.keys(payload).filter((key) => key.startsWith('mais_importante_')).length, 10);
  assert.equal(Object.keys(payload).filter((key) => key.startsWith('intensidade_saaty_')).length, 10);
  assert.equal(Object.keys(payload).some((key) => key.includes('A1')), false);
  await new Promise((resolve) => setImmediate(resolve));
});

test('incomplete selected sub-criteria block submission', async (t) => {
  const { window, document, profile, choose, answer, active } = await openSurvey(t);
  profile();
  choose('B', 'low');
  answer(2);
  window.fetch = () => { assert.fail('Incomplete survey must not submit'); };
  document.getElementById('stepperPill_8').click();
  document.getElementById('submitBtn').click();
  assert.equal(active(), 4);
  assert.match(document.getElementById('validationAlert').textContent, /Total pending: 6/);
});

test('older drafts return to Step 1 to collect the new fields', async (t) => {
  const { document, active } = await openSurvey(t, {
    currentStep: 8,
    evaluator: { name: 'Existing Expert', email: 'existing@example.org' },
    comparisons: {}
  });
  assert.equal(active(), 1);
  assert.equal(document.getElementById('evaluatorName').value, 'Existing Expert');
  assert.equal(document.querySelectorAll('#confidenceTableBody input:checked').length, 0);
});

test('the HTML hierarchy contains all 5 criteria and 21 sub-criteria from the survey', async (t) => {
  const { document } = await openSurvey(t);
  assert.equal(document.querySelector('#diagramModal img'), null);
  assert.equal(document.querySelectorAll('.hierarchy-group').length, 5);
  assert.equal(document.querySelectorAll('.hierarchy-subcriteria li').length, 21);
  for (const criterion of CRITERIA) {
    const group = document.querySelector(`.hierarchy-theme-${criterion.code.toLowerCase()}`);
    assert.equal(group.querySelector('h6').textContent, criterion.fullName);
    const labels = [...group.querySelectorAll('li')].map((item) => item.textContent);
    assert.deepEqual(labels, criterion.subcriteria.map((item) => `${item.code}. ${item.name}`));
  }
  for (const img of document.querySelectorAll('img[src^="img/"]')) {
    assert.ok(readFileSync(path.join(srcDir, img.getAttribute('src'))).length);
  }
});

test('topic help opens the matching branch and the general button restores the complete tree', async (t) => {
  const { document, window } = await openSurvey(t);
  const modal = document.getElementById('diagramModal');
  const open = (button) => {
    const event = new window.Event('show.bs.modal');
    Object.defineProperty(event, 'relatedTarget', { value: button });
    modal.dispatchEvent(event);
  };
  for (const criterion of CRITERIA) {
    open(document.querySelector(`.topic-tree-trigger[data-tree-criterion="${criterion.code}"]`));
    assert.equal(document.querySelectorAll('.hierarchy-group').length, 1);
    assert.equal(document.querySelector('.hierarchy-criterion').textContent, criterion.fullName);
    assert.equal(document.querySelectorAll('.hierarchy-subcriteria li').length, criterion.subcriteria.length);
  }
  open(document.querySelector('.topic-tree-trigger[data-tree-criterion="GLOBAL"]'));
  assert.equal(document.querySelectorAll('.hierarchy-group').length, 5);
  assert.equal(document.querySelectorAll('.hierarchy-subcriteria li').length, 0);
  open(document.querySelector('header [data-bs-target="#diagramModal"]'));
  assert.equal(document.querySelectorAll('.hierarchy-group').length, 5);
  assert.equal(document.querySelectorAll('.hierarchy-subcriteria li').length, 21);
});

test('every compared criterion and sub-criterion has the same help across its appearances', async (t) => {
  const { document } = await openSurvey(t);
  const buttons = [...document.querySelectorAll('.criterion-help-trigger')];
  assert.equal(buttons.length, 88);
  for (const criterion of CRITERIA.flatMap((item) => [item, ...item.subcriteria])) {
    const appearances = buttons.filter((button) => button.dataset.criterionCode === criterion.code);
    assert.ok(appearances.length >= 2);
    for (const button of appearances) {
      assert.equal(button.getAttribute('data-criterion-code'), criterion.code);
      assert.equal(button.closest('label'), null);
      assert.ok(button.querySelector('.bi-info-circle'));
    }
  }
  assert.equal(document.querySelector('.step-intro-card'), null);
});

test('drafts from previous criteria preserve the profile without reusing judgments for changed codes', async (t) => {
  const oldDraft = {
    criteriaVersion: 'previous-criteria',
    currentStep: 8,
    evaluator: { name: 'Existing Expert', email: 'existing@example.org', formacao: 'PhD in Geology' },
    confidence: { GLOBAL: 'high', A: 'high', B: 'high', C: 'high', D: 'high', E: 'high' },
    comparisons: {
      E1_vs_E4: {
        chosenValue: 'E1. Associated tectonics', chosenCode: 'E1',
        otherName: 'E4. Proximity to exploratory wells', intensity: 'Equal importance'
      }
    }
  };
  const { document, window, active, choose } = await openSurvey(t, oldDraft);
  assert.equal(active(), 1);
  assert.equal(document.getElementById('evaluatorName').value, 'Existing Expert');
  assert.equal(document.querySelectorAll('#ahpForm input[type="radio"]:checked').length, 0);
  assert.match(document.getElementById('ahpProgressText').textContent, /0 of 44/);
  assert.match(document.getElementById('validationAlert').textContent, /criteria have changed/);
  assert.deepEqual(JSON.parse(window.localStorage.getItem(`${storageKey}_previous_criteria`)), oldDraft);
  choose('GLOBAL', 'high');
  const saved = JSON.parse(window.localStorage.getItem(storageKey));
  assert.equal(saved.criteriaVersion, SURVEY_VERSION);
  assert.deepEqual(saved.comparisons, {});
});
