/**
 * AgriSurvey - Survey Wizard Engine
 * Handles 8-step wizard navigation, option card selection, conditional logic,
 * draft auto-save, and submission to localStorage.
 */

let currentStep = 1;
const TOTAL_STEPS = 8;

const STEP_TITLES = [
  'Farmer Profile',
  'Farming & Land',
  'Crop Cultivation',
  'Water & Electricity',
  'Fertilizer & Climate',
  'Finance & Loans',
  'Harvest & Profit',
  'Tech & Feedback'
];

// Initialize on DOM Load
document.addEventListener('DOMContentLoaded', () => {
  // Guard: require authentication
  if (!requireAuth('login.html')) return;

  initSurveyUI();
  restoreSavedDraftOrUser();
  setupOptionCardClicks();
  setupConditionalToggles();
  setupRatingButtons();
  setupQuickDemoFill();
});

// Setup Stepper & Step visibility
function initSurveyUI() {
  updateStepVisibility(currentStep);

  // Stepper label click listeners
  document.querySelectorAll('.step-label-item').forEach((item) => {
    item.addEventListener('click', () => {
      const stepTarget = parseInt(item.dataset.step);
      if (stepTarget <= currentStep) {
        goToStep(stepTarget);
      }
    });
  });

  // Action buttons
  const prevBtn = document.getElementById('btn-prev-step');
  const nextBtn = document.getElementById('btn-next-step');
  const saveBtn = document.getElementById('btn-save-draft');
  const submitBtn = document.getElementById('btn-submit-survey');

  if (prevBtn) prevBtn.addEventListener('click', prevStep);
  if (nextBtn) nextBtn.addEventListener('click', nextStep);
  if (saveBtn) saveBtn.addEventListener('click', () => saveProgress(true));
  if (submitBtn) submitBtn.addEventListener('click', submitSurvey);
}

// Switch between steps
function goToStep(stepNum) {
  if (stepNum < 1 || stepNum > TOTAL_STEPS) return;
  currentStep = stepNum;
  updateStepVisibility(currentStep);
  window.scrollTo({ top: 120, behavior: 'smooth' });
}

function updateStepVisibility(stepNum) {
  // Update step cards
  for (let i = 1; i <= TOTAL_STEPS; i++) {
    const section = document.getElementById(`survey-step-${i}`);
    if (section) {
      section.style.display = i === stepNum ? 'block' : 'none';
    }
  }

  // Update Stepper Progress Bar
  const percent = Math.round((stepNum / TOTAL_STEPS) * 100);
  const fill = document.getElementById('progress-fill');
  if (fill) fill.style.width = `${percent}%`;

  const badge = document.getElementById('stepper-badge');
  if (badge) badge.textContent = `Step ${stepNum} of ${TOTAL_STEPS} (${percent}% Complete)`;

  // Update Step label dots
  document.querySelectorAll('.step-label-item').forEach((item) => {
    const s = parseInt(item.dataset.step);
    item.classList.remove('active', 'completed');
    if (s === stepNum) {
      item.classList.add('active');
    } else if (s < stepNum) {
      item.classList.add('completed');
    }
  });

  // Update Footer buttons
  const prevBtn = document.getElementById('btn-prev-step');
  const nextBtn = document.getElementById('btn-next-step');
  const submitBtn = document.getElementById('btn-submit-survey');

  if (prevBtn) {
    prevBtn.style.display = stepNum === 1 ? 'none' : 'inline-flex';
  }

  if (nextBtn) {
    nextBtn.style.display = stepNum === TOTAL_STEPS ? 'none' : 'inline-flex';
  }

  if (submitBtn) {
    submitBtn.style.display = stepNum === TOTAL_STEPS ? 'inline-flex' : 'none';
  }
}

// Next Step with Validation
function nextStep() {
  if (validateCurrentStep(currentStep)) {
    saveProgress(false); // auto-save silently
    goToStep(currentStep + 1);
  } else {
    showToast('Please answer the required questions before continuing.', 'error');
  }
}

// Previous Step
function prevStep() {
  saveProgress(false);
  goToStep(currentStep - 1);
}

