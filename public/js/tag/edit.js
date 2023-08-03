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
      const language = document.getElementById('language').value;

      if (!name || !name.trim().length)
        return error.innerHTML = 'Please enter a name for the tag.';

      if (!url || !url.trim().length)
        return error.innerHTML = 'Please enter a url for the tag.';

      if (!language || !language.trim().length)
        return error.innerHTML = 'Please enter a language for the tag.';

      serverRequest('/tag/edit?id=' + tag._id, 'POST', {
        name,
        url,
        language
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
  });
});