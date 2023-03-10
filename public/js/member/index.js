window.addEventListener('load', () => {
  if (document.getElementById('member-search-input')) {
    document.getElementById('member-search-input').focus();
    document.getElementById('member-search-input').select();

    document.getElementById('member-search-input').addEventListener('keyup', event => {
      if (event.key == 'Enter' && event.target.value?.trim()?.length) {
        window.location = `/member?search=${event.target.value.trim()}`;
      } else if (event.key == 'Enter') {
        window.location = '/member';
      }
    });
  }

  document.addEventListener('click', event => {
    if (event.target.classList.contains('order-each-member-button')) {
      serverRequest('/member/order', 'POST', {
        id: event.target.parentNode.parentNode.id
      }, res => {
        if (!res.success) return throwError(res.error);

        return location.reload();
      });
    };

    if (event.target.classList.contains('delete-each-member-button')) {
      createConfirm({
        title: 'Are you sure you want to delete this member?',
        text: 'You can restore the member whenever you like from the \`Deleted Members\` page.',
        reject: 'Cancel',
        accept: 'Delete'
      }, res => {
        if (res) {
          serverRequest('/member/delete', 'POST', {
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