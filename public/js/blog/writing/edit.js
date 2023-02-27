function createSelectionItem(id, name) {
  const choice = document.createElement('div');
  choice.classList.add('general-select-each-input-choice');
  choice.id = 'select-input-' + id;
  choice.innerHTML = name;
  return choice;
};

window.addEventListener('load', () => {
  const blog = JSON.parse(document.getElementById('blog-json').value);
  const writing = JSON.parse(document.getElementById('writing-json').value);

  if (document.getElementById('writing-search-input')) {
    document.getElementById('writing-search-input').focus();
    document.getElementById('writing-search-input').select();

    document.getElementById('writing-search-input').addEventListener('keyup', event => {
      if (event.key == 'Enter' && event.target.value?.trim()?.length) {
        window.location = `/writing?search=${event.target.value.trim()}`;
      } else if (event.key == 'Enter') {
        window.location = '/writing';
      }
    });
  }

  document.addEventListener('click', event => {
    if (event.target.id == 'update-button') {
      const error = document.getElementById('update-error');
      error.innerHTML = '';

      const title = document.getElementById('title').value;
      const writerId = document.getElementById('writer-id').value;
      const subtitle = document.getElementById('subtitle').value;
      const createdAt = document.getElementById('date').valueAsDate;
      const socialMediaAccounts = {};

      const socialAccountInputs = document.querySelectorAll('.social-account-input');

      for (let i = 0; i < socialAccountInputs.length; i++)
        if (socialAccountInputs[i].value && socialAccountInputs[i].value.trim().length)
          socialMediaAccounts[socialAccountInputs[i].id]= socialAccountInputs[i].value.trim();

      if (!title || !title.trim().length)
        return error.innerHTML = 'Please enter a title for the writing.';

      if (!writerId || !writerId.trim().length)
        return error.innerHTML = 'Please choose a writer for the writing.';

      if (!subtitle || !subtitle.trim().length)
        return error.innerHTML = 'Please enter a subtitle for the writing.';

      if (!createdAt)
        return error.innerHTML = 'Please choose the creation date of the writing.';

      serverRequest(`/blog/writing/edit?id=${blog._id}&writing_id=${writing._id}`, 'POST', {
        title,
        writer_id: writerId,
        subtitle,
        created_at: createdAt,
        social_media_accounts: socialMediaAccounts
      }, res => {
        if (!res.success && res.error == 'duplicated_unique_field')
          return error.innerHTML = 'There is already a writing with this title.'
        if (!res.success)
          return throwError(res.error);

          return createConfirm({
            title: 'Blog is Updated',
            text: 'Blog is updated. Close to reload the page.',
            accept: 'Close'
          }, _ => window.location.reload());
      });
    }

    if (event.target.id == 'update-turkish-button') {
      const error = document.getElementById('update-turkish-error');
      error.innerHTML = '';

      if (!writing.is_completed)
        return error.innerHTML = 'Please complete the writing before adding a translation.';

      const title = document.getElementById('turkish-title').value;
      const subtitle = document.getElementById('turkish-subtitle').value;
      const socialMediaAccounts = {};

      const socialAccountInputs = document.querySelectorAll('.turkish-social-account-input');

      for (let i = 0; i < socialAccountInputs.length; i++)
        if (socialAccountInputs[i].value && socialAccountInputs[i].value.trim().length)
          socialMediaAccounts[socialAccountInputs[i].id.replace('turkish-', '')]= socialAccountInputs[i].value.trim();

      if (!title || !title.trim().length)
        return error.innerHTML = 'Please enter a title for the writing.';

      if (!subtitle || !subtitle.trim().length)
        return error.innerHTML = 'Please enter a subtitle for the writing.';

      serverRequest(`/blog/writing/edit?id=${blog._id}&writing_id=${writing._id}`, 'POST', {
        language: 'tr',
        title,
        subtitle,
        social_media_accounts: socialMediaAccounts
      }, res => {
        if (!res.success && res.error == 'duplicated_unique_field')
          return error.innerHTML = 'There is already a writing with this title.'
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

      if (!writing.is_completed)
        return error.innerHTML = 'Please complete the writing before adding a translation.';

      const title = document.getElementById('russian-title').value;
      const subtitle = document.getElementById('russian-subtitle').value;
      const socialMediaAccounts = {};

      const socialAccountInputs = document.querySelectorAll('.russian-social-account-input');

      for (let i = 0; i < socialAccountInputs.length; i++)
        if (socialAccountInputs[i].value && socialAccountInputs[i].value.trim().length)
          socialMediaAccounts[socialAccountInputs[i].id.replace('russian-', '')]= socialAccountInputs[i].value.trim();

      if (!title || !title.trim().length)
        return error.innerHTML = 'Please enter a title for the writing.';

      if (!subtitle || !subtitle.trim().length)
        return error.innerHTML = 'Please enter a subtitle for the writing.';

      serverRequest(`/blog/writing/edit?id=${blog._id}&writing_id=${writing._id}`, 'POST', {
        language: 'ru',
        title,
        subtitle,
        social_media_accounts: socialMediaAccounts
      }, res => {
        if (!res.success && res.error == 'duplicated_unique_field')
          return error.innerHTML = 'There is already a writing with this title.'
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

  document.addEventListener('input', event => {
    if (event.target.id == 'writer-search') {
      if (!event.target.value?.trim().length)
        return;

      serverRequest('/writer/filter?search=' + event.target.value?.trim(), 'GET', {}, res => {
        if (!res.success)
          return throwError(res.error);

        document.getElementById('writer-choices').innerHTML = '';
        document.getElementById('writer-id').value = '';
        res.writers.forEach(writer => {
          document.getElementById('writer-choices').appendChild(createSelectionItem(writer._id, writer.name))
          if (event.target.value?.trim().toLocaleLowerCase() == writer.name.toLocaleLowerCase())
            document.getElementById('writer-id').value = writer._id.toString();
        });
      });
    }
  })
});