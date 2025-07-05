/**
 * auth.js – handles registration, login and modal mechanics
 */
import { api } from './api.js';

const loginDlg     = document.getElementById('loginModal');
const registerDlg  = document.getElementById('registerModal');

document.getElementById('showLogin')
  .addEventListener('click', () => loginDlg.showModal());

document.getElementById('showRegister')
  .addEventListener('click', () => registerDlg.showModal());

/* ---------- LOGIN ---------- */
document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const { email, password } = Object.fromEntries(new FormData(e.target));
  try {
    await api('/auth/login.php', 'POST', { email, password });
    window.location = 'dashboard.html';
  } catch (err) {
    alert(err.message);
  }
});

/* ---------- REGISTER ---------- */
document.getElementById('registerForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const { email, password } = Object.fromEntries(new FormData(e.target));
  try {
    await api('/auth/register.php', 'POST', { email, password });
    window.location = 'dashboard.html';
  } catch (err) {
    alert(err.message);
  }
});
