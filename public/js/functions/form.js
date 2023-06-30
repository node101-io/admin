function createImage(url, imageWrapper) {
  imageWrapper.innerHTML = '';
  imageWrapper.style.cursor = 'default';

  const image = document.createElement('img');
  image.classList.add('general-image-input-image');
  image.style.backgroundImage = `url(${url}?${new Date().getTime()})`;
  imageWrapper.appendChild(image);

  const deleteButton = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  deleteButton.classList.add('general-image-input-delete-button');
  deleteButton.setAttributeNS(null, 'viewBox', '0 0 320 512');
  deleteButton.style.fill = 'var(--warning-color)';

  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttributeNS(null, 'd', 'M310.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L160 210.7 54.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L114.7 256 9.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L160 301.3 265.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L205.3 256 310.6 150.6z');
  deleteButton.appendChild(path);

  imageWrapper.appendChild(deleteButton);
};

function createImageInput(imageWrapper) {
  imageWrapper.innerHTML = '';
  imageWrapper.style.cursor = 'pointer';

  const input = document.createElement('input');
  input.classList.add('display-none');
  input.id = 'image';
  input.type = 'file';
  imageWrapper.appendChild(input);

  const placeholder = document.createElement('div');
  placeholder.classList.add('general-image-input-placeholder');
  placeholder.innerHTML = 'Upload from your device.';
  imageWrapper.appendChild(placeholder);
};

window.addEventListener('load', () => {
  let openSelectInput = null;

  document.addEventListener('click', event => {
    if (ancestorWithClassName(event.target, 'general-image-input-delete-button')) {
      const target = ancestorWithClassName(event.target, 'general-image-input-delete-button');
      const wrapper = target.parentNode;

      createImageInput(wrapper);
    }

    if (ancestorWithClassName(event.target, 'general-checkbox-input-wrapper')) {
      const target = ancestorWithClassName(event.target, 'general-checkbox-input-wrapper');

      if (target.childNodes[0]?.classList.contains('general-checkbox-input-box-selected')) {
        target.childNodes[0].classList.remove('general-checkbox-input-box-selected');
      } else {
        target.childNodes[0].classList.add('general-checkbox-input-box-selected');
      }
    }

    if (openSelectInput && !ancestorWithClassName(event.target, 'general-select-input-wrapper')) {
      openSelectInput.style.overflow = 'hidden';
      openSelectInput.style.borderColor = 'transparent';
      openSelectInput.style.boxShadow = '0 0 2px var(--shadow-color)';
      openSelectInput = null;
    }

    if (event.target.classList.contains('general-select-each-input-choice')) {
      event.target.parentNode.parentNode.querySelector('.general-select-input-real-value').value = event.target.id.replace('select-input-', '');
      event.target.parentNode.parentNode.querySelector('.general-select-input-selected-value').value = event.target.innerHTML;
      openSelectInput.style.overflow = 'hidden';
      openSelectInput.style.borderColor = 'transparent';
      openSelectInput.style.boxShadow = '0 0 2px var(--shadow-color)';
      openSelectInput = null;
    } else if (ancestorWithClassName(event.target, 'general-select-input-wrapper')) {
      const target = ancestorWithClassName(event.target, 'general-select-input-wrapper');

      if (target == openSelectInput)
        return;

      if (openSelectInput && openSelectInput != target) {
        openSelectInput.style.overflow = 'hidden';
        openSelectInput.style.borderColor = 'transparent';
        openSelectInput.style.boxShadow = '0 0 2px var(--shadow-color)';
      }

      openSelectInput = target;
      openSelectInput.style.overflow = 'visible';
      openSelectInput.style.borderColor = 'var(--main-color)';
      openSelectInput.style.boxShadow = 'none';
    }    
  });

  document.addEventListener('input', event => {
    if (event.target.classList.contains('general-select-input-selected-value') && !event.target.classList.contains('do-not-listen')) {
      const choices = event.target.nextElementSibling?.childNodes;

      for (let i = 0; i < choices.length; i++)
        if (choices[i].innerHTML.includes(event.target.value.trim().toLocaleLowerCase())) {
          choices[i].style.display = 'flex';
        } else {
          choices[i].style.display = 'none';
        }
    }
  });

  document.addEventListener('keyup', event => {
    if (event.key == 'Enter' && event.target.classList.contains('general-select-input-selected-value')) {
      openSelectInput.style.overflow = 'hidden';
      openSelectInput.style.borderColor = 'transparent';
      openSelectInput.style.boxShadow = '0 0 2px var(--shadow-color)';
      openSelectInput = null;
      event.target.blur();
    }
  });
});