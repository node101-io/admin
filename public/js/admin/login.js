window.addEventListener('load', () => {
  const form = document.getElementById('form');
  const error = document.getElementById('error');

  form.addEventListener('submit', event => {
    event.preventDefault();
    error.style.display = 'none';
    
    const password = document.getElementById('password').value;

    serverRequest('/admin/login', 'POST', {
      password
    }, res => {
      if (!res.success)
        return error.style.display = 'unset';

      return window.location = '/admin';      
    });
  });
});