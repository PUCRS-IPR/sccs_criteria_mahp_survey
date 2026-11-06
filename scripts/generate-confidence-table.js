const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');
const { CONFIDENCE_LEVELS, SURVEY_STEPS } = require('../src/js/criteria.js');

// Keep the initial form usable before JavaScript and optional CDNs finish loading.
const htmlPath = path.join(__dirname, '..', 'src', 'index.html');
const html = fs.readFileSync(htmlPath, 'utf8');
const newline = html.includes('\r\n') ? '\r\n' : '\n';
const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (character) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
})[character]);

const rows = SURVEY_STEPS.filter((step) => step.type === 'comparisons').map((step) => {
  const options = CONFIDENCE_LEVELS.map((level) => {
    if (step.stepIndex === 2 && level.value === 'skip') {
      return '                    <td><div class="confidence-option-required"><span class="small text-muted">Required for all experts</span></div></td>';
    }
    return `                    <td><label class="confidence-option">
                      <input type="radio" class="form-check-input" name="confianca_${escapeHtml(step.groupKey)}"
                             value="${escapeHtml(level.value)}" aria-label="${escapeHtml(step.navTitle)}: ${escapeHtml(level.label)}" required>
                      <span class="confidence-level-label">${escapeHtml(level.label)}</span>
                    </label></td>`;
  }).join('\n');
  return `                  <tr id="confidenceRow_${step.stepIndex}">
                    <th scope="row">
                      <div class="topic-cell-content">
                        <button type="button" class="btn topic-tree-trigger"
                                data-bs-toggle="modal" data-bs-target="#diagramModal"
                                data-tree-criterion="${escapeHtml(step.groupKey)}"
                                title="View criteria tree" data-bs-placement="top"
                                aria-label="View criteria tree: ${escapeHtml(step.navTitle)}"
                                aria-controls="diagramModal" aria-haspopup="dialog">
                          <i class="bi bi-question-circle" aria-hidden="true"></i>
                        </button>
                        <span>
                          <span class="badge ${escapeHtml(step.badgeClass)}">${escapeHtml(step.codeBadge)}</span>
                          ${escapeHtml(step.navTitle)}${step.stepIndex === 2 ? ' <span class="small text-muted">(Required)</span>' : ''}
                        </span>
                      </div>
                    </th>
${options}
                  </tr>`;
}).join('\n');

const start = '                  <!-- BEGIN GENERATED CONFIDENCE OPTIONS -->';
const end = '                  <!-- END GENERATED CONFIDENCE OPTIONS -->';
const region = /                  <!-- BEGIN GENERATED CONFIDENCE OPTIONS -->[\s\S]*?                  <!-- END GENERATED CONFIDENCE OPTIONS -->/;
if (!region.test(html)) throw new Error('Generated confidence options markers are missing in src/index.html.');
const generated = [start, rows.replace(/\n/g, newline), end].join(newline);
let updated = html.replace(region, () => generated);
// Prevent a cached script from being paired with newer survey definitions or HTML.
for (const asset of ['css/style.css', 'js/criteria.js', 'js/app.js']) {
  const content = fs.readFileSync(path.join(__dirname, '..', 'src', asset), 'utf8').replace(/\r\n/g, '\n');
  const version = createHash('sha256').update(content).digest('hex').slice(0, 12);
  const attribute = asset.endsWith('.css') ? 'href' : 'src';
  const escapedAsset = asset.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const reference = new RegExp(`${attribute}="${escapedAsset}(?:\\?v=[^"\\s]+)?"`);
  if (!reference.test(updated)) throw new Error(`Local asset reference is missing: ${asset}`);
  updated = updated.replace(reference, `${attribute}="${asset}?v=${version}"`);
}

if (process.argv.includes('--check')) {
  if (updated !== html) {
    console.error('Confidence options or asset versions are out of date. Run npm run generate:confidence.');
    process.exitCode = 1;
  } else {
    console.log('Confidence options and asset versions match the survey sources.');
  }
} else if (updated !== html) {
  fs.writeFileSync(htmlPath, updated);
  console.log('Updated the initial confidence options in src/index.html.');
}
