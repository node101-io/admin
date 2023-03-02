function createSelectionItem(id, name) {
  const choice = document.createElement('div');
  choice.classList.add('general-select-each-input-choice');
  choice.id = 'select-input-' + id;
  choice.innerHTML = name;
  return choice;
};

window.addEventListener('load', () => {
  const book = JSON.parse(document.getElementById('book-json').value);

  if (document.getElementById('book-search-input')) {
    document.getElementById('book-search-input').focus();
    document.getElementById('book-search-input').select();

    document.getElementById('book-search-input').addEventListener('keyup', event => {
      if (event.key == 'Enter' && event.target.value?.trim()?.length) {
        window.location = `/book?search=${event.target.value.trim()}`;
      } else if (event.key == 'Enter') {
        window.location = '/book';
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

      const name = document.getElementById('name').value;
      const projectId = document.getElementById('project-id').value;
      const writerId = document.getElementById('writer-id').value;
      const description = document.getElementById('description').value;
      const socialMediaAccounts = {};

      const socialAccountInputs = document.querySelectorAll('.social-account-input');

      for (let i = 0; i < socialAccountInputs.length; i++)
        if (socialAccountInputs[i].value && socialAccountInputs[i].value.trim().length)
          socialMediaAccounts[socialAccountInputs[i].id]= socialAccountInputs[i].value.trim();

      if (!name || !name.trim().length)
        return error.innerHTML = 'Please enter a name for the book.';

      if (!writerId || !writerId.trim().length)
        return error.innerHTML = 'Please choose a writer for the book.';

      if (!description || !description.trim().length)
        return error.innerHTML = 'Please enter a description for the book.';

      serverRequest('/book/edit?id=' + book._id, 'POST', {
        name,
        project_id: projectId && projectId.trim().length ? projectId : null,
        writer_id: writerId,
        description,
        social_media_accounts: socialMediaAccounts
      }, res => {
        if (!res.success && res.error == 'duplicated_unique_field')
          return error.innerHTML = 'There is already a book with this name.'
        if (!res.success)
          return throwError(res.error);

          return createConfirm({
            title: 'Book is Updated',
            text: 'Book is updated. Close to reload the page.',
            accept: 'Close'
          }, _ => window.location.reload());
      });
    }

    if (event.target.id == 'update-turkish-button') {
      const error = document.getElementById('update-turkish-error');
      error.innerHTML = '';

      if (!book.is_completed)
        return error.innerHTML = 'Please complete the book before adding a translation.';

      const name = document.getElementById('turkish-name').value;
      const description = document.getElementById('turkish-description').value;
      const socialMediaAccounts = {};

      const socialAccountInputs = document.querySelectorAll('.turkish-social-account-input');

      for (let i = 0; i < socialAccountInputs.length; i++)
        if (socialAccountInputs[i].value && socialAccountInputs[i].value.trim().length)
          socialMediaAccounts[socialAccountInputs[i].id.replace('turkish-', '')]= socialAccountInputs[i].value.trim();

      if (!name || !name.trim().length)
        return error.innerHTML = 'Please enter a name for the book.';

      if (!description || !description.trim().length)
        return error.innerHTML = 'Please enter a description for the book.';

      serverRequest('/book/translate?id=' + book._id, 'POST', {
        language: 'tr',
        name,
        description,
        social_media_accounts: socialMediaAccounts
      }, res => {
        if (!res.success && res.error == 'duplicated_unique_field')
          return error.innerHTML = 'There is already a book with this name.'
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

      if (!book.is_completed)
        return error.innerHTML = 'Please complete the book before adding a translation.';

      const name = document.getElementById('russian-name').value;
      const description = document.getElementById('russian-description').value;
      const socialMediaAccounts = {};

      const socialAccountInputs = document.querySelectorAll('.russian-social-account-input');

      for (let i = 0; i < socialAccountInputs.length; i++)
        if (socialAccountInputs[i].value && socialAccountInputs[i].value.trim().length)
          socialMediaAccounts[socialAccountInputs[i].id.replace('russian-', '')]= socialAccountInputs[i].value.trim();

      if (!name || !name.trim().length)
        return error.innerHTML = 'Please enter a name for the book.';

      if (!description || !description.trim().length)
        return error.innerHTML = 'Please enter a description for the book.';

      serverRequest('/book/translate?id=' + book._id, 'POST', {
        language: 'ru',
        name,
        description,
        social_media_accounts: socialMediaAccounts
      }, res => {
        if (!res.success && res.error == 'duplicated_unique_field')
          return error.innerHTML = 'There is already a book with this name.'
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

      serverRequest('/book/image?id=' + book._id, 'FILE', {
        file
      }, res => {
        if (!res.success) return throwError(res.error);
    
        return createConfirm({
          title: 'Book Image is Updated',
          text: 'Book image is updated. Close to reload the page.',
          accept: 'Close'
        }, _ => window.location.reload());
      });
    }
  });

  document.addEventListener('input', event => {
    if (event.target.id == 'project-search') {
      if (!event.target.value?.trim().length)
        return;

      serverRequest('/project/filter?title=' + event.target.value?.trim(), 'GET', {}, res => {
        if (!res.success)
          return throwError(res.error);

        document.getElementById('project-choices').innerHTML = '';
        document.getElementById('project-id').value = '';
        res.projects.forEach(project => {
          document.getElementById('project-choices').appendChild(createSelectionItem(project._id, project.name))
          if (event.target.value?.trim().toLocaleLowerCase() == project.name.toLocaleLowerCase())
            document.getElementById('project-id').value = project._id.toString();
        });
      });
    }

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