const STATIC_LINK_URL = 'https://library.node101.io/stable/'

window.addEventListener('load', () => {
  const book = JSON.parse(document.getElementById('book-json').value);
  const chapter = document.getElementById('chapter-json') ? JSON.parse(document.getElementById('chapter-json').value) : null;

  if (document.getElementById('writing-search-input')) {
    document.getElementById('writing-search-input').focus();
    document.getElementById('writing-search-input').select();

    document.getElementById('writing-search-input').addEventListener('keyup', event => {
      if (event.key == 'Enter' && event.target.value?.trim()?.length) {
        window.location = `/book/writing?id=${book._id}&search=${event.target.value.trim()}`;
      } else if (event.key == 'Enter') {
        window.location = '/book/writing?id=' + book._id;
      }
    });
  }

  document.addEventListener('click', event => {
    const copyElement = document.getElementById('copy-element');

    if (event.target.id == 'create-writing-button') {
      if (!book.is_completed)
        return createConfirm({
          title: 'Unauthorized Request',
          text: 'You must complete a book before you start adding writings. Please complete the book from edit book page',
          reject: 'Close'
        }, _ => { });

      createFormPopUp({
        title: 'Create a New Writing',
        url: `/book/writing/create?id=${book._id}`,
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

        return window.location = `/book/writing/edit?id=${book._id}&writing_id=${res.id}`;
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
      serverRequest('/book/writing/order?id=' + book._id, 'POST', {
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
          serverRequest('/book/writing/delete?id=' + book._id, 'POST', {
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