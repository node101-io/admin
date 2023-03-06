window.addEventListener('load', () => {
  const member = JSON.parse(document.getElementById('member-json').value);

  if (document.getElementById('member-search-input')) {
    document.getElementById('member-search-input').focus();
    document.getElementById('member-search-input').select();

    document.getElementById('member-search-input').addEventListener('keyup', event => {
      if (event.key == 'Enter' && event.target.value?.trim()?.length) {
        window.location = `/member?search=${event.target.value.trim()}`;
      } else if (event.key == 'Enter') {
        window.location = '/member';
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
        return error.innerHTML = 'Please enter a name for your member.';

      if (!title || !title.trim().length)
        return error.innerHTML = 'Please enter a title for your member.';

      serverRequest('/member/edit?id=' + member._id, 'POST', {
        name,
        title,
        social_media_accounts: socialMediaAccounts
      }, res => {
        if (!res.success && res.error == 'duplicated_unique_field')
          return error.innerHTML = 'There is already a member with this name.'
        if (!res.success)
          return throwError(res.error);

          return createConfirm({
            title: 'Member is Updated',
            text: 'Member is updated. Close to reload the page.',
            accept: 'Close'
          }, _ => window.location.reload());
      });
    }

    if (event.target.id == 'update-turkish-button') {
      const error = document.getElementById('update-turkish-error');
      error.innerHTML = '';

      if (!member.is_completed)
        return error.innerHTML = 'Please complete the member before adding a translation.'

      const title = document.getElementById('turkish-title').value;
      const socialMediaAccounts = {};

      const socialAccountInputs = document.querySelectorAll('.turkish-social-account-input');

      for (let i = 0; i < socialAccountInputs.length; i++)
        if (socialAccountInputs[i].value && socialAccountInputs[i].value.trim().length)
          socialMediaAccounts[socialAccountInputs[i].id.replace('turkish-', '')]= socialAccountInputs[i].value.trim();

      if (!title || !title.trim().length)
        return error.innerHTML = 'Please enter a title for the member.';

      serverRequest('/member/translate?id=' + member._id, 'POST', {
        language: 'tr',
        title,
        social_media_accounts: socialMediaAccounts
      }, res => {
        if (!res.success && res.error == 'duplicated_unique_field')
          return error.innerHTML = 'There is already a member with this name.'
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

      if (!member.is_completed)
        return error.innerHTML = 'Please complete the member before adding a translation.'

      const title = document.getElementById('russian-title').value;
      const socialMediaAccounts = {};

      const socialAccountInputs = document.querySelectorAll('.russian-social-account-input');

      for (let i = 0; i < socialAccountInputs.length; i++)
        if (socialAccountInputs[i].value && socialAccountInputs[i].value.trim().length)
          socialMediaAccounts[socialAccountInputs[i].id.replace('russian-', '')]= socialAccountInputs[i].value.trim();

      if (!title || !title.trim().length)
        return error.innerHTML = 'Please enter a title for the member.';

      serverRequest('/member/translate?id=' + member._id, 'POST', {
        language: 'ru',
        title,
        social_media_accounts: socialMediaAccounts
      }, res => {
        if (!res.success && res.error == 'duplicated_unique_field')
          return error.innerHTML = 'There is already a member with this name.'
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
      xhr.open('POST', '/member/image?id=' + member._id);
      xhr.send(formdata);
    
      xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 && xhr.responseText) {
          const res = JSON.parse(xhr.responseText);
    
          if (!res.success) return throwError(res.error);
    
          return createConfirm({
            title: 'Member Image is Updated',
            text: 'Member image is updated. Close to reload the page.',
            accept: 'Close'
          }, _ => window.location.reload());
        }
      };
    }
  });
});