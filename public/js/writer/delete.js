window.addEventListener('load', () => {
  if (document.getElementById('writer-search-input')) {
    document.getElementById('writer-search-input').focus();
    document.getElementById('writer-search-input').select();

    document.getElementById('writer-search-input').addEventListener('keyup', event => {
      if (event.key == 'Enter' && event.target.value?.trim()?.length) {
        window.location = `/writer/delete?search=${event.target.value.trim()}`;
      } else if (event.key == 'Enter') {
        window.location = '/writer/delete';
      }
    });
  }

  document.addEventListener('click', event => {
    if (event.target.classList.contains('restore-each-writer-button')) {
      createConfirm({
        title: 'Are you sure you want to restore this writer?',
        text: 'Do not forget to fix the order of the writer once you restore it. All restored writers are ordered as if they are new',
        reject: 'Cancel',
        accept: 'Restore'
      }, res => {
        if (res) {
          serverRequest('/writer/restore', 'POST', {
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