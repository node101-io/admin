// Create and return and image input selector with id field equal to input id
function createImageInputSelector(id) {
  const wrapper = document.createElement('label');
  wrapper.classList.add('general-image-input-wrapper');

  const input = document.createElement('input');
  input.classList.add('display-none');
  input.type = 'file';
  wrapper.appendChild(input);

  const placeholder = document.createElement('')

  return wrapper;
}

// Create and return and image input after load with url equal to url of image and id field equal to close button id
function createImageInputLoaded(url, id) {

}

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