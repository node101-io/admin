window.addEventListener('load', () => {
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
    if (event.target.classList.contains('order-each-tag-button')) {
      serverRequest('/tag/order', 'POST', {
        id: event.target.parentNode.parentNode.id
      }, res => {
        if (!res.success) return throwError(res.error);

        return location.reload();
      });
    };

    if (event.target.classList.contains('delete-each-tag-button')) {
      createConfirm({
        title: 'Are you sure you want to delete this tag?',
        text: 'You cannot take back this action.',
        reject: 'Cancel',
        accept: 'Delete'
      }, res => {
        if (res) {
          serverRequest('/tag/delete', 'POST', {
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