window.addEventListener('load', () => {
  const book = JSON.parse(document.getElementById('book-json').value);

  if (document.getElementById('writing-search-input')) {
    document.getElementById('writing-search-input').focus();
    document.getElementById('writing-search-input').select();

    document.getElementById('writing-search-input').addEventListener('keyup', event => {
      if (event.key == 'Enter' && event.target.value?.trim()?.length) {
        window.location = `/book/writing/delete?id=${book._id}&search=${event.target.value.trim()}`;
      } else if (event.key == 'Enter') {
        window.location = '/book/writing/delete?id=' + book._id;
      }
    });
  }

  document.addEventListener('click', event => {
    if (event.target.id == 'create-writing-button') {
      if (!book.is_completed)
        return createConfirm({
          title: 'Unauthorized Request',
          text: 'You must complete a book before you start adding writings. Please complete the book from edit book page',
          reject: 'Close'
        }, _ => {});

      createFormPopUp({
        title: 'Create a New Writing',
        url: '/book/writing/create?id=' + book._id,
        method: 'POST',
        description: 'You will be able to edit the writing once you create it. A writing is not displayed in the site until it is completed.',
        inputs: [
          {
            name: 'title',
            placeholder: 'Title (must be unique)'
          }
        ],
        button: 'Create New Writing',
        errors: {
          duplicated_unique_field: 'Each writing must have a unique title. Please use edit & translations page to change this writing\'s details.'
        }
      }, (error, res) => {
        if (error) return alert(error);
        if (!res) return;

        return window.location = `/book/writing/edit?id=${book._id}&writing_id=${res.id}`;
      });
    }

    if (event.target.classList.contains('restore-each-writing-button')) {
      createConfirm({
        title: 'Are you sure you want to restore this writing?',
        text: 'Do not forget to fix the order of the writing once you restore it. All restored writings are ordered as if they are new',
        reject: 'Cancel',
        accept: 'Restore'
      }, res => {
        if (res) {
          serverRequest('/book/writing/restore?id=' + book._id, 'POST', {
            id: event.target.parentNode.parentNode.id
          }, res => {
            if (!res.success) return throwError(res.error);

            return location.reload();
          });
        };
      });
    };
  });
});