window.addEventListener('load', () => {
  document.addEventListener('click', event => {
    if (ancestorWithClassName(event.target, 'general-checkbox-input-wrapper')) {
      const target = ancestorWithClassName(event.target, 'general-checkbox-input-wrapper');

      if (target.childNodes[0]?.classList.contains('general-checkbox-input-box-selected')) {
        target.childNodes[0].classList.remove('general-checkbox-input-box-selected');
      } else {
        target.childNodes[0].classList.add('general-checkbox-input-box-selected');
      }
    }
  })
})