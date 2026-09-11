/**
 * AgriSurvey - Global Application Utilities
 */

// Toast Notification Engine
function showToast(message, type = 'info', duration = 3500) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  let icon = '🌾';
  if (type === 'success') icon = '✅';
  if (type === 'error') icon = '⚠️';
  if (type === 'info') icon = 'ℹ️';

  toast.innerHTML = `
    <span style="font-size: 1.2rem;">${icon}</span>
    <div style="flex: 1;">${message}</div>
    <button style="background:none; border:none; color:#888; font-size:1.1rem; cursor:pointer;" onclick="this.parentElement.remove()">×</button>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// Global Auth State and Navbar Updater
function updateNavbarAuth() {
  const authContainer = document.getElementById('nav-auth-container');
  if (!authContainer) return;

  const currentUserRaw = localStorage.getItem('agrisurvey_current_user');
  if (currentUserRaw) {
    try {
      const user = JSON.parse(currentUserRaw);
      const initials = (user.name || 'Farmer').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
      authContainer.innerHTML = `
        <div class="user-badge" title="Logged in as ${user.name}">
          <div class="user-avatar-mini">${initials}</div>
          <span>${user.name.split(' ')[0]}</span>
        </div>
        <button id="nav-logout-btn" class="btn btn-sm btn-secondary" onclick="logoutUser()">Logout</button>
      `;
      return;
    } catch (e) {
      console.error(e);
    }
  }

  authContainer.innerHTML = `
    <a href="login.html" class="btn btn-sm btn-secondary">Login</a>
    <a href="register.html" class="btn btn-sm btn-primary">Register</a>
  `;
}

// Logout helper
function logoutUser() {
  localStorage.removeItem('agrisurvey_current_user');
  showToast('Logged out successfully', 'info');
  setTimeout(() => {
    window.location.href = 'index.html';
  }, 600);
}

// Mobile Navbar Toggle
document.addEventListener('DOMContentLoaded', () => {
  const toggleBtn = document.querySelector('.nav-toggle');
  const navMenu = document.querySelector('.nav-menu');

  if (toggleBtn && navMenu) {
    toggleBtn.addEventListener('click', () => {
      navMenu.classList.toggle('show');
    });
  }

  // Update navbar user session badge
  updateNavbarAuth();
});
