window.addEventListener('load', () => {
  if (document.getElementById('event-search-input')) {
    document.getElementById('event-search-input').focus();
    document.getElementById('event-search-input').select();

    document.getElementById('event-search-input').addEventListener('keyup', event => {
      if (event.key == 'Enter' && event.target.value?.trim()?.length) {
        window.location = `/event?search=${event.target.value.trim()}`;
      } else if (event.key == 'Enter') {
        window.location = '/event';
      }
    });
  }

  document.addEventListener('click', event => {
    if (event.target.classList.contains('delete-each-event-button')) {
      createConfirm({
        title: 'Are you sure you want to delete this event?',
        text: 'You can restore the event whenever you like from the \`Deleted Events\` page.',
        reject: 'Cancel',
        accept: 'Delete'
      }, res => {
        if (res) {
          serverRequest('/event/delete', 'POST', {
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