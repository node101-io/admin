window.addEventListener('load', () => {
  if (document.getElementById('project-search-input')) {
    document.getElementById('project-search-input').focus();
    document.getElementById('project-search-input').select();

    document.getElementById('project-search-input').addEventListener('keyup', event => {
      if (event.key == 'Enter' && event.target.value?.trim()?.length) {
        window.location = `/project?search=${event.target.value.trim()}`;
      } else if (event.key == 'Enter') {
        window.location = '/project';
      }
    });
  }

  document.addEventListener('click', event => {
    if (event.target.classList.contains('order-each-project-button')) {
      createConfirm({
        title: 'Are you sure you want to increase the order of this project?',
        text: 'Projects are sorted by their order in the website. You may change the order of a project whenever you like.',
        reject: 'Cancel',
        accept: 'Move Up'
      }, res => {
        if (res) {
          serverRequest('/project/order', 'POST', {
            id: event.target.parentNode.parentNode.id
          }, res => {
            if (!res.success) return throwError(res.error);

            return location.reload();
          });
        };
      });
    };

    if (event.target.classList.contains('delete-each-project-button')) {
      createConfirm({
        title: 'Are you sure you want to delete this project?',
        text: 'You can restore the project whenever you like from the \`Deleted Members\` page..',
        reject: 'Cancel',
        accept: 'Delete'
      }, res => {
        if (res) {
          serverRequest('/project/delete', 'POST', {
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