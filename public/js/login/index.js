window.addEventListener('load', () => {
  const form = document.getElementById('form');
  const error = document.getElementById('error');

  form.addEventListener('submit', event => {
    event.preventDefault();
    error.style.display = 'none';
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (!email?.length || !password?.length) {
      error.style.display = 'unset';
      return error.innerHTML = 'Please enter your email and password.';
    };

    serverRequest('/admin/login', 'POST', {
      password
    }, res => {
      if (!res.success)
        return error.style.display = 'unset';

      return window.location = '/admin';      
    });
  });
});