// Validate fields in the active step
function validateCurrentStep(step) {
  let isValid = true;
  const currentSection = document.getElementById(`survey-step-${step}`);
  if (!currentSection) return true;

  Validator.clearAllErrors(currentSection);

  // Step 1: Validate Demographics
  if (step === 1) {
    const name = document.getElementById('farmer-name');
    const age = document.getElementById('farmer-age');
    const mobile = document.getElementById('farmer-mobile');
    const district = document.getElementById('farmer-district');
    const state = document.getElementById('farmer-state');

    if (!Validator.isRequired(name.value)) {
      Validator.setError(name, 'Full name is required');
      isValid = false;
    }
    if (!Validator.isRequired(age.value) || parseInt(age.value) < 18) {
      Validator.setError(age, 'Valid age (18+) is required');
      isValid = false;
    }
    if (!Validator.isRequired(mobile.value) || !Validator.isValidPhone(mobile.value)) {
      Validator.setError(mobile, 'Valid 10-digit mobile required');
      isValid = false;
    }
    if (!Validator.isRequired(district.value)) {
      Validator.setError(district, 'District is required');
      isValid = false;
    }
    if (!Validator.isRequired(state.value)) {
      Validator.setError(state, 'State is required');
      isValid = false;
    }
  }

  // Check required radio groups in current step
  const radioGroups = new Set();
  currentSection.querySelectorAll('input[type="radio"][data-required="true"]').forEach(r => {
    radioGroups.add(r.name);
  });

  radioGroups.forEach(groupName => {
    const checked = currentSection.querySelector(`input[name="${groupName}"]:checked`);
    if (!checked) {
      isValid = false;
      const firstInput = currentSection.querySelector(`input[name="${groupName}"]`);
      if (firstInput) {
        const questionItem = firstInput.closest('.question-item');
        if (questionItem) {
          questionItem.style.borderLeft = '3px solid var(--danger)';
          questionItem.style.paddingLeft = '0.75rem';
        }
      }
    }
  });

  return isValid;
}

// Option Card Click Sync
function setupOptionCardClicks() {
  document.querySelectorAll('.option-card').forEach(card => {
    card.addEventListener('click', (e) => {
      const input = card.querySelector('input');
      if (!input) return;

      if (e.target !== input) {
        if (input.type === 'radio') {
          input.checked = true;
          input.dispatchEvent(new Event('change', { bubbles: true }));
        } else if (input.type === 'checkbox') {
          input.checked = !input.checked;
          input.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }

      refreshOptionCardVisuals();
    });
  });

  // Attach change listener to all inputs
  document.querySelectorAll('.option-card input').forEach(input => {
    input.addEventListener('change', () => {
      refreshOptionCardVisuals();
      const questionItem = input.closest('.question-item');
      if (questionItem) {
        questionItem.style.borderLeft = '';
        questionItem.style.paddingLeft = '';
      }
    });
  });
}

function refreshOptionCardVisuals() {
  document.querySelectorAll('.option-card').forEach(card => {
    const input = card.querySelector('input');
    if (input && input.checked) {
      card.classList.add('selected');
    } else {
      card.classList.remove('selected');
    }
  });
}

// Conditional fields toggling
function setupConditionalToggles() {
  // Q28 Loan Details Toggle
  const loanRadios = document.querySelectorAll('input[name="q28_loan"]');
  const loanBox = document.getElementById('conditional-loan-box');

  loanRadios.forEach(r => {
    r.addEventListener('change', () => {
      if (loanBox) {
        if (r.value === 'Yes' && r.checked) {
          loanBox.classList.add('visible');
        } else {
          loanBox.classList.remove('visible');
        }
      }
    });
  });

  // "Other" reveal inputs
  setupOtherInputToggle('q4_crop', 'q4_crop_other_box');
  setupOtherInputToggle('q8_reason', 'q8_reason_other_box');
  setupOtherInputToggle('q9_water_source', 'q9_water_source_other_box');
  setupOtherInputToggle('q25_biggest_expense', 'q25_expense_other_box');
  setupOtherInputToggle('q32_harvest_loss_reason', 'q32_loss_reason_other_box');
  setupOtherInputToggle('q35_sell_location', 'q35_sell_location_other_box');
}

function setupOtherInputToggle(radioName, boxId) {
  const radios = document.querySelectorAll(`input[name="${radioName}"]`);
  const box = document.getElementById(boxId);
  if (!box) return;

  radios.forEach(r => {
    r.addEventListener('change', () => {
      if (r.value === 'Other' && r.checked) {
        box.classList.add('visible');
      } else {
        box.classList.remove('visible');
      }
    });
  });
}

// Rating Buttons (Q49)
function setupRatingButtons() {
  const ratingBtns = document.querySelectorAll('.rating-btn');
  const ratingInput = document.getElementById('q49_satisfaction_input');

  ratingBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const val = btn.dataset.val;
      if (ratingInput) ratingInput.value = val;
      ratingBtns.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
    });
  });
}

