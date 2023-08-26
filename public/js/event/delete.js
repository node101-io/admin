window.addEventListener('load', () => {
  if (document.getElementById('event-search-input')) {
    document.getElementById('event-search-input').focus();
    document.getElementById('event-search-input').select();

    document.getElementById('event-search-input').addEventListener('keyup', event => {
      if (event.key == 'Enter' && event.target.value?.trim()?.length) {
        window.location = `/event/delete?search=${event.target.value.trim()}`;
      } else if (event.key == 'Enter') {
        window.location = '/event/delete';
      }
    });
  }

  document.addEventListener('click', event => {
    if (event.target.classList.contains('restore-each-event-button')) {
      createConfirm({
        title: 'Are you sure you want to restore this event?',
        text: 'Do not forget to fix the order of the event once you restore it. All restored events are ordered as if they are new',
        reject: 'Cancel',
        accept: 'Restore'
      }, res => {
        if (res) {
          serverRequest('/event/restore', 'POST', {
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