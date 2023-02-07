window.addEventListener('load', () => {
  document.querySelector('.general-writing-edit-content').addEventListener('keydown', event => {
    if (event.target.classList.contains('general-writing-bullets')) {
      event.preventDefault();
    }

    if (event.key == 'Backspace') {
      event.preventDefault();
    }
  })
})