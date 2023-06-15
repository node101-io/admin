window.addEventListener('load', () => {
  const book = JSON.parse(document.getElementById('book-json').value);
  const chapter = document.getElementById('chapter-json') ? JSON.parse(document.getElementById('chapter-json').value) : null;

  document.addEventListener('click', event => {
    if (event.target.id == 'create-chapter-button') {
      if (chapter) {
        createFormPopUp({
          title: 'Add a New Chapter',
          url: `/book/chapter/create?book_id=${book._id}&chapter_id=${chapter._id}`,
          method: 'POST',
          description: 'Add a new sub-chapter to this chapter.',
          inputs: [
            {
              name: 'title',
              placeholder: 'Title'
            }
          ],
          button: 'Add Sub-Chapter'
        }, (error, res) => {
          if (error) return alert(error);
          if (!res) return;
  
          return window.location.reload();
        });
      } else {
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
    }
  })
})