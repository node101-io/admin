window.addEventListener('load', () => {
  const writer = JSON.parse(document.getElementById('writer-json').value);

  if (document.getElementById('writer-search-input')) {
    document.getElementById('writer-search-input').focus();
    document.getElementById('writer-search-input').select();

    document.getElementById('writer-search-input').addEventListener('keyup', event => {
      if (event.key == 'Enter' && event.target.value?.trim()?.length) {
        window.location = `/writer?search=${event.target.value.trim()}`;
      } else if (event.key == 'Enter') {
        window.location = '/writer';
      }
    });
  }

  document.addEventListener('click', event => {
    if (event.target.classList.contains('each-navbar-group-link') && event.target.href.includes('/writer/create')) {
      event.preventDefault();

      createFormPopUp({
        title: 'Create a New Writer',
        url: '/writer/create',
        method: 'POST',
        title: 'You will be asked to complete writer details once you create it.',
        inputs: [
          {
            name: 'name',
            placeholder: 'Name'
          }
        ],
        button: 'Create New Writer'
      }, (error, res) => {
        if (error) return alert(error);
        if (!res) return;

        return window.location = '/writer/edit?id=' + res.id;
      });
    }

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

      const name = document.getElementById('name').value;
      const title = document.getElementById('title').value;
      const socialMediaAccounts = {};

      const socialAccountInputs = document.querySelectorAll('.social-account-input');

      for (let i = 0; i < socialAccountInputs.length; i++)
        if (socialAccountInputs[i].value && socialAccountInputs[i].value.trim().length)
          socialMediaAccounts[socialAccountInputs[i].id]= socialAccountInputs[i].value.trim();

      if (!name || !name.trim().length)
        return error.innerHTML = 'Please enter a name for your writer.';

      if (!title || !title.trim().length)
        return error.innerHTML = 'Please enter a title for your writer.';

      serverRequest('/writer/edit?id=' + writer._id, 'POST', {
        name,
        title,
        social_media_accounts: socialMediaAccounts
      }, res => {
        if (!res.success && res.error == 'duplicated_unique_field')
          return error.innerHTML = 'There is already a writer with this name.'
        if (!res.success)
          return throwError(res.error);

          return createConfirm({
            title: 'Writer is Updated',
            text: 'Writer is updated. Close to reload the page.',
            accept: 'Close'
          }, _ => window.location.reload());
      });
    }

    if (event.target.id == 'update-turkish-button') {
      const error = document.getElementById('update-turkish-error');
      error.innerHTML = '';

      if (!writer.is_completed)
        return error.innerHTML = 'Please complete the writer before adding a translation.'

      const title = document.getElementById('turkish-title').value;
      const socialMediaAccounts = {};

      const socialAccountInputs = document.querySelectorAll('.turkish-social-account-input');

      for (let i = 0; i < socialAccountInputs.length; i++)
        if (socialAccountInputs[i].value && socialAccountInputs[i].value.trim().length)
          socialMediaAccounts[socialAccountInputs[i].id.replace('turkish-', '')]= socialAccountInputs[i].value.trim();

      if (!title || !title.trim().length)
        return error.innerHTML = 'Please enter a title for the writer.';

      serverRequest('/writer/translate?id=' + writer._id, 'POST', {
        language: 'tr',
        title,
        social_media_accounts: socialMediaAccounts
      }, res => {
        if (!res.success && res.error == 'duplicated_unique_field')
          return error.innerHTML = 'There is already a writer with this name.'
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

      if (!writer.is_completed)
        return error.innerHTML = 'Please complete the writer before adding a translation.'

      const title = document.getElementById('russian-title').value;
      const socialMediaAccounts = {};

      const socialAccountInputs = document.querySelectorAll('.russian-social-account-input');

      for (let i = 0; i < socialAccountInputs.length; i++)
        if (socialAccountInputs[i].value && socialAccountInputs[i].value.trim().length)
          socialMediaAccounts[socialAccountInputs[i].id.replace('russian-', '')]= socialAccountInputs[i].value.trim();

      if (!title || !title.trim().length)
        return error.innerHTML = 'Please enter a title for the writer.';

      serverRequest('/writer/translate?id=' + writer._id, 'POST', {
        language: 'ru',
        title,
        social_media_accounts: socialMediaAccounts
      }, res => {
        if (!res.success && res.error == 'duplicated_unique_field')
          return error.innerHTML = 'There is already a writer with this name.'
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
  
      const formdata = new FormData();
      formdata.append('file', file);
    
      const xhr = new XMLHttpRequest();
      xhr.open('POST', '/writer/image?id=' + writer._id);
      xhr.send(formdata);
    
      xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 && xhr.responseText) {
          const res = JSON.parse(xhr.responseText);
    
          if (!res.success) return throwError(res.error);
    
          return createConfirm({
            title: 'Writer Image is Updated',
            text: 'Writer image is updated. Close to reload the page.',
            accept: 'Close'
          }, _ => window.location.reload());
        }
      };
    }
  });
});