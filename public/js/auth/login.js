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

    serverRequest('/auth/login', 'POST', {
      email,
      password
    }, res => {
      if (!res.success) {
        error.style.display = 'unset';

        if (res.error == 'document_not_found')
          error.innerHTML = 'This user does not exist';
        else if (res.error == 'password_verification')
          error.innerHTML = 'Your password is wrong';
        else
          error.innerHTML = 'An unknown error occured. Please try again later.';

        return;
      }

      if (res.redirect)
        return window.location = res.redirect;      
      else
        return window.location = '/';
    });
  });
});