// Serialize full survey state
function serializeSurveyData() {
  const form = document.getElementById('survey-form');
  if (!form) return {};

  const formData = new FormData(form);
  const data = {};

  // Store all keys
  for (let [key, value] of formData.entries()) {
    if (data[key]) {
      if (Array.isArray(data[key])) {
        data[key].push(value);
      } else {
        data[key] = [data[key], value];
      }
    } else {
      data[key] = value;
    }
  }

  // Explicit rating value
  const ratingInput = document.getElementById('q49_satisfaction_input');
  if (ratingInput && ratingInput.value) {
    data['q49_satisfaction'] = ratingInput.value;
  }

  return data;
}

// Save Progress to localStorage
function saveProgress(showToastNotification = true) {
  const data = serializeSurveyData();
  localStorage.setItem('agrisurvey_draft', JSON.stringify({
    step: currentStep,
    updatedAt: new Date().toISOString(),
    data: data
  }));

  if (showToastNotification) {
    showToast('Survey progress saved successfully!', 'success');
  }
}

// Restore saved draft or prepopulate user info
function restoreSavedDraftOrUser() {
  const user = getCurrentUser();
  if (user) {
    const nameField = document.getElementById('farmer-name');
    const emailField = document.getElementById('farmer-email');
    const mobileField = document.getElementById('farmer-mobile');

    if (nameField && !nameField.value) nameField.value = user.name || '';
    if (emailField && !emailField.value) emailField.value = user.email || '';
    if (mobileField && !mobileField.value) mobileField.value = user.mobile || '';
  }

  const draftRaw = localStorage.getItem('agrisurvey_draft');
  if (!draftRaw) return;

  try {
    const draft = JSON.parse(draftRaw);
    if (!draft || !draft.data) return;

    populateFormFields(draft.data);
    refreshOptionCardVisuals();
    if (draft.step && draft.step > 1) {
      // Prompt user to continue or stay
      showToast(`Restored draft from Step ${draft.step}.`, 'info');
    }
  } catch (e) {
    console.error('Error restoring draft:', e);
  }
}

// Populate form from data object
function populateFormFields(data) {
  for (let key in data) {
    const val = data[key];
    const inputs = document.querySelectorAll(`[name="${key}"]`);

    if (inputs.length > 0) {
      if (inputs[0].type === 'radio') {
        inputs.forEach(r => {
          if (r.value === val) r.checked = true;
        });
      } else if (inputs[0].type === 'checkbox') {
        const values = Array.isArray(val) ? val : [val];
        inputs.forEach(c => {
          if (values.includes(c.value)) c.checked = true;
        });
      } else {
        inputs[0].value = val;
      }
    }
  }

  // Restore rating
  if (data['q49_satisfaction']) {
    const ratingInput = document.getElementById('q49_satisfaction_input');
    if (ratingInput) ratingInput.value = data['q49_satisfaction'];
    const rBtn = document.querySelector(`.rating-btn[data-val="${data['q49_satisfaction']}"]`);
    if (rBtn) rBtn.classList.add('selected');
  }

  // Trigger conditional events
  const loanChecked = document.querySelector('input[name="q28_loan"]:checked');
  if (loanChecked) {
    loanChecked.dispatchEvent(new Event('change'));
  }
}

// Submit Full Survey
function submitSurvey() {
  if (!validateCurrentStep(TOTAL_STEPS)) {
    showToast('Please complete the required feedback questions.', 'error');
    return;
  }

  const surveyData = serializeSurveyData();
  const user = getCurrentUser();

  const submission = {
    id: 'AGRI-' + Date.now().toString().slice(-6),
    submittedAt: new Date().toISOString(),
    user: user || { name: surveyData['farmer_name'] || 'Anonymous Farmer' },
    data: surveyData
  };

  // Save to submissions list
  const existing = JSON.parse(localStorage.getItem('agrisurvey_submissions') || '[]');
  existing.push(submission);
  localStorage.setItem('agrisurvey_submissions', JSON.stringify(existing));

  // Save latest submission for result.html
  localStorage.setItem('agrisurvey_latest_submission', JSON.stringify(submission));

  // Clear draft
  localStorage.removeItem('agrisurvey_draft');

  showToast('Survey submitted successfully! Generating summary...', 'success');
  setTimeout(() => {
    window.location.href = 'result.html';
  }, 1000);
}

