/**
 * Fuzzy-AHP Survey Application Logic
 * Multi-Step Stepper Management with Criteria and Sub-criteria Names,
 * Compact Matrix Rendering, Validation, and Local Storage Persistence
 * (100% free of inline styles in HTML - managed via CSS variables and classes)
 */

document.addEventListener("DOMContentLoaded", function () {
  const STORAGE_KEY = "ahp_cave_survey_progress_data";

  let currentStep = 1;
  const totalSteps = SURVEY_STEPS.length;
  const allPairs = getAllSurveyPairs();
  const comparisonSteps = SURVEY_STEPS.filter((step) => step.type === "comparisons");
  const topicConfidence = {};
  const stepActivePairIndex = { 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 };
  const stepViewMode = { 2: "step", 3: "step", 4: "step", 5: "step", 6: "step", 7: "step" };
  const desktopComparisonLayout = window.matchMedia?.("(min-width: 768px)");
  const confidenceLevels = [
    { value: "skip", label: "I do not want to answer" },
    { value: "very_low", label: "Very low confidence" },
    { value: "low", label: "Low confidence" },
    { value: "moderate", label: "Moderate confidence" },
    { value: "high", label: "High confidence" },
    { value: "very_high", label: "Very high confidence" }
  ];

  // Global DOM elements
  const form = document.getElementById("ahpForm");
  const stepperTrack = document.getElementById("stepperTrack");
  const mobileStepSelect = document.getElementById("mobileStepSelect");
  const progressBar = document.getElementById("ahpProgressBar");
  const progressText = document.getElementById("ahpProgressText");
  const currentStepBadge = document.getElementById("currentStepBadge");
  const currentStepName = document.getElementById("currentStepName");
  const validationAlert = document.getElementById("validationAlert");
  const saveStatusText = document.getElementById("saveStatusText");
  const saveStatusIcon = document.getElementById("saveStatusIcon");
  const confirmResetBtn = document.getElementById("confirmResetBtn");

  // 1. Render Stepper buttons with criteria/sub-criteria names
  renderStepperPills();

  // 2. Render comparison matrices for steps 2 to 8
  renderAllComparisonMatrices();
  setupPairStepControls();
  desktopComparisonLayout?.addEventListener("change", () => {
    comparisonSteps.forEach((step) => updatePairStepView(step.stepIndex));
  });
  for (let s = 2; s <= 7; s++) {
    updatePairStepView(s);
  }
  renderConfidenceTable();
  renderHierarchyDiagram();
  document.getElementById("diagramModal")?.addEventListener("show.bs.modal", (event) => {
    renderHierarchyDiagram(event.relatedTarget?.getAttribute("data-tree-criterion") || "");
  });

  // 3. Initialize event listeners on registration inputs and pairwise inputs
  setupComparisonEventListeners();
  setupEvaluatorAutoSave();

  // 4. Initialize step navigation and reset button
  setupNavigationEventListeners();
  setupResetListener();

  // Check if questionnaire was just reset to display success message
  if (sessionStorage.getItem("ahp_survey_just_reset") === "true") {
    sessionStorage.removeItem("ahp_survey_just_reset");
    showAlert("The questionnaire and browser data were successfully reset!", "success");
  }

  // 5. Restore previous progress saved in Local Storage (if any)
  const wasRestored = loadProgressFromLocalStorage();
  applyTopicPreferences();

  // 6. Update initial progress
  updateAllProgress();

  // 7. Update initial summary
  updateReviewSummary();

  function renderHierarchyDiagram(groupKey = "") {
    const groups = document.getElementById("hierarchyGroups");
    if (!groups) return;
    const selectedCriterion = CRITERIA.find((criterion) => criterion.code === groupKey);
    const mainCriteriaOnly = groupKey === "GLOBAL";
    const criteria = selectedCriterion ? [selectedCriterion] : CRITERIA;
    groups.classList.toggle("hierarchy-groups-single", Boolean(selectedCriterion));
    document.querySelector(".hierarchy-objective").hidden = Boolean(selectedCriterion);
    document.getElementById("diagramModalTitleText").textContent = selectedCriterion
      ? `${selectedCriterion.fullName} — Criteria Tree`
      : mainCriteriaOnly ? "Main Criteria Tree" : "Hierarchical Criteria Model (Fuzzy-AHP)";
    document.getElementById("hierarchyCaption").textContent = selectedCriterion
      ? `${selectedCriterion.name} and its ${selectedCriterion.subcriteria.length} sub-criteria.`
      : mainCriteriaOnly ? "Research objective and the five main criteria."
        : "Hierarchical diagram with the Main Objective at the top, decomposed into 5 Main Criteria and their respective Sub-criteria for multi-criteria evaluation.";
    groups.innerHTML = criteria.map((criterion) => `
      <li class="hierarchy-group hierarchy-theme-${criterion.code.toLowerCase()}">
        <h6 class="hierarchy-criterion" id="hierarchyCriterion_${criterion.code}">${criterion.fullName}</h6>
        ${mainCriteriaOnly ? '' : `<ul class="hierarchy-subcriteria" aria-labelledby="hierarchyCriterion_${criterion.code}">
          ${criterion.subcriteria.map((item) => `<li title="${item.description}"><strong>${item.code}.</strong> ${item.name}</li>`).join("")}
        </ul>`}
      </li>
    `).join("");
  }

  function getConfidence(step) {
    return topicConfidence[step.groupKey] || "";
  }

  function isStepEnabled(stepIndex) {
    const step = comparisonSteps.find((item) => item.stepIndex === stepIndex);
    return !step || stepIndex === 2 || getConfidence(step) !== "skip";
  }

  function renderConfidenceTable() {
    const body = document.getElementById("confidenceTableBody");
    body.innerHTML = comparisonSteps.map((step) => `
      <tr id="confidenceRow_${step.stepIndex}">
        <th scope="row">
          <div class="topic-cell-content">
            <button type="button" class="btn topic-tree-trigger"
                    data-bs-toggle="modal" data-bs-target="#diagramModal"
                    data-tree-criterion="${step.groupKey}"
                    title="View criteria tree" data-bs-placement="top"
                    aria-label="View criteria tree: ${step.navTitle}"
                    aria-controls="diagramModal" aria-haspopup="dialog">
              <i class="bi bi-question-circle" aria-hidden="true"></i>
            </button>
            <span>
              <span class="badge ${step.badgeClass}">${step.codeBadge}</span>
              ${step.navTitle}${step.stepIndex === 2 ? ' <span class="small text-muted">(Required)</span>' : ''}
            </span>
          </div>
        </th>
        ${confidenceLevels.map((level) => step.stepIndex === 2 && level.value === "skip"
          ? '<td><div class="confidence-option-required"><span class="small text-muted">Required for all experts</span></div></td>'
          : `<td><label class="confidence-option">
              <input type="radio" class="form-check-input" name="confianca_${step.groupKey}"
                     value="${level.value}" aria-label="${step.navTitle}: ${level.label}" required>
              <span class="confidence-level-label">${level.label}</span>
            </label></td>`).join("")}
      </tr>
    `).join("");

    if (typeof bootstrap !== "undefined" && bootstrap.Tooltip) {
      body.querySelectorAll(".topic-tree-trigger").forEach((button) => {
        const tooltip = bootstrap.Tooltip.getOrCreateInstance(button, { container: "body", trigger: "hover focus" });
        button.addEventListener("click", () => tooltip.hide());
      });
    }

    body.addEventListener("change", () => {
      comparisonSteps.forEach((step) => {
        topicConfidence[step.groupKey] = body.querySelector(`input[name="confianca_${step.groupKey}"]:checked`)?.value || "";
      });
      applyTopicPreferences();
      for (let s = 2; s <= 7; s++) {
        updatePairStepView(s);
      }
      updateAllProgress();
      updateReviewSummary();
      saveProgressToLocalStorage();
    });
  }

  // Keep previous answers locally so choosing a confidence level re-enables them.
  // Disabled controls are excluded from both native and JSON submissions.
  function applyTopicPreferences() {
    comparisonSteps.forEach((step) => {
      const enabled = isStepEnabled(step.stepIndex);
      document.getElementById(`confidenceRow_${step.stepIndex}`).classList.toggle("is-skipped", !enabled);
      step.pairs.forEach((pair) => {
        const radios = document.querySelectorAll(`input[name="mais_importante_${pair.pairKey}"]`);
        radios.forEach((radio) => { radio.disabled = !enabled; });
        const selected = document.querySelector(`input[name="mais_importante_${pair.pairKey}"]:checked`);
        document.getElementById(`select_intensidade_${pair.pairKey}`).disabled = !enabled || !selected;
      });
      updateStepCompletionText(step.stepIndex);
    });

    // Resolve footer destinations from enabled steps in both directions.
    document.querySelectorAll(".btn-step-next, .btn-step-prev").forEach((button) => {
      const from = Number(button.closest(".step-view").dataset.stepIndex);
      const forwards = button.classList.contains("btn-step-next");
      const candidates = SURVEY_STEPS.filter((step) => isStepEnabled(step.stepIndex) &&
        (forwards ? step.stepIndex > from : step.stepIndex < from));
      const target = forwards ? candidates[0] : candidates[candidates.length - 1];
      if (!target) return;
      button.dataset.targetStep = target.stepIndex;
      button.innerHTML = forwards
        ? `Next: ${target.shortTitle} <i class="bi bi-arrow-right ms-2"></i>`
        : `<i class="bi bi-arrow-left me-2"></i> Back: ${target.shortTitle}`;
    });
  }

  /**
   * Renders the 9 horizontal Stepper buttons with real criteria and sub-criteria names
   */
  function renderStepperPills() {
    if (!stepperTrack) return;
    let html = "";

    SURVEY_STEPS.forEach((step) => {
      const isActive = step.stepIndex === 1 ? "active" : "";
      html += `
        <button type="button" 
                class="stepper-nav-btn ${isActive}" 
                id="stepperPill_${step.stepIndex}" 
                data-step-index="${step.stepIndex}"
                title="${step.title}">
          <div class="stepper-badge-wrap">
            <span class="stepper-code-badge ${step.badgeClass || ''}" id="pillNum_${step.stepIndex}">
              ${step.codeBadge}
            </span>
          </div>
          <div class="stepper-text-wrap">
            <span class="stepper-cat-label">${step.category}</span>
            <span class="stepper-name-label">${step.navTitle}</span>
          </div>
          <div class="stepper-check-indicator" id="stepperCheck_${step.stepIndex}"></div>
        </button>
      `;
    });

    stepperTrack.innerHTML = html;
    if (mobileStepSelect) {
      mobileStepSelect.innerHTML = SURVEY_STEPS.map((step) =>
        `<option value="${step.stepIndex}">${step.stepIndex}. ${step.navTitle}</option>`
      ).join("");
      mobileStepSelect.addEventListener("change", () => {
        document.getElementById(`stepperPill_${mobileStepSelect.value}`)?.click();
        mobileStepSelect.value = String(currentStep);
      });
    }

    // Navigation listener when clicking stepper buttons
    const pills = stepperTrack.querySelectorAll(".stepper-nav-btn");
    pills.forEach((pill) => {
      pill.addEventListener("click", function () {
        const targetStep = parseInt(this.getAttribute("data-step-index"), 10);
        if (targetStep === currentStep) return;

        // User must answer step 1 before advancing to others
        if (targetStep > 1 && !validateEvaluatorData()) {
          goToStep(1, true);
          return;
        }

        // Free navigation among steps 2 to 9
        goToStep(targetStep);
      });
    });
  }

  /**
   * Renders compact matrix cards for all comparison steps
   */
  function renderAllComparisonMatrices() {
    SURVEY_STEPS.forEach((step) => {
      if (step.type === "comparisons" && Array.isArray(step.pairs)) {
        const matrixContainer = document.getElementById(`matrixContainer_step_${step.stepIndex}`);
        if (matrixContainer) {
          renderMatrixCards(step.pairs, matrixContainer, step);
        }
      }
    });

    document.querySelectorAll(".criterion-help-trigger").forEach((button) => {
      const code = button.getAttribute("data-criterion-code");
      if (!code) return;

      button.addEventListener("click", (e) => {
        e.preventDefault();
        openCriterionDetailModal(code);
      });

      button.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openCriterionDetailModal(code);
        }
      });
    });
  }

  function findCriterionByCode(code) {
    for (const crit of CRITERIA) {
      if (crit.code === code) return crit;
      if (crit.subcriteria) {
        const found = crit.subcriteria.find((s) => s.code === code);
        if (found) return found;
      }
    }
    return null;
  }

  function openCriterionDetailModal(code) {
    const criterion = findCriterionByCode(code);
    if (!criterion) return;

    const modalEl = document.getElementById("criterionDetailModal");
    if (!modalEl) return;

    const themeCode = (criterion.parentCode || criterion.code).toLowerCase();
    const parentCriterion = CRITERIA.find((c) => c.code === criterion.parentCode);
    const categoryName = parentCriterion ? parentCriterion.fullName : "Main Criterion";

    const badgeEl = document.getElementById("criterionModalBadge");
    if (badgeEl) {
      badgeEl.textContent = criterion.code;
      badgeEl.className = `badge criterion-modal-badge badge-criteria-${themeCode}`;
    }
    const catEl = document.getElementById("criterionModalCategory");
    if (catEl) catEl.textContent = categoryName;

    const titleEl = document.getElementById("criterionDetailModalLabel");
    if (titleEl) titleEl.textContent = criterion.name;

    const bodyEl = document.getElementById("criterionModalBody");
    if (!bodyEl) return;

    const rawText = (criterion.helpText || criterion.description || "").trim();
    const paragraphs = rawText
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter(Boolean);

    const paragraphsHtml = paragraphs.map((p) => `<p class="criterion-modal-paragraph mb-3">${p}</p>`).join("");

    bodyEl.innerHTML = `
      <div class="mb-2">
        <h6 class="criterion-section-title">
          <i class="bi bi-file-earmark-text me-2 text-primary"></i>Technical Context & Geomechanical Mechanism
        </h6>
        <div>
          ${paragraphsHtml}
        </div>
      </div>
    `;

    if (typeof bootstrap !== "undefined" && bootstrap.Modal) {
      const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
      modal.show();
    }
  }

  function renderCriterionHelp(criterion) {
    return `<button type="button" class="criterion-help-trigger"
                    data-criterion-code="${criterion.code}"
                    title="Click to learn more"
                    aria-label="Click to learn more about ${criterion.fullName}">
              <i class="bi bi-info-circle" aria-hidden="true"></i>
            </button>`;
  }

  /**
   * Renders cards for a specific step in matrix format with 12axes-inspired step mode support
   */
  function renderMatrixCards(pairs, container, step) {
    const stepIndex = step.stepIndex;
    container.classList.add("mode-step");

    let html = `
      <!-- 12axes-Inspired Mobile Step Mode Toolbar -->
      <div class="pair-step-ctrl" id="pairCtrl_${stepIndex}">
        <div class="d-flex justify-content-between align-items-center mb-2 flex-wrap gap-2">
          <div class="d-flex align-items-center gap-2">
            <span class="badge bg-primary pair-num-pill" id="pairCurrentBadge_${stepIndex}">Pair 1 of ${pairs.length}</span>
            <span class="small text-muted pair-answered-ratio" id="pairRatio_${stepIndex}">0 of ${pairs.length} answered</span>
          </div>
          <div class="btn-group btn-group-sm pair-mode-toggle" role="group" aria-label="Viewing mode">
            <button type="button" class="btn btn-outline-primary btn-sm btn-mode-single active" data-step="${stepIndex}" data-mode="step" title="12axes step mode: focus on 1 comparison at a time">
              <i class="bi bi-card-text me-1"></i> Step Mode
            </button>
            <button type="button" class="btn btn-outline-primary btn-sm btn-mode-all" data-step="${stepIndex}" data-mode="all" title="Show all comparisons in a list">
              <i class="bi bi-view-list me-1"></i> View All (${pairs.length})
            </button>
          </div>
        </div>
        <!-- Mini Step Indicator Dots -->
        <div class="pair-dots-track mb-3" id="pairDots_${stepIndex}">
          ${pairs.map((p, i) => `
            <button type="button" class="pair-dot-btn ${i === 0 ? 'is-current' : ''}" data-step="${stepIndex}" data-index="${i}" title="Pair ${i + 1}: ${p.crit1.code} vs ${p.crit2.code}">
              <span class="dot-num">${i + 1}</span>
            </button>
          `).join("")}
        </div>
      </div>
    `;

    pairs.forEach((pair, pIdx) => {
      const { index, crit1, crit2, pairKey } = pair;
      const themeCode1 = (crit1.parentCode || crit1.code).toLowerCase();
      const themeCode2 = (crit2.parentCode || crit2.code).toLowerCase();
      const isFirst = pIdx === 0;

      html += `
        <div class="criteria-card-item ${isFirst ? 'is-active-card' : ''}" id="card_${pairKey}" data-pair="${pairKey}" data-pair-index="${pIdx}">
          <!-- Compact Card Header -->
          <div class="criteria-card-header">
            <span class="card-pair-badge">
              <i class="bi bi-shuffle me-1"></i>Pair ${index} of ${pairs.length}
            </span>
            <span class="badge bg-light text-secondary border badge-status" id="status_${pairKey}">
              Pending
            </span>
          </div>

          <!-- Compact Card Body -->
          <div class="criteria-card-body">
            <!-- Question 1: Compact Selector Radios -->
            <div>
              <div class="pair-card-subtitle">1. Which criterion is more relevant?</div>
              <div class="pair-radio-grid">
                <!-- Option 1 -->
                <div class="pair-option-row">
                <label class="custom-radio-compact">
                  <input type="radio" 
                         name="mais_importante_${pairKey}" 
                         value="${crit1.fullName}" 
                         data-pair="${pairKey}"
                         data-chosen-code="${crit1.code}"
                         data-chosen="${crit1.fullName}" 
                         data-other="${crit2.fullName}"
                         required>
                  <div class="radio-pill">
                    <span class="radio-indicator-dot"></span>
                    <div class="radio-text-label">
                      <span class="badge badge-criteria-${themeCode1}">${crit1.code}</span>
                      <span class="criterion-option-name">${crit1.name}</span>
                    </div>
                  </div>
                </label>
                ${renderCriterionHelp(crit1)}
                </div>

                <!-- Option 2 -->
                <div class="pair-option-row">
                <label class="custom-radio-compact">
                  <input type="radio" 
                         name="mais_importante_${pairKey}" 
                         value="${crit2.fullName}" 
                         data-pair="${pairKey}"
                         data-chosen-code="${crit2.code}"
                         data-chosen="${crit2.fullName}" 
                         data-other="${crit1.fullName}"
                         required>
                  <div class="radio-pill">
                    <span class="radio-indicator-dot"></span>
                    <div class="radio-text-label">
                      <span class="badge badge-criteria-${themeCode2}">${crit2.code}</span>
                      <span class="criterion-option-name">${crit2.name}</span>
                    </div>
                  </div>
                </label>
                ${renderCriterionHelp(crit2)}
                </div>
              </div>
            </div>

            <!-- Question 2: Intensity (Saaty Verbal Scale) -->
            <div class="intensity-block is-disabled" id="intensity_block_${pairKey}">
              <label class="dynamic-question-label" id="label_intensidade_${pairKey}" for="select_intensidade_${pairKey}">
                <i class="bi bi-lock-fill me-1 text-muted"></i> 2. Degree of superiority:
              </label>
              <select class="form-select form-select-sm saaty-select" 
                      id="select_intensidade_${pairKey}" 
                      name="intensidade_saaty_${pairKey}" 
                      disabled 
                      required>
                <option value="" disabled selected>Select priority above...</option>
                ${SAATY_SCALE_OPTIONS.map((opt) => `<option value="${opt}">${opt}</option>`).join("")}
              </select>
            </div>
          </div>
        </div>
      `;
    });

    html += `
      <!-- Pair Step Navigation Bar (12axes style) -->
      <div class="pair-step-nav-bar d-flex justify-content-between align-items-center gap-2 mt-3" id="pairNavFooter_${stepIndex}">
        <button type="button" class="btn btn-outline-secondary px-3 py-2 btn-pair-step-prev" data-step="${stepIndex}">
          <i class="bi bi-arrow-left me-1"></i> Previous Pair
        </button>
        <span class="small fw-semibold text-secondary pair-quick-info d-none d-sm-inline" id="pairQuickInfo_${stepIndex}">
          Pair 1 of ${pairs.length}
        </span>
        <button type="button" class="btn btn-primary px-3 py-2 btn-pair-step-next" data-step="${stepIndex}">
          Next Pair <i class="bi bi-arrow-right ms-1"></i>
        </button>
      </div>
    `;

    container.innerHTML = html;
  }

  /**
   * Updates display state of 12axes-inspired pair step mode
   */
  function getPairViewMode(stepIndex) {
    return desktopComparisonLayout?.matches ? "all" : (stepViewMode[stepIndex] || "step");
  }

  function updatePairStepView(stepIndex) {
    const container = document.getElementById(`matrixContainer_step_${stepIndex}`);
    if (!container) return;

    const stepDef = SURVEY_STEPS.find((s) => s.stepIndex === stepIndex);
    if (!stepDef || !Array.isArray(stepDef.pairs)) return;

    const totalPairs = stepDef.pairs.length;
    let activeIdx = stepActivePairIndex[stepIndex] || 0;
    if (activeIdx < 0) activeIdx = 0;
    if (activeIdx >= totalPairs) activeIdx = totalPairs - 1;
    stepActivePairIndex[stepIndex] = activeIdx;

    const mode = getPairViewMode(stepIndex);
    container.classList.toggle("mode-step", mode === "step");

    // Update active class on cards
    stepDef.pairs.forEach((pair, idx) => {
      const card = document.getElementById(`card_${pair.pairKey}`);
      if (card) {
        card.classList.toggle("is-active-card", idx === activeIdx);
      }
    });

    // Update counter badge
    const badge = document.getElementById(`pairCurrentBadge_${stepIndex}`);
    if (badge) {
      badge.textContent = `Pair ${activeIdx + 1} of ${totalPairs}`;
    }

    const answeredCount = stepDef.pairs.filter((pair) => {
      const radio = document.querySelector(`input[name="mais_importante_${pair.pairKey}"]:checked`);
      const sel = document.getElementById(`select_intensidade_${pair.pairKey}`);
      return radio && sel && sel.value;
    }).length;

    const ratio = document.getElementById(`pairRatio_${stepIndex}`);
    if (ratio) {
      ratio.textContent = `${answeredCount} of ${totalPairs} answered`;
    }

    // Update dots
    const dotsTrack = document.getElementById(`pairDots_${stepIndex}`);
    if (dotsTrack) {
      const dotButtons = dotsTrack.querySelectorAll(".pair-dot-btn");
      dotButtons.forEach((btn, idx) => {
        const pair = stepDef.pairs[idx];
        const radio = document.querySelector(`input[name="mais_importante_${pair.pairKey}"]:checked`);
        const sel = document.getElementById(`select_intensidade_${pair.pairKey}`);
        const isDone = Boolean(radio && sel && sel.value);

        btn.classList.toggle("is-current", idx === activeIdx);
        btn.classList.toggle("is-answered", isDone);
        btn.setAttribute("aria-current", idx === activeIdx ? "step" : "false");
      });
    }

    // Update mode buttons active state
    const singleBtn = container.querySelector(".btn-mode-single");
    const allBtn = container.querySelector(".btn-mode-all");
    if (singleBtn) singleBtn.classList.toggle("active", mode === "step");
    if (allBtn) allBtn.classList.toggle("active", mode === "all");
    singleBtn?.setAttribute("aria-pressed", String(mode === "step"));
    allBtn?.setAttribute("aria-pressed", String(mode === "all"));

    // In step mode, hide duplicate bottom step-nav-footer so only pair-step-nav-bar is shown
    const stepNavFooter = document.querySelector(`#stepView_${stepIndex} .step-nav-footer`);
    if (stepNavFooter) {
      stepNavFooter.classList.toggle("d-none", mode === "step");
    }

    // Update pair navigation buttons
    const prevBtn = container.querySelector(".btn-pair-step-prev");
    const nextBtn = container.querySelector(".btn-pair-step-next");
    const quickInfo = document.getElementById(`pairQuickInfo_${stepIndex}`);

    if (quickInfo) {
      quickInfo.textContent = `Pair ${activeIdx + 1} of ${totalPairs}`;
    }

    if (prevBtn) {
      if (activeIdx === 0) {
        prevBtn.innerHTML = `<i class="bi bi-arrow-left me-1"></i> Prev Step`;
      } else {
        prevBtn.innerHTML = `<i class="bi bi-arrow-left me-1"></i> Previous`;
      }
    }

    if (nextBtn) {
      if (activeIdx === totalPairs - 1) {
        nextBtn.innerHTML = `Next Step <i class="bi bi-arrow-right ms-1"></i>`;
      } else {
        nextBtn.innerHTML = `Next <i class="bi bi-arrow-right ms-1"></i>`;
      }
    }
  }

  /**
   * Sets up event listeners for 12axes-inspired pair step mode controls
   */
  function setupPairStepControls() {
    SURVEY_STEPS.forEach((step) => {
      if (step.type !== "comparisons" || !Array.isArray(step.pairs)) return;

      const stepIndex = step.stepIndex;
      const container = document.getElementById(`matrixContainer_step_${stepIndex}`);
      if (!container) return;

      // Prev Pair button
      const prevBtn = container.querySelector(".btn-pair-step-prev");
      if (prevBtn) {
        prevBtn.addEventListener("click", () => {
          if (stepActivePairIndex[stepIndex] > 0) {
            stepActivePairIndex[stepIndex]--;
            updatePairStepView(stepIndex);
            scrollActiveCardIntoView(stepIndex);
          } else {
            const prevStepBtn = document.querySelector(`#stepView_${stepIndex} .btn-step-prev`);
            if (prevStepBtn) prevStepBtn.click();
          }
        });
      }

      // Next Pair button
      const nextBtn = container.querySelector(".btn-pair-step-next");
      if (nextBtn) {
        nextBtn.addEventListener("click", () => {
          if (stepActivePairIndex[stepIndex] < step.pairs.length - 1) {
            stepActivePairIndex[stepIndex]++;
            updatePairStepView(stepIndex);
            scrollActiveCardIntoView(stepIndex);
          } else {
            const nextStepBtn = document.querySelector(`#stepView_${stepIndex} .btn-step-next`);
            if (nextStepBtn) nextStepBtn.click();
          }
        });
      }

      // Dots click
      const dotsTrack = document.getElementById(`pairDots_${stepIndex}`);
      if (dotsTrack) {
        dotsTrack.querySelectorAll(".pair-dot-btn").forEach((btn) => {
          btn.addEventListener("click", function () {
            const targetIdx = parseInt(this.getAttribute("data-index"), 10);
            if (!isNaN(targetIdx)) {
              stepActivePairIndex[stepIndex] = targetIdx;
              updatePairStepView(stepIndex);
              scrollActiveCardIntoView(stepIndex);
            }
          });
        });
      }

      // View mode toggle
      const modeButtons = container.querySelectorAll(".pair-mode-toggle button");
      modeButtons.forEach((btn) => {
        btn.addEventListener("click", function () {
          const mode = this.getAttribute("data-mode");
          stepViewMode[stepIndex] = mode;

          modeButtons.forEach((b) => b.classList.toggle("active", b === this));
          container.classList.toggle("mode-step", mode === "step");
          updatePairStepView(stepIndex);
        });
      });
    });
  }

  function scrollActiveCardIntoView(stepIndex) {
    if (typeof window === "undefined" || typeof document === "undefined") return;
    const card = document.querySelector(`#matrixContainer_step_${stepIndex} .is-active-card`);
    const stickyBar = document.querySelector(".sticky-progress-bar");
    const stickyHeight = stickyBar ? stickyBar.offsetHeight : 50;

    if (card && typeof card.getBoundingClientRect === "function") {
      const rect = card.getBoundingClientRect();
      // Only scroll if card is out of view or occluded by sticky bar
      if (rect.top < stickyHeight || rect.bottom > (window.innerHeight || 800)) {
        const targetY = (window.pageYOffset || document.documentElement.scrollTop || 0) + rect.top - stickyHeight - 10;
        window.scrollTo({ top: Math.max(0, targetY), behavior: "smooth" });
      }
    }
  }

  /**
   * Sets up change listeners on comparison inputs and auto-save
   */
  function setupComparisonEventListeners() {
    allPairs.forEach((pair) => {
      const { pairKey } = pair;
      const radios = document.querySelectorAll(`input[name="mais_importante_${pairKey}"]`);
      const select = document.getElementById(`select_intensidade_${pairKey}`);
      const label = document.getElementById(`label_intensidade_${pairKey}`);
      const card = document.getElementById(`card_${pairKey}`);
      const statusBadge = document.getElementById(`status_${pairKey}`);
      const intensityBlock = document.getElementById(`intensity_block_${pairKey}`);

      radios.forEach((radio) => {
        radio.addEventListener("change", function () {
          const chosenCode = this.getAttribute("data-chosen-code");

          // Visually unlock select container
          if (intensityBlock) {
            intensityBlock.classList.remove("is-disabled");
          }

          // Dynamic update of label text
          if (label) {
            label.innerHTML = `<i class="bi bi-unlock-fill me-1 text-primary"></i> 2. Degree of superiority of <span class="highlight-crit">${chosenCode}</span> over the other:`;
          }

          // Enable select
          if (select) {
            select.disabled = false;
            if (!select.value) {
              select.options[0].textContent = "Select degree of superiority...";
            }
          }

          checkSinglePairCompletion(pairKey, card, statusBadge, select);
          updateAllProgress();
          updateStepCompletionText(pair.stepIndex);
          updatePairStepView(pair.stepIndex);
          saveProgressToLocalStorage();

          // 12axes-inspired auto-advance if degree was already chosen
          if (select && select.value && getPairViewMode(pair.stepIndex) === "step") {
            const stepDef = SURVEY_STEPS.find((s) => s.stepIndex === pair.stepIndex);
            if (stepDef && Array.isArray(stepDef.pairs)) {
              const currentIdx = stepActivePairIndex[pair.stepIndex];
              if (currentIdx < stepDef.pairs.length - 1) {
                setTimeout(() => {
                  if (currentStep === pair.stepIndex && getPairViewMode(pair.stepIndex) === "step") {
                    stepActivePairIndex[pair.stepIndex] = currentIdx + 1;
                    updatePairStepView(pair.stepIndex);
                    scrollActiveCardIntoView(pair.stepIndex);
                  }
                }, 380);
              }
            }
          }
        });
      });

      if (select) {
        select.addEventListener("change", function () {
          checkSinglePairCompletion(pairKey, card, statusBadge, select);
          updateAllProgress();
          updateStepCompletionText(pair.stepIndex);
          updatePairStepView(pair.stepIndex);
          saveProgressToLocalStorage();

          // 12axes-inspired auto-advance in step mode if pair is fully completed
          const radioChecked = document.querySelector(`input[name="mais_importante_${pairKey}"]:checked`);
          if (radioChecked && select.value && getPairViewMode(pair.stepIndex) === "step") {
            const stepDef = SURVEY_STEPS.find((s) => s.stepIndex === pair.stepIndex);
            if (stepDef && Array.isArray(stepDef.pairs)) {
              const currentIdx = stepActivePairIndex[pair.stepIndex];
              if (currentIdx < stepDef.pairs.length - 1) {
                setTimeout(() => {
                  if (currentStep === pair.stepIndex && getPairViewMode(pair.stepIndex) === "step") {
                    stepActivePairIndex[pair.stepIndex] = currentIdx + 1;
                    updatePairStepView(pair.stepIndex);
                    scrollActiveCardIntoView(pair.stepIndex);
                  }
                }, 380);
              }
            }
          }
        });
      }
    });
  }

  /**
   * Sets up auto-save on expert identification fields and notes
   */
  function setupEvaluatorAutoSave() {
    const fields = ["evaluatorName", "evaluatorEmail", "evaluatorOrg", "evaluatorEducation", "evaluatorRole", "evaluatorNotes"];
    fields.forEach((fieldId) => {
      const el = document.getElementById(fieldId);
      if (el) {
        el.addEventListener("input", function () {
          saveProgressToLocalStorage();
          updateStepperVisual();
        });
      }
    });
  }

  /**
   * Sets up reset button listener with modal/confirm dialog
   */
  function setupResetListener() {
    const btnResetHero = document.getElementById("btnResetHero");

    if (btnResetHero) {
      btnResetHero.addEventListener("click", function (e) {
        e.preventDefault();
        const modalEl = document.getElementById("resetConfirmModal");
        if (modalEl && typeof bootstrap !== "undefined") {
          const modalInstance = bootstrap.Modal.getOrCreateInstance(modalEl);
          modalInstance.show();
        } else {
          // Native confirmation fallback if bootstrap modal is not initialized
          const confirmed = window.confirm(
            "Confirmation: Are you sure you want to reset the entire questionnaire?\n\nAll data saved in the browser will be cleared and the page will be reloaded."
          );
          if (confirmed) {
            resetAllProgress();
          }
        }
      });
    }

    if (confirmResetBtn) {
      confirmResetBtn.addEventListener("click", function () {
        resetAllProgress();
      });
    }
  }

  /**
   * Checks completion state of a single pair
   */
  function checkSinglePairCompletion(pairKey, card, statusBadge, select) {
    const radioChecked = document.querySelector(`input[name="mais_importante_${pairKey}"]:checked`);
    const selectValue = select ? select.value : "";

    if (radioChecked && selectValue) {
      if (card) card.classList.add("is-completed");
      if (statusBadge) {
        statusBadge.textContent = "Answered ✓";
        statusBadge.className = "badge bg-success badge-status";
      }
    } else if (radioChecked) {
      if (card) card.classList.remove("is-completed");
      if (statusBadge) {
        statusBadge.textContent = "Set degree";
        statusBadge.className = "badge bg-warning text-dark badge-status";
      }
    } else {
      if (card) card.classList.remove("is-completed");
      if (statusBadge) {
        statusBadge.textContent = "Pending";
        statusBadge.className = "badge bg-light text-secondary border badge-status";
      }
    }
  }

  /**
   * Sets up navigation event listeners for next and back buttons
   */
  function setupNavigationEventListeners() {
    // Step 1 Next button
    const btnNextStep1 = document.getElementById("btnNextStep1");
    if (btnNextStep1) {
      btnNextStep1.addEventListener("click", function () {
        if (validateEvaluatorData()) {
          goToStep(2);
        }
      });
    }

    // Generic "Next" buttons
    const nextButtons = document.querySelectorAll(".btn-step-next");
    nextButtons.forEach((btn) => {
      btn.addEventListener("click", function () {
        const target = parseInt(this.getAttribute("data-target-step"), 10);

        // User must answer step 1 before advancing to others
        if (target > 1 && !validateEvaluatorData()) {
          goToStep(1, true);
          return;
        }

        // Free navigation between steps 2 to 9
        goToStep(target);
      });
    });

    // Generic "Back" buttons
    const prevButtons = document.querySelectorAll(".btn-step-prev");
    prevButtons.forEach((btn) => {
      btn.addEventListener("click", function () {
        const target = parseInt(this.getAttribute("data-target-step"), 10);
        goToStep(target);
      });
    });

    // Form submission: requires 100% completion of all previous steps
    if (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();

        // 1. Mandatory validation of Step 1 (Expert)
        if (!validateEvaluatorData()) {
          goToStep(1, true);
          highlightStepError(1, 6000);
          return;
        }

        // 2. Mandatory validation of all comparison steps (2 to 8) for submission
        let firstIncompleteStep = null;
        let firstIncompletePair = null;
        let totalMissing = 0;
        const incompleteStepIndexes = [];

        for (const stepDef of comparisonSteps) {
          if (!isStepEnabled(stepDef.stepIndex)) continue;
          if (stepDef && stepDef.type === "comparisons" && Array.isArray(stepDef.pairs)) {
            const missingInStep = stepDef.pairs.filter((pair) => {
              const radioChecked = document.querySelector(`input[name="mais_importante_${pair.pairKey}"]:checked`);
              const select = document.getElementById(`select_intensidade_${pair.pairKey}`);
              return !radioChecked || !select || !select.value;
            });

            if (missingInStep.length > 0) {
              totalMissing += missingInStep.length;
              incompleteStepIndexes.push(stepDef.stepIndex);
              if (!firstIncompleteStep) {
                firstIncompleteStep = stepDef;
                firstIncompletePair = missingInStep[0];
              }
            }
          }
        }

        // If there are pending comparisons in any step
        if (firstIncompleteStep && firstIncompletePair) {
          // Highlight steps with missing answers with red outline for 6 seconds
          incompleteStepIndexes.forEach((stepIdx) => {
            highlightStepError(stepIdx, 6000);
          });

          goToStep(firstIncompleteStep.stepIndex);

          const cardElement = document.getElementById(`card_${firstIncompletePair.pairKey}`);
          showAlert(
            `To submit the survey, answer Main Criteria and all selected sub-criteria steps. Responses are missing in <strong>Step ${firstIncompleteStep.stepIndex}: ${firstIncompleteStep.title}</strong> (Total pending: ${totalMissing} comparison(s)).`,
            "danger"
          );

          if (cardElement) {
            cardElement.scrollIntoView({ behavior: "smooth", block: "center" });
            cardElement.classList.add("highlight-invalid-card");
            setTimeout(() => cardElement.classList.remove("highlight-invalid-card"), 6000);
          }
          return;
        }

        // All steps 100% answered -> Submit
        submitSurveyForm(form);
      });
    }
  }

  /**
   * Applies red border outline to step with missing answers for specified duration
   */
  function highlightStepError(stepIndex, duration = 6000) {
    const pill = document.getElementById(`stepperPill_${stepIndex}`);
    if (pill) {
      pill.classList.add("step-error-outline");
      setTimeout(() => {
        pill.classList.remove("step-error-outline");
      }, duration);
    }
  }

  /**
   * Validates expert information (Step 1)
   */
  function validateEvaluatorData() {
    clearAlert();
    const nameInput = document.getElementById("evaluatorName");
    const emailInput = document.getElementById("evaluatorEmail");
    const educationInput = document.getElementById("evaluatorEducation");

    if (!nameInput || !nameInput.value.trim()) {
      showAlert("Please enter your <strong>Full Name</strong> in Step 1 before proceeding.", "warning");
      if (nameInput) nameInput.focus();
      return false;
    }

    if (!emailInput || !emailInput.value.trim() || !validateEmailFormat(emailInput.value.trim())) {
      showAlert("Please enter a valid institutional or professional <strong>Email</strong> in Step 1 before proceeding.", "warning");
      if (emailInput) emailInput.focus();
      return false;
    }

    if (!educationInput || !educationInput.value.trim()) {
      showAlert("Please enter your <strong>Academic Background / Qualifications</strong> in Step 1 before proceeding.", "warning");
      if (educationInput) educationInput.focus();
      return false;
    }

    const missingConfidence = comparisonSteps.find((step) => !getConfidence(step));
    if (missingConfidence) {
      showAlert(`Please select your <strong>confidence level</strong> for ${missingConfidence.navTitle} in Step 1 before proceeding.`, "warning");
      document.querySelector(`input[name="confianca_${missingConfidence.groupKey}"]`)?.focus();
      return false;
    }

    return true;
  }

  /**
   * Navigates to the designated step
   */
  function goToStep(targetStep, preserveAlert = false) {
    if (targetStep < 1 || targetStep > totalSteps || !isStepEnabled(targetStep)) return;

    // Hide current step
    const currentView = document.getElementById(`stepView_${currentStep}`);
    if (currentView) {
      if (typeof bootstrap !== "undefined") {
        currentView.querySelectorAll(".criterion-help-trigger").forEach((button) => {
          bootstrap.Popover?.getInstance(button)?.hide();
          bootstrap.Tooltip?.getInstance(button)?.hide();
        });
      }
      currentView.classList.remove("active");
    }

    // Show target step
    const targetView = document.getElementById(`stepView_${targetStep}`);
    if (targetView) {
      targetView.classList.add("active");
    }

    currentStep = targetStep;
    if (typeof document !== "undefined" && document.body) {
      document.body.classList.toggle("in-evaluation-mode", targetStep >= 2 && targetStep <= 7);
    }
    if (!preserveAlert) clearAlert();

    // If entering a comparison step, focus on first unanswered pair and update view
    if (targetStep >= 2 && targetStep <= 7) {
      const stepDef = SURVEY_STEPS.find((s) => s.stepIndex === targetStep);
      if (stepDef && Array.isArray(stepDef.pairs)) {
        const firstUnanswered = stepDef.pairs.findIndex((pair) => {
          const r = document.querySelector(`input[name="mais_importante_${pair.pairKey}"]:checked`);
          const s = document.getElementById(`select_intensidade_${pair.pairKey}`);
          return !r || !s || !s.value;
        });
        if (firstUnanswered !== -1) {
          stepActivePairIndex[targetStep] = firstUnanswered;
        }
        updatePairStepView(targetStep);
      }
    }

    // Update horizontal Stepper visual
    updateStepperVisual();

    // If final step (Review and Submit), refresh summary
    if (currentStep === totalSteps) {
      updateReviewSummary();
    }

    // Save current step to Local Storage
    saveProgressToLocalStorage();

    // Smooth scroll to top of main container
    const mainContainer = document.querySelector(".main-container");
    if (mainContainer) {
      mainContainer.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  /**
   * Updates active/completed classes on Stepper buttons
   */
  function updateStepperVisual() {
    const nameVal = document.getElementById("evaluatorName")?.value.trim();
    const emailVal = document.getElementById("evaluatorEmail")?.value.trim();
    const educationVal = document.getElementById("evaluatorEducation")?.value.trim();
    const isProfileComplete = Boolean(nameVal && emailVal && validateEmailFormat(emailVal) && educationVal &&
      comparisonSteps.every((item) => getConfidence(item)));

    SURVEY_STEPS.forEach((step) => {
      const pill = document.getElementById(`stepperPill_${step.stepIndex}`);
      const checkEl = document.getElementById(`stepperCheck_${step.stepIndex}`);
      if (!pill) return;

      const isCurrent = step.stepIndex === currentStep;
      let isCompleted = false;

      if (step.stepIndex === 1) {
        isCompleted = isProfileComplete;
      } else if (step.type === "comparisons" && Array.isArray(step.pairs)) {
        const answeredInStep = step.pairs.filter((pair) => {
          const radio = document.querySelector(`input[name="mais_importante_${pair.pairKey}"]:checked`);
          const sel = document.getElementById(`select_intensidade_${pair.pairKey}`);
          return radio && sel && sel.value;
        }).length;
        isCompleted = answeredInStep === step.pairs.length;
      }

      pill.classList.toggle("active", isCurrent);
      pill.setAttribute("aria-current", isCurrent ? "step" : "false");
      const enabled = isStepEnabled(step.stepIndex);
      const mobileOption = mobileStepSelect?.querySelector(`option[value="${step.stepIndex}"]`);
      if (mobileOption) mobileOption.disabled = !enabled;
      pill.disabled = !enabled;
      pill.setAttribute("aria-disabled", String(!enabled));
      pill.title = enabled ? step.title : `${step.title} — Not answering (change in Step 1)`;
      pill.classList.toggle("is-completed", enabled && isCompleted);

      if (checkEl) {
        if (!enabled) {
          checkEl.innerHTML = '<i class="bi bi-dash-circle" aria-label="Not answering"></i>';
        } else if (isCompleted) {
          checkEl.innerHTML = `<i class="bi bi-check-circle-fill"></i>`;
        } else {
          checkEl.innerHTML = "";
        }
      }
    });

    // Update textual indicator on top of sticky bar
    const currentStepDef = SURVEY_STEPS.find((s) => s.stepIndex === currentStep);
    if (currentStepBadge) {
      currentStepBadge.textContent = `Step ${currentStep} of ${totalSteps}`;
    }
    if (currentStepName && currentStepDef) {
      currentStepName.textContent = currentStepDef.title;
    }
    if (mobileStepSelect) {
      mobileStepSelect.value = String(currentStep);
      mobileStepSelect.disabled = !isProfileComplete;
      if (isProfileComplete) {
        mobileStepSelect.removeAttribute("aria-describedby");
      } else {
        mobileStepSelect.setAttribute("aria-describedby", "mobileStepSelectHelp");
      }
    }
    const mobileStepSelectHelp = document.getElementById("mobileStepSelectHelp");
    if (mobileStepSelectHelp) mobileStepSelectHelp.hidden = isProfileComplete;

    // Auto-scroll the active stepper pill into view horizontally on mobile
    const activePill = document.getElementById(`stepperPill_${currentStep}`);
    if (activePill && activePill.getClientRects().length && typeof activePill.scrollIntoView === "function") {
      activePill.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  }

  /**
   * Updates overall progress bar and progress text
   */
  function updateAllProgress() {
    let completedTotal = 0;
    const activePairs = allPairs.filter((pair) => isStepEnabled(pair.stepIndex));

    activePairs.forEach((pair) => {
      const radio = document.querySelector(`input[name="mais_importante_${pair.pairKey}"]:checked`);
      const select = document.getElementById(`select_intensidade_${pair.pairKey}`);
      if (radio && select && select.value) {
        completedTotal++;
      }
    });

    const percentage = Math.round((completedTotal / activePairs.length) * 100);

    // Custom CSS variable (100% free of inline styles on HTML elements)
    document.documentElement.style.setProperty("--progress-percentage", `${percentage}%`);

    if (progressBar) {
      progressBar.setAttribute("aria-valuenow", percentage);
    }

    if (progressText) {
      progressText.textContent = `${completedTotal} of ${activePairs.length} comparisons completed (${percentage}%)`;
    }

    // Update stepper buttons
    updateStepperVisual();
  }

  /**
   * Updates answered count in step footer
   */
  function updateStepCompletionText(stepIndex) {
    const indicator = document.getElementById(`stepCompletion_${stepIndex}`);
    const stepDef = SURVEY_STEPS.find((s) => s.stepIndex === stepIndex);
    if (indicator && stepDef && Array.isArray(stepDef.pairs)) {
      if (!isStepEnabled(stepIndex)) {
        indicator.textContent = "Not answering";
        return;
      }
      const answeredInStep = stepDef.pairs.filter((pair) => {
        const radio = document.querySelector(`input[name="mais_importante_${pair.pairKey}"]:checked`);
        const sel = document.getElementById(`select_intensidade_${pair.pairKey}`);
        return radio && sel && sel.value;
      }).length;
      indicator.textContent = `${answeredInStep} of ${stepDef.pairs.length} answered`;
    }
  }

  /**
   * Updates Step 9 (Review and Submit) summary panel
   */
  function updateReviewSummary() {
    const nameInput = document.getElementById("evaluatorName");
    const emailInput = document.getElementById("evaluatorEmail");
    const orgInput = document.getElementById("evaluatorOrg");
    const roleInput = document.getElementById("evaluatorRole");

    const summaryName = document.getElementById("summaryName");
    const summaryEmail = document.getElementById("summaryEmail");
    const summaryOrg = document.getElementById("summaryOrg");
    const summaryRole = document.getElementById("summaryRole");
    const summaryGroupsStatus = document.getElementById("summaryGroupsStatus");

    if (summaryName) summaryName.textContent = nameInput?.value.trim() || "Not provided";
    if (summaryEmail) summaryEmail.textContent = emailInput?.value.trim() || "Not provided";
    if (summaryOrg) summaryOrg.textContent = orgInput?.value.trim() || "-";
    if (summaryRole) summaryRole.textContent = roleInput?.value.trim() || "-";
    const summaryEducation = document.getElementById("summaryEducation");
    if (summaryEducation) summaryEducation.textContent = document.getElementById("evaluatorEducation")?.value.trim() || "-";

    if (summaryGroupsStatus) {
      let html = "";
      SURVEY_STEPS.forEach((step) => {
        if (step.type === "comparisons" && Array.isArray(step.pairs)) {
          const totalPairs = step.pairs.length;
          const answered = step.pairs.filter((pair) => {
            const radio = document.querySelector(`input[name="mais_importante_${pair.pairKey}"]:checked`);
            const sel = document.getElementById(`select_intensidade_${pair.pairKey}`);
            return radio && sel && sel.value;
          }).length;

          const isFull = answered === totalPairs;
          const enabled = isStepEnabled(step.stepIndex);
          const confidenceLabel = confidenceLevels.find((level) => level.value === getConfidence(step))?.label || "Not selected";
          const badgeClass = !enabled ? "bg-secondary" : isFull ? "bg-success" : "bg-warning text-dark";
          const icon = !enabled ? '' : isFull ? '<i class="bi bi-check-circle-fill me-1"></i>' : '<i class="bi bi-hourglass-split me-1"></i>';

          html += `
            <div class="col-md-6 mb-2">
              <button type="button" class="btn w-100 p-2 border rounded bg-light-subtle d-flex justify-content-between align-items-center review-step-btn text-start shadow-none" data-target-step="${step.stepIndex}" ${enabled ? '' : 'disabled'} title="${enabled ? 'Click to navigate to the evaluation' : 'Change your selection in Step 1'}: ${step.navTitle}">
                <span class="me-2 fw-semibold text-dark">
                  <span class="badge ${step.badgeClass || 'bg-secondary'} me-1">${step.codeBadge}</span>
                  ${step.navTitle}
                  <span class="d-block small text-secondary fw-normal">${confidenceLabel}</span>
                </span>
                <span class="badge ${badgeClass}">${icon}${enabled ? `${answered}/${totalPairs}` : 'Not answering'}</span>
              </button>
            </div>
          `;
        }
      });
      summaryGroupsStatus.innerHTML = html;

      // Listener for direct navigation from summary buttons
      const reviewBtns = summaryGroupsStatus.querySelectorAll(".review-step-btn");
      reviewBtns.forEach((btn) => {
        btn.addEventListener("click", function () {
          const stepTarget = parseInt(this.getAttribute("data-target-step"), 10);
          if (stepTarget) {
            goToStep(stepTarget);
          }
        });
      });
    }
  }

  /**
   * Saves current questionnaire state to Local Storage
   */
  function saveProgressToLocalStorage() {
    try {
      const data = {
        criteriaVersion: SURVEY_VERSION,
        timestamp: new Date().toISOString(),
        currentStep: currentStep,
        evaluator: {
          name: document.getElementById("evaluatorName")?.value || "",
          email: document.getElementById("evaluatorEmail")?.value || "",
          instituicao: document.getElementById("evaluatorOrg")?.value || "",
          formacao: document.getElementById("evaluatorEducation")?.value || "",
          area_atuacao: document.getElementById("evaluatorRole")?.value || "",
          message: document.getElementById("evaluatorNotes")?.value || ""
        },
        comparisons: {},
        confidence: Object.fromEntries(comparisonSteps.map((step) => [step.groupKey, getConfidence(step)]))
      };

      allPairs.forEach((pair) => {
        const radioChecked = document.querySelector(`input[name="mais_importante_${pair.pairKey}"]:checked`);
        const select = document.getElementById(`select_intensidade_${pair.pairKey}`);
        if (radioChecked || (select && select.value)) {
          data.comparisons[pair.pairKey] = {
            chosenValue: radioChecked ? radioChecked.value : null,
            chosenCode: radioChecked ? radioChecked.getAttribute("data-chosen-code") : null,
            otherName: radioChecked ? radioChecked.getAttribute("data-other") : null,
            intensity: select && select.value ? select.value : null
          };
        }
      });

      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      updateSaveIndicator(true);
    } catch (err) {
      console.warn("Warning: unable to save to localStorage:", err);
    }
  }

  /**
   * Updates visual auto-save indicator
   */
  function updateSaveIndicator(isSaved) {
    if (!saveStatusText || !saveStatusIcon) return;
    if (isSaved) {
      saveStatusIcon.className = "bi bi-cloud-check text-success";
      saveStatusText.textContent = "Saved locally";
    } else {
      saveStatusIcon.className = "bi bi-arrow-repeat text-warning";
      saveStatusText.textContent = "Saving...";
    }
  }

  /**
   * Restores user progress from Local Storage
   */
  function loadProgressFromLocalStorage() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return false;

      const data = JSON.parse(raw);
      if (!data) return false;
      const sameCriteria = data.criteriaVersion === SURVEY_VERSION;

      if (!sameCriteria && data.comparisons && Object.keys(data.comparisons).length) {
        // Preserve the old draft separately; reused codes now refer to different topics.
        localStorage.setItem(`${STORAGE_KEY}_previous_criteria`, raw);
      }

      // 1. Restore expert details
      if (data.evaluator) {
        const nameInput = document.getElementById("evaluatorName");
        const emailInput = document.getElementById("evaluatorEmail");
        const orgInput = document.getElementById("evaluatorOrg");
        const roleInput = document.getElementById("evaluatorRole");
        const notesInput = document.getElementById("evaluatorNotes");
        const educationInput = document.getElementById("evaluatorEducation");

        if (nameInput && data.evaluator.name) nameInput.value = data.evaluator.name;
        if (emailInput && data.evaluator.email) emailInput.value = data.evaluator.email;
        if (orgInput && data.evaluator.instituicao) orgInput.value = data.evaluator.instituicao;
        if (roleInput && data.evaluator.area_atuacao) roleInput.value = data.evaluator.area_atuacao;
        if (notesInput && data.evaluator.message) notesInput.value = data.evaluator.message;
        if (educationInput && data.evaluator.formacao) educationInput.value = data.evaluator.formacao;
      }

      // Confidence choices and judgments must belong to the current criteria.
      if (sameCriteria) {
        comparisonSteps.forEach((step) => {
          const radios = document.querySelectorAll(`input[name="confianca_${step.groupKey}"]`);
          radios.forEach((radio) => {
            radio.checked = radio.value === data.confidence?.[step.groupKey];
            if (radio.checked) topicConfidence[step.groupKey] = radio.value;
          });
        });
      }

      // 2. Restore pairwise comparisons
      let restoredComparisons = 0;
      if (sameCriteria && data.comparisons) {
        allPairs.forEach((pair) => {
          const saved = data.comparisons[pair.pairKey];
          if (!saved) return;

          const radios = document.querySelectorAll(`input[name="mais_importante_${pair.pairKey}"]`);
          radios.forEach((radio) => {
            if (radio.value === saved.chosenValue) {
              radio.checked = true;

              const intensityBlock = document.getElementById(`intensity_block_${pair.pairKey}`);
              const label = document.getElementById(`label_intensidade_${pair.pairKey}`);
              const select = document.getElementById(`select_intensidade_${pair.pairKey}`);
              const chosenCode = radio.getAttribute("data-chosen-code");

              if (intensityBlock) {
                intensityBlock.classList.remove("is-disabled");
              }
              if (label) {
                label.innerHTML = `<i class="bi bi-unlock-fill me-1 text-primary"></i> 2. Degree of superiority of <span class="highlight-crit">${chosenCode}</span> over the other:`;
              }
              if (select) {
                select.disabled = false;
                if (saved.intensity) {
                  select.value = saved.intensity;
                }
              }

              const card = document.getElementById(`card_${pair.pairKey}`);
              const statusBadge = document.getElementById(`status_${pair.pairKey}`);
              checkSinglePairCompletion(pair.pairKey, card, statusBadge, select);
              restoredComparisons++;
            }
          });
        });
      }

      applyTopicPreferences();
      for (let s = 2; s <= 7; s++) {
        updatePairStepView(s);
      }

      // Existing drafts without the new required fields must revisit Step 1.
      const hasProfile = document.getElementById("evaluatorName")?.value.trim() &&
        validateEmailFormat(document.getElementById("evaluatorEmail")?.value.trim() || "") &&
        document.getElementById("evaluatorEducation")?.value.trim() &&
        comparisonSteps.every((step) => getConfidence(step));
      if (sameCriteria && hasProfile && data.currentStep && data.currentStep > 1 && data.currentStep <= totalSteps && isStepEnabled(data.currentStep)) {
        goToStep(data.currentStep);
      }

      // If relevant data was restored, show informational notice
      if (!sameCriteria && data.evaluator?.name) {
        showAlert("The survey criteria have changed. Your expert information was restored. Please review your confidence levels and answer the updated comparisons.", "info");
      } else if (restoredComparisons > 0 || (data.evaluator && data.evaluator.name)) {
        showRestoredNotification(restoredComparisons);
      }

      return true;
    } catch (err) {
      console.warn("Error restoring progress from localStorage:", err);
      return false;
    }
  }

  /**
   * Displays subtle restored progress notification
   */
  function showRestoredNotification(count) {
    if (!validationAlert) return;
    validationAlert.innerHTML = `
      <div class="alert alert-info alert-dismissible fade show shadow-sm py-2 px-3 small d-flex justify-content-between align-items-center" role="alert">
        <div>
          <i class="bi bi-cloud-check-fill me-2 text-primary"></i>
          <strong>Progress restored:</strong> Your previous responses (${count} comparisons) were restored from your browser's local storage.
        </div>
        <button type="button" class="btn-close py-2" data-bs-dismiss="alert" aria-label="Close"></button>
      </div>
    `;
  }

  /**
   * Clears Local Storage progress and resets form and page
   */
  function resetAllProgress() {
    try {
      localStorage.clear();
      sessionStorage.clear();
      sessionStorage.setItem("ahp_survey_just_reset", "true");
    } catch (err) {
      console.warn("Error clearing storage:", err);
    }

    if (form) {
      try {
        form.reset();
      } catch (e) {}
    }

    // Close confirmation modal if open
    const modalEl = document.getElementById("resetConfirmModal");
    if (modalEl && typeof bootstrap !== "undefined") {
      const modalInstance = bootstrap.Modal.getInstance(modalEl);
      if (modalInstance) modalInstance.hide();
    }

    // Reload page from fresh state
    window.location.href = window.location.pathname;
  }

  /**
   * Submits form data via Web3Forms
   */
  function submitSurveyForm(formElement) {
    const submitBtn = document.getElementById("submitBtn");
    const originalBtnText = submitBtn.innerHTML;

    submitBtn.disabled = true;
    submitBtn.innerHTML = `
      <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
      Submitting all evaluations...
    `;

    const formData = new FormData(formElement);
    const object = Object.fromEntries(formData.entries());
    const json = JSON.stringify(object);

    fetch(formElement.action, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: json
    })
      .then(async (response) => {
        let data = null;
        const text = await response.text();
        try {
          data = JSON.parse(text);
        } catch (parseError) {
          if (text.includes("Form submitted successfully") || text.includes("success") || response.status === 200) {
            data = { success: true };
          }
        }

        if (response.ok && (data?.success === true || response.status === 200)) {
          // Clear LocalStorage to allow clean subsequent filling
          try {
            localStorage.removeItem(STORAGE_KEY);
          } catch (e) {}

          showSuccessModal();
        } else {
          formElement.submit();
        }
      })
      .catch((error) => {
        console.warn("AJAX submit fallback to native POST:", error);
        formElement.submit();
      })
      .finally(() => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
      });
  }

  /**
   * Displays successful submission confirmation modal
   */
  function showSuccessModal() {
    const successModalElement = document.getElementById("successModal");
    if (successModalElement && typeof bootstrap !== "undefined") {
      const modal = new bootstrap.Modal(successModalElement);
      modal.show();
    } else {
      alert("Evaluations submitted successfully! Thank you very much for your contribution.");
    }
  }

  /**
   * Displays validation alerts in global alert container
   */
  function showAlert(message, type = "danger") {
    if (!validationAlert) return;

    validationAlert.innerHTML = `
      <div class="alert alert-${type} alert-dismissible fade show shadow-sm" role="alert">
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      </div>
    `;
    validationAlert.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function clearAlert() {
    if (validationAlert) {
      validationAlert.innerHTML = "";
    }
  }

  function validateEmailFormat(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
});
