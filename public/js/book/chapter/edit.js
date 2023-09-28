function createSelectionItem(id, name) {
  const choice = document.createElement('div');
  choice.classList.add('general-select-each-input-choice');
  choice.id = 'select-input-' + id;
  choice.innerHTML = name;
  return choice;
};

window.addEventListener('load', () => {
  const chapter = JSON.parse(document.getElementById('chapter-json').value);

  document.addEventListener('click', event => {
    if (event.target.id == 'update-button') {
      const error = document.getElementById('update-error');
      error.innerHTML = '';

      const title = document.getElementById('title').value;
      const writerId = document.getElementById('writer-id').value;

      if (!title || !title.trim().length)
        return error.innerHTML = 'Please enter a title for the chapter.';

      serverRequest('/book/chapter/edit?id=' + chapter._id, 'POST', {
        title,
        writer_id: writerId,
      }, res => {
        if (!res.success && res.error == 'duplicated_unique_field')
          return error.innerHTML = 'There is already a chapter with this title.'
        if (!res.success)
          return throwError(res.error);

        return createConfirm({
          title: 'Chapter is Updated',
          text: 'Chapter is updated. Close to reload the page.',
          accept: 'Close'
        }, _ => window.location.reload());
      });
    };

    if (event.target.id == 'update-turkish-button') {
      const error = document.getElementById('update-turkish-error');
      error.innerHTML = '';

      const title = document.getElementById('turkish-title').value;

      if (!title || !title.trim().length)
        return error.innerHTML = 'Please enter a title for the chapter.';

      serverRequest('/book/chapter/translate?id=' + chapter._id, 'POST', {
        language: 'tr',
        title,
      }, res => {
        if (!res.success && res.error == 'duplicated_unique_field')
          return error.innerHTML = 'There is already a chapter with this title.'
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

      const title = document.getElementById('russian-title').value;

      if (!title || !title.trim().length)
        return error.innerHTML = 'Please enter a title for the chapter.';

      serverRequest('/book/chapter/translate?id=' + chapter._id, 'POST', {
        language: 'ru',
        title,
      }, res => {
        if (!res.success && res.error == 'duplicated_unique_field')
          return error.innerHTML = 'There is already a chapter with this title.'
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
    };
  });
});