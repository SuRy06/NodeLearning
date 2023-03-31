import '@babel/polyfill';
import { login, logout } from './login';
import {updateSettings} from './updateSettings'

// DOM Elements
const loginForm = document.querySelector('.submit');
const logOutBtn = document.querySelector('.nav__el--logout');
const updateBtn = document.querySelector('.updateUser');
const updatePassBtn = document.querySelector('.updatePassword');

if (loginForm) {
  loginForm.addEventListener('click', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });
}

if (logOutBtn) logOutBtn.addEventListener('click', logout);

if(updateBtn) {
  updateBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    updateSettings({name, email},'data')
  });
}

if(updatePassBtn) {
  updatePassBtn.addEventListener('click', async(e) => {
    e.preventDefault();

    document.querySelector('.btn--save-password').textContent='Updating...';

    const passwordCurrent = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;
    await updateSettings({passwordCurrent,password, passwordConfirm},'password')

    document.querySelector('.btn--save-password').textContent='Save Password';
    document.getElementById('password-current').value= '';
    document.getElementById('password').value= '';
    document.getElementById('password-confirm').value= '';
  });
}
