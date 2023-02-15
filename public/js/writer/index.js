window.addEventListener('load', () => {
  if (document.getElementById('writer-search-input')) {
    document.getElementById('writer-search-input').focus();
    document.getElementById('writer-search-input').select();

    document.getElementById('writer-search-input').addEventListener('keyup', event => {
      if (event.key == 'Enter' && event.target.value?.trim()?.length) {
        window.location = `/writer?search=${event.target.value.trim()}`;
      } else if (event.key == 'Enter') {
        window.location = '/writer';
      }
    });
  }

  document.addEventListener('click', event => {
    if (event.target.classList.contains('order-each-writer-button')) {
      createConfirm({
        title: 'Are you sure you want to increase the order of this writer?',
        text: 'Writers are sorted by their order in the website. You may change the order of a writer whenever you like.',
        reject: 'Cancel',
        accept: 'Move Up'
      }, res => {
        if (res) {
          serverRequest('/writer/order', 'POST', {
            id: event.target.parentNode.parentNode.id
          }, res => {
            if (!res.success) return throwError(res.error);

            return location.reload();
          });
        };
      });
    };

    if (event.target.classList.contains('delete-each-writer-button')) {
      createConfirm({
        title: 'Are you sure you want to delete this writer?',
        text: 'You can restore the writer whenever you like from the \`Deleted Writers\` page.',
        reject: 'Cancel',
        accept: 'Delete'
      }, res => {
        if (res) {
          serverRequest('/writer/delete', 'POST', {
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