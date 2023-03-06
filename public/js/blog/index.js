window.addEventListener('load', () => {
  if (document.getElementById('blog-search-input')) {
    document.getElementById('blog-search-input').focus();
    document.getElementById('blog-search-input').select();

    document.getElementById('blog-search-input').addEventListener('keyup', event => {
      if (event.key == 'Enter' && event.target.value?.trim()?.length) {
        window.location = `/blog?search=${event.target.value.trim()}`;
      } else if (event.key == 'Enter') {
        window.location = '/blog';
      }
    });
  }

  document.addEventListener('click', event => {
    if (event.target.classList.contains('order-each-blog-button')) {
      serverRequest('/blog/order', 'POST', {
        id: event.target.parentNode.parentNode.id
      }, res => {
        if (!res.success) return throwError(res.error);

        return location.reload();
      });
    };

    if (event.target.classList.contains('delete-each-blog-button')) {
      createConfirm({
        title: 'Are you sure you want to delete this blog?',
        text: 'You can restore the blog whenever you like from the \`Deleted Blogs\` page..',
        reject: 'Cancel',
        accept: 'Delete'
      }, res => {
        if (res) {
          serverRequest('/blog/delete', 'POST', {
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