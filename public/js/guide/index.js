window.addEventListener('load', () => {
  if (document.getElementById('guide-search-input')) {
    document.getElementById('guide-search-input').focus();
    document.getElementById('guide-search-input').select();

    document.getElementById('guide-search-input').addEventListener('keyup', event => {
      if (event.key == 'Enter' && event.target.value?.trim()?.length) {
        window.location = `/guide?search=${event.target.value.trim()}`;
      } else if (event.key == 'Enter') {
        window.location = '/guide';
      }
    });
  }

  document.addEventListener('click', event => {
    if (event.target.classList.contains('order-each-guide-button')) {
      serverRequest('/guide/order', 'POST', {
        id: event.target.parentNode.parentNode.id
      }, res => {
        if (!res.success) return throwError(res.error);

        return location.reload();
      });
    };

    if (event.target.classList.contains('delete-each-guide-button')) {
      createConfirm({
        title: 'Are you sure you want to delete this guide?',
        text: 'You can restore the guide whenever you like from the \`Deleted Guides\` page..',
        reject: 'Cancel',
        accept: 'Delete'
      }, res => {
        if (res) {
          serverRequest('/guide/delete', 'POST', {
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