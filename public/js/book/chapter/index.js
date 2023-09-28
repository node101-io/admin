window.addEventListener('load', () => {
  const book = JSON.parse(document.getElementById('book-json').value);
  const chapter = document.getElementById('chapter-json') ? JSON.parse(document.getElementById('chapter-json').value) : null;

  document.addEventListener('click', event => {
    if (event.target.id == 'create-chapter-button') {
      if (chapter) {
        createFormPopUp({
          title: 'Add a New Chapter',
          url: `/book/chapter/create?book_id=${book._id}&chapter_id=${chapter._id}`,
          method: 'POST',
          description: 'Add a new sub-chapter to this chapter.',
          inputs: [
            {
              name: 'title',
              placeholder: 'Title'
            }
          ],
          button: 'Add Sub-Chapter'
        }, (error, res) => {
          if (error) return alert(error);
          if (!res) return;
  
          return window.location.reload();
        });
      } else {
        createFormPopUp({
          title: 'Add a New Chapter',
          url: '/book/chapter/create?book_id=' + book._id,
          method: 'POST',
          description: 'Add a new chapter to this book. If you want to add a sub-chapter, use the buttons below each chapter.',
          inputs: [
            {
              name: 'title',
              placeholder: 'Title'
            }
          ],
          button: 'Add Chapter'
        }, (error, res) => {
          if (error) return alert(error);
          if (!res) return;
  
          return window.location.reload();
        });
      };
    };

    if (event.target.id == 'create-writing-button') {
      if (chapter) {
        createFormPopUp({
          title: 'Create a New Writing',
          url: `/book/writing/create?chapter_id=${chapter._id}`,
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
      } else {
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
      };
    };

    if (event.target.classList.contains('order-each-children-button')) {
      serverRequest('/book/chapter/order?id=' + book._id, 'POST', {
        id: event.target.parentNode.parentNode.id
      }, res => {
        if (!res.success) return throwError(res.error);

        return location.reload();
      });
    };

    if (event.target.classList.contains('delete-each-children-button')) {
      createConfirm({
        title: 'Are you sure you want to delete this writing?',
        text: 'This action cannot be undone.',
        reject: 'Cancel',
        accept: 'Delete'
      }, res => {
        if (res) {
          serverRequest('/book/writing/delete?id=' + book._id, 'POST', {
            id: event.target.parentNode.parentNode.id
          }, res => {
            if (!res.success) return throwError(res.error);

            return location.reload();
          });
        };
      });
    };
  });

  if (document.getElementById('book-search-input')) {
    document.getElementById('book-search-input').focus();
    document.getElementById('book-search-input').select();

    document.getElementById('book-search-input').addEventListener('keyup', event => {
      if (event.key == 'Enter' && event.target.value?.trim()?.length) {
        window.location = `/book?search=${event.target.value.trim()}`;
      } else if (event.key == 'Enter') {
        window.location = '/book';
      };
    });
  };
});