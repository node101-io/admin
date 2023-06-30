window.addEventListener('load', () => {
  document.addEventListener('click', event => {
    if (event.target.classList.contains('delete-each-admin-button')) {
      createConfirm({
        title: 'Are you sure you want to delete this admin?',
        text: 'You cannot take back this action. The admin will loose access to its account.',
        reject: 'Cancel',
        accept: 'Delete'
      }, res => {
        if (res) {
          serverRequest('/admin/delete', 'POST', {
            id: event.target.parentNode.parentNode.id
          }, res => {
            if (!res.success) return throwError(res.error);

            createConfirm({
              title: 'Admin is Deleted',
              text: 'Close to reload the page.',
              accept: 'Close'
            }, _ => location.reload());
          });
        };
      });
    };
  });
});