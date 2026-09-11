/**
 * AgriSurvey - Input Validation Utilities
 */

const Validator = {
  // Validate Email
  isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).trim().toLowerCase());
  },

  // Validate Indian or standard 10-digit Phone
  isValidPhone(phone) {
    const cleaned = String(phone).replace(/\D/g, '');
    return cleaned.length >= 10;
  },

  // Validate Required string
  isRequired(value) {
    return value !== null && value !== undefined && String(value).trim().length > 0;
  },

  // Set field as invalid with error message
  setError(inputElement, message) {
    if (!inputElement) return;
    inputElement.classList.add('is-invalid');
    let feedback = inputElement.parentElement.querySelector('.invalid-feedback');
    if (!feedback) {
      feedback = document.createElement('div');
      feedback.className = 'invalid-feedback';
      inputElement.parentElement.appendChild(feedback);
    }
    feedback.textContent = message;
    feedback.style.display = 'block';
  },

  // Clear invalid status
  clearError(inputElement) {
    if (!inputElement) return;
    inputElement.classList.remove('is-invalid');
    const feedback = inputElement.parentElement.querySelector('.invalid-feedback');
    if (feedback) {
      feedback.style.display = 'none';
      feedback.textContent = '';
    }
  },

  // Clear all errors in a form or container
  clearAllErrors(container = document) {
    container.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
    container.querySelectorAll('.invalid-feedback').forEach(el => {
      el.style.display = 'none';
      el.textContent = '';
    });
  }
};
