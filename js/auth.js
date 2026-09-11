/**
 * AgriSurvey - Authentication and Session Management
 */

const DEMO_USER = {
  name: 'Ramesh Patel',
  email: 'farmer@agrisurvey.org',
  mobile: '9876543210',
  password: 'demo'
};

// Initialize Users storage with demo user if empty
function initAuthStorage() {
  const users = localStorage.getItem('agrisurvey_users');
  if (!users) {
    localStorage.setItem('agrisurvey_users', JSON.stringify([DEMO_USER]));
  }
}

// Get current session
function getCurrentUser() {
  const raw = localStorage.getItem('agrisurvey_current_user');
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

// Ensure user is logged in before accessing protected pages like survey.html
function requireAuth(redirectUrl = 'login.html') {
  const user = getCurrentUser();
  if (!user) {
    showToast('Please log in or register to access the survey.', 'info');
    setTimeout(() => {
      window.location.href = `${redirectUrl}?redirect=${encodeURIComponent(window.location.pathname)}`;
    }, 800);
    return false;
  }
  return true;
}

// Handle Login Form
function setupLoginForm() {
  const form = document.getElementById('login-form');
  if (!form) return;

  initAuthStorage();

  const emailInput = document.getElementById('login-email');
  const passInput = document.getElementById('login-password');
  const demoBtn = document.getElementById('btn-fill-demo');

  if (demoBtn) {
    demoBtn.addEventListener('click', () => {
      emailInput.value = DEMO_USER.email;
      passInput.value = DEMO_USER.password;
      Validator.clearAllErrors(form);
      showToast('Demo farmer credentials populated!', 'info');
    });
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    Validator.clearAllErrors(form);

    const email = emailInput.value.trim();
    const password = passInput.value.trim();

    let hasError = false;

    if (!Validator.isRequired(email)) {
      Validator.setError(emailInput, 'Email address is required');
      hasError = true;
    } else if (!Validator.isValidEmail(email)) {
      Validator.setError(emailInput, 'Please enter a valid email');
      hasError = true;
    }

    if (!Validator.isRequired(password)) {
      Validator.setError(passInput, 'Password is required');
      hasError = true;
    }

    if (hasError) return;

    const users = JSON.parse(localStorage.getItem('agrisurvey_users') || '[]');
    const matched = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);

    if (!matched) {
      Validator.setError(passInput, 'Invalid email or password combination');
      showToast('Invalid credentials. Check email or use demo fill.', 'error');
      return;
    }

    // Save session
    localStorage.setItem('agrisurvey_current_user', JSON.stringify({
      name: matched.name,
      email: matched.email,
      mobile: matched.mobile
    }));

    showToast(`Welcome back, ${matched.name}!`, 'success');
    setTimeout(() => {
      window.location.href = 'survey.html';
    }, 800);
  });
}

// Handle Registration Form
function setupRegisterForm() {
  const form = document.getElementById('register-form');
  if (!form) return;

  initAuthStorage();

  const nameInput = document.getElementById('reg-name');
  const emailInput = document.getElementById('reg-email');
  const mobileInput = document.getElementById('reg-mobile');
  const passInput = document.getElementById('reg-password');
  const confirmPassInput = document.getElementById('reg-confirm-password');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    Validator.clearAllErrors(form);

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const mobile = mobileInput.value.trim();
    const password = passInput.value.trim();
    const confirmPassword = confirmPassInput.value.trim();

    let hasError = false;

    if (!Validator.isRequired(name)) {
      Validator.setError(nameInput, 'Full name is required');
      hasError = true;
    }

    if (!Validator.isRequired(email)) {
      Validator.setError(emailInput, 'Email address is required');
      hasError = true;
    } else if (!Validator.isValidEmail(email)) {
      Validator.setError(emailInput, 'Please enter a valid email address');
      hasError = true;
    }

    if (!Validator.isRequired(mobile)) {
      Validator.setError(mobileInput, 'Mobile number is required');
      hasError = true;
    } else if (!Validator.isValidPhone(mobile)) {
      Validator.setError(mobileInput, 'Please enter at least 10-digit mobile number');
      hasError = true;
    }

    if (!Validator.isRequired(password)) {
      Validator.setError(passInput, 'Password is required');
      hasError = true;
    } else if (password.length < 4) {
      Validator.setError(passInput, 'Password should be at least 4 characters');
      hasError = true;
    }

    if (password !== confirmPassword) {
      Validator.setError(confirmPassInput, 'Passwords do not match');
      hasError = true;
    }

    if (hasError) return;

    const users = JSON.parse(localStorage.getItem('agrisurvey_users') || '[]');
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      Validator.setError(emailInput, 'An account with this email already exists');
      showToast('Account with this email already exists', 'error');
      return;
    }

    const newUser = { name, email, mobile, password };
    users.push(newUser);
    localStorage.setItem('agrisurvey_users', JSON.stringify(users));

    // Automatically set current session
    localStorage.setItem('agrisurvey_current_user', JSON.stringify({
      name: newUser.name,
      email: newUser.email,
      mobile: newUser.mobile
    }));

    showToast('Account registered successfully! Redirecting...', 'success');
    setTimeout(() => {
      window.location.href = 'survey.html';
    }, 900);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initAuthStorage();
  setupLoginForm();
  setupRegisterForm();
});