// Quick Demo Fill for Faculty Presentation
function setupQuickDemoFill() {
  const fillBtn = document.getElementById('btn-quick-demo-fill');
  if (!fillBtn) return;

  fillBtn.addEventListener('click', () => {
    const sampleData = {
      // Step 1: Contact
      farmer_name: 'Ramesh Patel',
      farmer_age: '42',
      farmer_gender: 'Male',
      farmer_mobile: '9876543210',
      farmer_email: 'ramesh.farmer@agrisurvey.org',
      farmer_village: 'Kalyanpur',
      farmer_district: 'Nashik',
      farmer_state: 'Maharashtra',
      farmer_pincode: '422003',
      farmer_occupation: 'Farm Owner',
      farmer_experience: '11–20 years',

      // Step 2: Farming & Land
      q1_occupation: 'Farm Owner',
      q2_experience: '11–20 years',
      q3_land_size: '5–10 acres',
      q6_crops_count: '2',
      q7_crop_rotation: 'Yes',
      q8_reason: 'Market demand',

      // Step 3: Crop Cultivation
      q4_crop: 'Wheat',
      q5_season: 'Rabi',

      // Step 4: Water & Power
      q9_water_source: 'Borewell',
      q10_water_sufficient: 'Usually',
      q11_irrigation_method: 'Drip irrigation',
      q12_water_qty: '450',
      q12_water_unit: 'Liters/Acre/Day',
      q21_power_sufficient: 'Usually',
      q22_power_hours: '8',
      q23_power_interruption: 'Sometimes',

      // Step 5: Fertilizer & Climate
      q13_fertilizer_type: 'Both',
      q14_fertilizer_frequency: '2–3 times per season',
      q15_soil_test: 'Sometimes',
      q16_fertilizer_cost_impact: 'Yes',
      q17_climate_impact: 'High',
      q18_weather_problem: 'Unpredictable weather',
      q19_extreme_weather_loss: 'Yes',
      q20_difficult_season: 'Summer',

      // Step 6: Investment & Loan
      q24_season_investment: '₹50,000 – ₹1,00,000',
      q25_biggest_expense: 'Fertilizer',
      q26_labour_cost_pct: '20% – 40%',
      q27_expenses_increased: 'Significantly',
      q28_loan: 'Yes',
      q28_loan_amount: '75,000',
      q28_loan_reason: 'Seeds, Drip Pipes & Soil Nutrients',
      q28_loan_source: 'Bank',
      q29_loan_easy: 'Difficult',

      // Step 7: Harvest & Profit
      q30_yield_qty: '28',
      q30_yield_unit: 'Quintals/Acre',
      q31_harvest_loss_pct: '5–10%',
      q32_harvest_loss_reason: 'Weather',
      q33_machinery_used: 'Partially',
      q34_storage_method: 'Government storage',
      q35_sell_location: 'Agricultural market',
      q36_sold_qty: '120 Quintals',
      q37_sell_price: '₹2,450 / Quintal',
      q38_profit_status: 'Moderate profit',
      q39_sell_difficulty: 'Middlemen',

      // Step 8: Tech & Feedback
      q40_pest_problem: 'Sometimes',
      q41_pest_control: 'Integrated methods',
      q42_pest_loss_pct: '5% – 10%',
      q43_use_tech: 'Partially',
      q44_tech_used: ['Drip irrigation', 'Tractors', 'Mobile agriculture apps'],
      q45_adopt_more_tech: 'Definitely',
      q46_gov_schemes_aware: 'Yes',
      q47_gov_support_received: 'Yes',
      q48_helpful_support: 'Subsidy',
      q49_satisfaction: '4',
      q50_crop_condition: 'Happy',
      q51_biggest_challenge: 'Fluctuating market prices and high chemical fertilizer prices.',
      q52_most_needed_improvement: 'Subsidies on solar water pumps and direct farmer-to-consumer digital mandis.',
      q53_next_season_expectations: 'Planning to expand drip irrigation to all 7 acres and introduce pulses.',
      q54_additional_comments: 'AgriSurvey is very helpful. Farmers need timely weather alert SMS and transparent MSP guarantees.'
    };

    populateFormFields(sampleData);
    refreshOptionCardVisuals();
    showToast('⚡ Demo data populated across all 8 steps! Ready for review or submission.', 'success');
  });
}
