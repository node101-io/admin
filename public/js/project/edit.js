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
    if (event.target.id == 'update-button') {
      const error = document.getElementById('update-error');
      error.innerHTML = '';

      const name = document.getElementById('name').value;
      const description = document.getElementById('description').value;
      const rating = document.getElementById('rating').value;
      const socialMediaAccounts = {};
      const systemRequirements = {};
      const wizardKey = document.getElementById('wizard-key').value;
      const network = document.getElementById('network').value;

      const socialAccountInputs = document.querySelectorAll('.social-account-input');
      const systemRequirementInputs = document.querySelectorAll('.system-requirement-input');

      for (let i = 0; i < socialAccountInputs.length; i++)
        if (socialAccountInputs[i].value && socialAccountInputs[i].value.trim().length)
          socialMediaAccounts[socialAccountInputs[i].id]= socialAccountInputs[i].value.trim();

      for (let i = 0; i < systemRequirementInputs.length; i++)
        if (systemRequirementInputs[i].value && systemRequirementInputs[i].value.trim().length)
          systemRequirements[systemRequirementInputs[i].id]= systemRequirementInputs[i].value.trim();
      
      if (!name || !name.trim().length)
        return error.innerHTML = 'Please enter a name for the project.';

      if (!description || !description.trim().length)
        return error.innerHTML = 'Please enter a description for the project.';

      if (!rating || isNaN(parseInt(rating)) || parseInt(rating) < 1 || parseInt(rating) > 5)
        return error.innerHTML = 'Please choose a rating for the project.';
      
      if (!network || !network.trim().length)
        return error.innerHTML = 'Please choose a network for the project.';

      serverRequest('/project/edit?id=' + project._id, 'POST', {
        name,
        description,
        rating: parseInt(rating),
        social_media_accounts: socialMediaAccounts,
        wizard_key: wizardKey,
        system_requirements: systemRequirements
        is_mainnet: network == 'mainnet'
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