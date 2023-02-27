window.addEventListener('load', () => {
  const stake = JSON.parse(document.getElementById('stake-json').value);

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
    if (ancestorWithClassName(event.target, 'general-image-input-delete-button')) {
      const target = ancestorWithClassName(event.target, 'general-image-input-delete-button');
      const wrapper = target.parentNode;
      wrapper.innerHTML = '';
      wrapper.style.cursor = 'pointer';

      const input = document.createElement('input');
      input.classList.add('display-none');
      input.id = 'image';
      input.type = 'file';
      wrapper.appendChild(input);

      const placeholder = document.createElement('span');
      placeholder.classList.add('general-image-input-placeholder');
      placeholder.innerHTML = 'Upload from your device.';
      wrapper.appendChild(placeholder);
    }

    if (event.target.id == 'update-button') {
      const error = document.getElementById('update-error');
      error.innerHTML = '';

      const notYetStakable = document.getElementById('not-yet-stakable').value && document.getElementById('not-yet-stakable').value.length ? JSON.parse(document.getElementById('not-yet-stakable').value) : false;
      const apr = document.getElementById('apr').value;
      const stakeURL = document.getElementById('stake-url').value;
      const howToStakeURL = document.getElementById('how-to-stake-url').value;

      if (notYetStakable) {

      } else {
        if (!apr || !apr.trim().length)
          return error.innerHTML = 'Please enter the APR for the project.';

        if (!stakeURL || !stakeURL.trim().length)
          return error.innerHTML = 'Please enter the stake URL for the project.';

        if (!howToStakeURL || !howToStakeURL.trim().length)
          return error.innerHTML = 'Please enter the how to stake URL for the project.';

        serverRequest('/stake/edit?id=' + stake._id, 'POST', {
          not_yet_stakable: false,
          apr,
          stake_url: stakeURL,
          how_to_stake_url: howToStakeURL
        }, res => {
          if (!res.success) return throwError(res.error);

            return createConfirm({
              title: 'Project stake information is Updated',
              text: 'Stake information is updated. Close to reload the page.',
              accept: 'Close'
            }, _ => window.location.reload());
        });
      }
    }

    if (event.target.id == 'update-turkish-button') {
      const error = document.getElementById('update-turkish-error');
      error.innerHTML = '';

      if (!project.is_completed)
        return error.innerHTML = 'Please complete the project before adding a translation.';

      const name = document.getElementById('turkish-name').value;
      const description = document.getElementById('turkish-description').value;
      const socialMediaAccounts = {};

      const socialAccountInputs = document.querySelectorAll('.turkish-social-account-input');

      for (let i = 0; i < socialAccountInputs.length; i++)
        if (socialAccountInputs[i].value && socialAccountInputs[i].value.trim().length)
          socialMediaAccounts[socialAccountInputs[i].id.replace('turkish-', '')]= socialAccountInputs[i].value.trim();

      if (!name || !name.trim().length)
        return error.innerHTML = 'Please enter a name for the project.';

      if (!description || !description.trim().length)
        return error.innerHTML = 'Please enter a description for the project.';

      serverRequest('/project/translate?id=' + project._id, 'POST', {
        language: 'tr',
        name,
        description,
        social_media_accounts: socialMediaAccounts
      }, res => {
        if (!res.success && res.error == 'duplicated_unique_field')
          return error.innerHTML = 'There is already a project with this name.'
        if (!res.success)
          return throwError(res.error);

          return createConfirm({
            title: 'Translation is Updated',
            text: 'Turkish translation is updated. Close to reload the page.',
            accept: 'Close'
          }, _ => window.location.reload());
      });
    }

    if (event.target.id == 'update-russian-button') {
      const error = document.getElementById('update-russian-error');
      error.innerHTML = '';

      if (!project.is_completed)
        return error.innerHTML = 'Please complete the project before adding a translation.';

      const name = document.getElementById('russian-name').value;
      const description = document.getElementById('russian-description').value;
      const socialMediaAccounts = {};

      const socialAccountInputs = document.querySelectorAll('.russian-social-account-input');

      for (let i = 0; i < socialAccountInputs.length; i++)
        if (socialAccountInputs[i].value && socialAccountInputs[i].value.trim().length)
          socialMediaAccounts[socialAccountInputs[i].id.replace('russian-', '')]= socialAccountInputs[i].value.trim();

      if (!name || !name.trim().length)
        return error.innerHTML = 'Please enter a name for the project.';

      if (!description || !description.trim().length)
        return error.innerHTML = 'Please enter a description for the project.';

      serverRequest('/project/translate?id=' + project._id, 'POST', {
        language: 'ru',
        name,
        description,
        social_media_accounts: socialMediaAccounts
      }, res => {
        if (!res.success && res.error == 'duplicated_unique_field')
          return error.innerHTML = 'There is already a project with this name.'
        if (!res.success)
          return throwError(res.error);

          return createConfirm({
            title: 'Translation is Updated',
            text: 'Russian translation is updated. Close to reload the page.',
            accept: 'Close'
          }, _ => window.location.reload());
      });
    }
  });

  document.addEventListener('change', event => {
    if (event.target.id == 'image') {
      const file = event.target.files[0];
      const wrapper = event.target.parentNode;
  
      wrapper.style.cursor = 'progress';
      wrapper.childNodes[1].innerHTML = 'Loading...';
      wrapper.childNodes[0].type = 'text';

      serverRequest('/project/image?id=' + project._id, 'FILE', {
        file
      }, res => {
        if (!res.success) return throwError(res.error);
    
        return createConfirm({
          title: 'Project Image is Updated',
          text: 'Project image is updated. Close to reload the page.',
          accept: 'Close'
        }, _ => window.location.reload());
      });
    }
  });
});