window.addEventListener('load', () => {
  if (document.getElementById('project-search-input')) {
    document.getElementById('project-search-input').focus();
    document.getElementById('project-search-input').select();

    document.getElementById('project-search-input').addEventListener('keyup', event => {
      if (event.key == 'Enter' && event.target.value?.trim()?.length) {
        window.location = `/project/delete?search=${event.target.value.trim()}`;
      } else if (event.key == 'Enter') {
        window.location = '/project/delete';
      }
    });
  }

  document.addEventListener('click', event => {
    if (event.target.classList.contains('restore-each-project-button')) {
      createConfirm({
        title: 'Are you sure you want to restore this project?',
        text: 'Do not forget to fix the order of the project once you restore it. All restored projects are ordered as if they are new',
        reject: 'Cancel',
        accept: 'Restore'
      }, res => {
        if (res) {
          serverRequest('/project/restore', 'POST', {
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