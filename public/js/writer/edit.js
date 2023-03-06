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

      serverRequest('/writer/image?id=' + writer._id, 'FILE', {
        file
      }, res => {
        if (!res.success) return throwError(res.error);
    
        return createConfirm({
          title: 'Writer Image is Updated',
          text: 'Writer image is updated. Close to reload the page.',
          accept: 'Close'
        }, _ => window.location.reload());
      });
    }
  });
});