window.addEventListener('load', () => {
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
    if (event.target.classList.contains('order-each-book-button')) {
      serverRequest('/book/order', 'POST', {
        id: event.target.parentNode.parentNode.id
      }, res => {
        if (!res.success) return throwError(res.error);

        return location.reload();
      });
    };

    if (event.target.classList.contains('delete-each-book-button')) {
      createConfirm({
        title: 'Are you sure you want to delete this book?',
        text: 'You can restore the book whenever you like from the \`Deleted Members\` page..',
        reject: 'Cancel',
        accept: 'Delete'
      }, res => {
        if (res) {
          serverRequest('/book/delete', 'POST', {
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