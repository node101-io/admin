window.addEventListener('load', () => {
  let openSelectInput = null;

  document.addEventListener('click', event => {
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