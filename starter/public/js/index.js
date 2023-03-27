import '@babel/polyfill';
import { login, logout } from './login';

// DOM Elements
const loginForm = document.querySelector('.submit');
const logOutBtn = document.querySelector('.nav__el--logout');

if (loginForm) {
  loginForm.addEventListener('click', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });
}

if (logOutBtn) logOutBtn.addEventListener('click', logout);
