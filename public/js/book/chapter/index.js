window.addEventListener('load', () => {
  const book = JSON.parse(document.getElementById('book-json').value);

  document.addEventListener('click', event => {
    if (event.target.id == 'create-chapter-button') {
      createFormPopUp({
        title: 'Add a New Chapter',
        url: '/book/chapter/create?book_id=' + book._id,
        method: 'POST',
        description: 'Add a new chapter to this book. If you want to add a sub-chapter, use the buttons below each chapter.',
        inputs: [
          {
            name: 'title',
            placeholder: 'Title'
          }
        ],
        button: 'Add Chapter'
      }, (error, res) => {
        if (error) return alert(error);
        if (!res) return;

        return window.location.reload();
      });
    }

    if (event.target.classList.contains('create-chapter-button')) {
      createFormPopUp({
        title: 'Add a New Chapter',
        url: '/book/chapter/push?id=' + event.target.parentNode.parentNode.id,
        method: 'POST',
        description: 'Add a new chapter under this chapter. If you want to add a chapter directly to the book, use the buttons on top-right.',
        inputs: [
          {
            name: 'title',
            placeholder: 'Title'
          }
        ],
        button: 'Add Chapter'
      }, (error, res) => {
        if (error) return alert(error);
        if (!res) return;

        return window.location.reload();
      });
    }
  })
})