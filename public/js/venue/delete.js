window.addEventListener('load', () => {
  if (document.getElementById('venue-search-input')) {
    document.getElementById('venue-search-input').focus();
    document.getElementById('venue-search-input').select();

    document.getElementById('venue-search-input').addEventListener('keyup', event => {
      if (event.key == 'Enter' && event.target.value?.trim()?.length) {
        window.location = `/venue/delete?search=${event.target.value.trim()}`;
      } else if (event.key == 'Enter') {
        window.location = '/venue/delete';
      }
    });
  }

  document.addEventListener('click', event => {
    if (event.target.classList.contains('restore-each-venue-button')) {
      createConfirm({
        title: 'Are you sure you want to restore this venue?',
        text: 'Do not forget to fix the order of the venue once you restore it. All restored venues are ordered as if they are new',
        reject: 'Cancel',
        accept: 'Restore'
      }, res => {
        if (res) {
          serverRequest('/venue/restore', 'POST', {
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