const STATIC_LINK_URL = 'https://library.node101.io/stable/'

window.addEventListener('load', () => {
  const blog = JSON.parse(document.getElementById('blog-json').value);

  if (document.getElementById('writing-search-input')) {
    document.getElementById('writing-search-input').focus();
    document.getElementById('writing-search-input').select();

    document.getElementById('writing-search-input').addEventListener('keyup', event => {
      if (event.key == 'Enter' && event.target.value?.trim()?.length) {
        window.location = `/blog/writing?id=${blog._id}&search=${event.target.value.trim()}`;
      } else if (event.key == 'Enter') {
        window.location = '/blog/writing?id=' + blog._id;
      }
    });
  }

  document.addEventListener('click', event => {
    const copyElement = document.getElementById('copy-element');

    if (event.target.id == 'create-writing-button') {
      if (!blog.is_completed)
        return createConfirm({
          title: 'Unauthorized Request',
          text: 'You must complete a blog before you start adding writings. Please complete the blog from edit blog page',
          reject: 'Close'
        }, _ => {});

      createFormPopUp({
        title: 'Create a New Writing',
        url: '/blog/writing/create?id=' + blog._id,
        method: 'POST',
        description: 'You will be able to edit the writing once you create it. A writing is not displayed in the site until it is completed.',
        inputs: [
          {
            name: 'title',
            placeholder: 'Title (must be unique)'
          }
        ],
        button: 'Create New Writing',
        errors: {
          duplicated_unique_field: 'Each writing must have a unique title. Please use edit & translations page to change this writing\'s details.'
        }
      }, (error, res) => {
        if (error) return alert(error);
        if (!res) return;

        return window.location = `/blog/writing/edit?id=${blog._id}&writing_id=${res.id}`;
      });
    }

    if (event.target.classList.contains('copy-static-link-each-writing-button')) {
      const id = event.target.parentNode.parentNode.id;
      copyElement.value = STATIC_LINK_URL + id;
      copyElement.select();
      copyElement.setSelectionRange(0, 99999);
      navigator.clipboard.writeText(copyElement.value);
      event.target.innerHTML = 'Copied!';
      setTimeout(() => {
        event.target.innerHTML = 'Copy Static Link';
      }, 1000);
    }

    if (event.target.classList.contains('order-each-writing-button')) {
      serverRequest('/blog/writing/order?id=' + blog._id, 'POST', {
        id: event.target.parentNode.parentNode.id
      }, res => {
        if (!res.success) return throwError(res.error);

        return location.reload();
      });
    };

    if (event.target.classList.contains('delete-each-writing-button')) {
      createConfirm({
        title: 'Are you sure you want to delete this writing?',
        text: 'You can restore a writing whenever you like from the \`Deleted Writings\` page.',
        reject: 'Cancel',
        accept: 'Delete'
      }, res => {
        if (res) {
          serverRequest('/blog/writing/delete?id=' + blog._id, 'POST', {
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