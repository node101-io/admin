window.addEventListener('load', () => {
  const project = JSON.parse(document.getElementById('project-json').value);

  if (document.getElementById('project-search-input')) {
    document.getElementById('project-search-input').focus();
    document.getElementById('project-search-input').select();

    document.getElementById('project-search-input').addEventListener('keyup', event => {
      if (event.key == 'Enter' && event.target.value?.trim()?.length) {
        window.location = `/project?search=${event.target.value.trim()}`;
      } else if (event.key == 'Enter') {
        window.location = '/project';
      }
    });
  }

  document.addEventListener('click', event => {
    if (event.target.classList.contains('each-navbar-group-link') && event.target.href.includes('/project/create')) {
      event.preventDefault();

      createFormPopUp({
        title: 'Create a New Project',
        url: '/project/create',
        method: 'POST',
        description: 'You will be asked to complete project details once you create it.',
        inputs: [
          {
            name: 'name',
            placeholder: 'Name (must be unique)'
          }
        ],
        button: 'Create New Project',
        errors: {
          duplicated_unique_field: 'Each project must have a unique name. Please use edit & translations page to change this project\'s details.'
        }
      }, (error, res) => {
        if (error) return alert(error);
        if (!res) return;

        return window.location = '/project/edit?id=' + res.id;
      });
    }

    if (event.target.id == 'update-button') {
      const error = document.getElementById('update-error');
      error.innerHTML = '';

      const name = document.getElementById('name').value;
      const description = document.getElementById('description').value;
      const socialMediaAccounts = {};

      const socialAccountInputs = document.querySelectorAll('.social-account-input');

      for (let i = 0; i < socialAccountInputs.length; i++)
        if (socialAccountInputs[i].value && socialAccountInputs[i].value.trim().length)
          socialMediaAccounts[socialAccountInputs[i].id]= socialAccountInputs[i].value.trim();

      if (!name || !name.trim().length)
        return error.innerHTML = 'Please enter a name for your project.';

      if (!description || !description.trim().length)
        return error.innerHTML = 'Please enter a description for your project.';

      serverRequest('/project/edit?id=' + project._id, 'POST', {
        name,
        description,
        social_media_accounts: socialMediaAccounts
      }, res => {
        if (!res.success && res.error == 'duplicated_unique_field')
          return error.innerHTML = 'There is already a project with this name.'
        if (!res.success)
          return throwError(res.error);

          return createConfirm({
            title: 'Project is Updated',
            text: 'Project is updated. Close to reload the page.',
            accept: 'Close'
          }, _ => window.location.reload());
      });
    };
  });
});