window.addEventListener('load', () => {
  if (document.getElementById('venue-search-input')) {
    document.getElementById('venue-search-input').focus();
    document.getElementById('venue-search-input').select();

    document.getElementById('venue-search-input').addEventListener('keyup', event => {
      if (event.key == 'Enter' && event.target.value?.trim()?.length) {
        window.location = `/venue?search=${event.target.value.trim()}`;
      } else if (event.key == 'Enter') {
        window.location = '/venue';
      }
    });
  }

  document.addEventListener('click', event => {
    if (event.target.classList.contains('order-each-venue-button')) {
      serverRequest('/venue/order', 'POST', {
        id: event.target.parentNode.parentNode.id
      }, res => {
        if (!res.success) return throwError(res.error);

        return location.reload();
      });
    };

    if (event.target.classList.contains('delete-each-venue-button')) {
      createConfirm({
        title: 'Are you sure you want to delete this venue?',
        text: 'You can restore the venue whenever you like from the \`Deleted Venues\` page.',
        reject: 'Cancel',
        accept: 'Delete'
      }, res => {
        if (res) {
          serverRequest('/venue/delete', 'POST', {
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