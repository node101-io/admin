window.addEventListener('load', () => {
  if (document.getElementById('blog-search-input')) {
    document.getElementById('blog-search-input').focus();
    document.getElementById('blog-search-input').select();

    document.getElementById('blog-search-input').addEventListener('keyup', event => {
      if (event.key == 'Enter' && event.target.value?.trim()?.length) {
        window.location = `/blog/delete?search=${event.target.value.trim()}`;
      } else if (event.key == 'Enter') {
        window.location = '/blog/delete';
      }
    });
  }

  document.addEventListener('click', event => {
    if (event.target.classList.contains('restore-each-blog-button')) {
      createConfirm({
        title: 'Are you sure you want to restore this blog?',
        text: 'Do not forget to fix the order of the blog once you restore it. All restored blogs are ordered as if they are new',
        reject: 'Cancel',
        accept: 'Restore'
      }, res => {
        if (res) {
          serverRequest('/blog/restore', 'POST', {
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