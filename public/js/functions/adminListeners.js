window.addEventListener('load', () => {
  document.getElementById('admin-search-input').focus();
  document.getElementById('admin-search-input').select();

  document.addEventListener('click', event => {
    if (event.target.classList.contains('each-navbar-group-link') && event.target.href.includes('/admin/create')) {
      event.preventDefault();

      createFormPopUp({
        title: 'Create a New Admin',
        url: '/admin/create',
        method: 'POST',
        description: 'You will be asked to complete admin details once you create it.',
        inputs: [
          {
            name: 'email',
            placeholder: 'Email'
          }
        ],
        button: 'Create New Admin',
        errors: {
          duplicated_unique_field: 'Each admin must have a unique email'
        }
      }, (error, res) => {
        if (error) return alert(error);
        if (!res) return;

        return window.location = '/admin/edit?id=' + res.id;
      });
    }
  });

  document.getElementById('admin-search-input').addEventListener('keyup', event => {
    if (event.key == 'Enter' && event.target.value?.trim()?.length) {
      window.location = `/admin?search=${event.target.value.trim()}`;
    } else if (event.key == 'Enter') {
      window.location = '/admin';
    }
  });
});