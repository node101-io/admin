window.addEventListener('load', () => {
  const tag = JSON.parse(document.getElementById('tag-json').value);

  if (document.getElementById('tag-search-input')) {
    document.getElementById('tag-search-input').focus();
    document.getElementById('tag-search-input').select();

    document.getElementById('tag-search-input').addEventListener('keyup', event => {
      if (event.key == 'Enter' && event.target.value?.trim()?.length) {
        window.location = `/tag?search=${event.target.value.trim()}`;
      } else if (event.key == 'Enter') {
        window.location = '/tag';
      }
    });
  }

  document.addEventListener('click', event => {
    if (event.target.id == 'update-button') {
      const error = document.getElementById('update-error');
      error.innerHTML = '';

      const name = document.getElementById('name').value;
      const url = document.getElementById('url').value;

      if (!name || !name.trim().length)
        return error.innerHTML = 'Please enter a name for the tag.';

      if (!url || !url.trim().length)
        return error.innerHTML = 'Please enter a url for the tag.';

      serverRequest('/tag/edit?id=' + tag._id, 'POST', {
        name,
        url
      }, res => {
        if (!res.success && res.error == 'duplicated_unique_field')
          return error.innerHTML = 'There is already a tag with this name.'
        if (!res.success)
          return throwError(res.error);

          return createConfirm({
            title: 'Tag is Updated',
            text: 'Tag is updated. Close to reload the page.',
            accept: 'Close'
          }, _ => window.location.reload());
      });
    }

    if (event.target.id == 'update-turkish-button') {
      const error = document.getElementById('update-turkish-error');
      error.innerHTML = '';

      if (!tag.is_completed)
        return error.innerHTML = 'Please complete the tag before adding a translation.';

      const name = document.getElementById('turkish-name').value;

      if (!name || !name.trim().length)
        return error.innerHTML = 'Please enter a name for the tag.';

      serverRequest('/tag/translate?id=' + tag._id, 'POST', {
        language: 'tr',
        name
      }, res => {
        if (!res.success && res.error == 'duplicated_unique_field')
          return error.innerHTML = 'There is already a tag with this name.'
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

      if (!tag.is_completed)
        return error.innerHTML = 'Please complete the tag before adding a translation.';

      const name = document.getElementById('russian-name').value;

      if (!name || !name.trim().length)
        return error.innerHTML = 'Please enter a name for the tag.';

      serverRequest('/tag/translate?id=' + tag._id, 'POST', {
        language: 'ru',
        name
      }, res => {
        if (!res.success && res.error == 'duplicated_unique_field')
          return error.innerHTML = 'There is already a tag with this name.'
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
});