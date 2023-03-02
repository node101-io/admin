window.addEventListener('load', () => {
  if (document.getElementById('book-search-input')) {
    document.getElementById('book-search-input').focus();
    document.getElementById('book-search-input').select();

    document.getElementById('book-search-input').addEventListener('keyup', event => {
      if (event.key == 'Enter' && event.target.value?.trim()?.length) {
        window.location = `/book/delete?search=${event.target.value.trim()}`;
      } else if (event.key == 'Enter') {
        window.location = '/book/delete';
      }
    });
  }

  document.addEventListener('click', event => {
    if (event.target.classList.contains('restore-each-book-button')) {
      createConfirm({
        title: 'Are you sure you want to restore this book?',
        text: 'Do not forget to fix the order of the book once you restore it. All restored books are ordered as if they are new',
        reject: 'Cancel',
        accept: 'Restore'
      }, res => {
        if (res) {
          serverRequest('/book/restore', 'POST', {
            id: event.target.parentNode.parentNode.id
          }, res => {
            console.log(res);
            if (!res.success) return throwError(res.error);

            return location.reload();
          });
        };
      });
    };
  });
});