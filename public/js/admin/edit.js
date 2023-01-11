window.addEventListener('load', () => {
  const admin = JSON.parse(document.getElementById('admin-json').value);

  document.addEventListener('click', event => {
    if (event.target.id == 'select-all-roles-button') {
      const roles = document.querySelectorAll('.each-admin-role-button');

      for (let i = 0; i < roles.length; i++)
        roles[i].childNodes[0].classList.add('general-checkbox-input-box-selected');
    }

    if (event.target.id == 'update-button') {
      const error = document.getElementById('update-error');
      const name = document.getElementById('name').value;
      const roles = [];

      error.innerHTML = '';

      if (!name || !name.length)
        return error.innerHTML = 'Please enter a name for the admin';

      const roleButtons = document.querySelectorAll('.each-admin-role-button');

      for (let i = 0; i < roleButtons.length; i++)
        if (roleButtons[i].childNodes[0]?.classList.contains('general-checkbox-input-box-selected'))
          roles.push(roleButtons[i].id);

      if (!roles.length)
        return error.innerHTML = 'Please select at least one role for your admin.';

      serverRequest('/admin/edit?id=' + admin._id, 'POST', {
        name,
        roles
      }, res => {
        if (!res.success)
          return error.innerHTML = 'An error occured, please try again later. Error Message: ' + (res.error || 'unknown_error');

        return createConfirm({
          title: 'Admin is Updated',
          text: 'Admin account is updated. Close to reload the page.',
          accept: 'Close'
        }, _ => window.location.reload());
      })
    }

    if (event.target.id == 'reset-password-button') {
      const error = document.getElementById('reset-password-error');
      const password = document.getElementById('new-password').value;
      const confirmPassword = document.getElementById('confirm-password').value;

      error.innerHTML = '';

      if (!password || password.length < 8)
        return error.innerHTML = 'The new password must be at least 8 characters long.';
      
      if (password != confirmPassword)
        return error.innerHTML = 'Please confirm the new password.';

      serverRequest('/admin/password?id=' + admin._id, 'POST', {
        password
      }, res => {
        if (!res.success)
          return error.innerHTML = 'An error occured, please try again later. Error Message: ' + (res.error || 'unknown_error');

        return createConfirm({
          title: 'Password Updated',
          text: 'Admin password is updated. Close to reload the page.',
          accept: 'Close'
        }, _ => window.location.reload());
      });
    }
  });
});