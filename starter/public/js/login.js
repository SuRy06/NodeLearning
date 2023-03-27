import axios from 'axios';
import { showAlert } from './alerts';

export const login = async (email, password) => {
  try {
    const res = await axios({
      method: 'POST',
      url: 'http://127.0.0.1:3000/api/v1/users/login',
      data: {
        email,
        password,
      },
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Logged in successfully!');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }

    // console.log(res);
  } catch (err) {
    // console.log(err.response.data)
    // alert(err);
    showAlert('error', err.response.data.message);
  }
};

export const logout = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: 'http://127.0.0.1:3000/api/v1/users/logout',
    });

    if ((res.data.status = 'success')) location.reload(true); //-when we put "location.reload(true)" then the reload will happen from the server and not only from the browser. if we not put true inside the "location.reload()" then it might just reload the browser from the cache not from the serve.
  } catch (err) {
    showAlert('error', 'Error logging out! Try again.');
  }
};
