window.addEventListener('load', () => {
  if (document.getElementById('guide-search-input')) {
    document.getElementById('guide-search-input').focus();
    document.getElementById('guide-search-input').select();

    document.getElementById('guide-search-input').addEventListener('keyup', event => {
      if (event.key == 'Enter' && event.target.value?.trim()?.length) {
        window.location = `/guide/delete?search=${event.target.value.trim()}`;
      } else if (event.key == 'Enter') {
        window.location = '/guide/delete';
      }
    });
  }

  document.addEventListener('click', event => {
    if (event.target.classList.contains('restore-each-guide-button')) {
      createConfirm({
        title: 'Are you sure you want to restore this guide?',
        text: 'Do not forget to fix the order of the guide once you restore it. All restored guides are ordered as if they are new',
        reject: 'Cancel',
        accept: 'Restore'
      }, res => {
        if (res) {
          serverRequest('/guide/restore', 'POST', {
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