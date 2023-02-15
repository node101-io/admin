let isAddContentChoicesOpen = false;
let hoveredContentItem = null;
let selectionIndex = -1;
let selectionNode = null;
let focusNode = null;
let anchorNode = null;
let selectionString = null;

function changeAddContentState(wrapper) {
  const button = wrapper.childNodes[0];
  const choicesWraper = wrapper.childNodes[1];

  if (isAddContentChoicesOpen) {
    button.classList.remove('general-writing-each-content-item-add-button-icon-open-animation-class');
    button.classList.add('general-writing-each-content-item-add-button-icon-close-animation-class');
    choicesWraper.classList.remove('general-writing-each-content-item-add-button-choices-open-animation-class');
    choicesWraper.classList.add('general-writing-each-content-item-add-button-choices-close-animation-class');
  } else {
    button.classList.remove('general-writing-each-content-item-add-button-icon-close-animation-class');
    button.classList.add('general-writing-each-content-item-add-button-icon-open-animation-class');
    choicesWraper.classList.remove('general-writing-each-content-item-add-button-choices-close-animation-class');
    choicesWraper.classList.add('general-writing-each-content-item-add-button-choices-open-animation-class');
  }
  isAddContentChoicesOpen = !isAddContentChoicesOpen;
};

function createEachContentItemWrapper() {
  const wrapper = document.createElement('div');
  wrapper.classList.add('general-writing-each-content-item-wrapper');
  
  const leftOptions = document.createElement('div');
  leftOptions.classList.add('general-writing-each-content-item-left-tag-wrapper');
  
  const leftLine = document.createElement('div');
  leftLine.classList.add('general-writing-each-content-item-tag-line');

  const deleteButton = document.createElement('div');
  deleteButton.classList.add('general-writing-each-content-item-delete-button');

  const deleteButtonIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  deleteButtonIcon.classList.add('general-writing-each-content-item-delete-button-icon');
  deleteButtonIcon.setAttributeNS(null, 'viewBox', '0 0 448 512');

  const deleteButtonPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  deleteButtonPath.setAttributeNS(null, 'd', 'M135.2 17.7C140.6 6.8 151.7 0 163.8 0H284.2c12.1 0 23.2 6.8 28.6 17.7L320 32h96c17.7 0 32 14.3 32 32s-14.3 32-32 32H32C14.3 96 0 81.7 0 64S14.3 32 32 32h96l7.2-14.3zM32 128H416V448c0 35.3-28.7 64-64 64H96c-35.3 0-64-28.7-64-64V128zm96 64c-8.8 0-16 7.2-16 16V432c0 8.8 7.2 16 16 16s16-7.2 16-16V208c0-8.8-7.2-16-16-16zm96 0c-8.8 0-16 7.2-16 16V432c0 8.8 7.2 16 16 16s16-7.2 16-16V208c0-8.8-7.2-16-16-16zm96 0c-8.8 0-16 7.2-16 16V432c0 8.8 7.2 16 16 16s16-7.2 16-16V208c0-8.8-7.2-16-16-16z');
  deleteButtonIcon.appendChild(deleteButtonPath);
  deleteButton.appendChild(deleteButtonIcon);
  
  leftLine.appendChild(deleteButton);

  const addButtonWrapper = document.createElement('div');
  addButtonWrapper.classList.add('general-writing-each-content-item-add-button-wrapper');
  
  const addButton = document.createElement('div');
  addButton.classList.add('general-writing-each-content-item-add-button');

  const addButtonIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  addButtonIcon.classList.add('general-writing-each-content-item-delete-button-icon');
  addButtonIcon.setAttributeNS(null, 'viewBox', '0 0 448 512');

  const addButtonPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  addButtonPath.setAttributeNS(null, 'd', 'M240 80c0-17.7-14.3-32-32-32s-32 14.3-32 32V224H32c-17.7 0-32 14.3-32 32s14.3 32 32 32H176V432c0 17.7 14.3 32 32 32s32-14.3 32-32V288H384c17.7 0 32-14.3 32-32s-14.3-32-32-32H240V80z');
  addButtonIcon.appendChild(addButtonPath);
  addButton.appendChild(addButtonIcon);
  addButtonWrapper.appendChild(addButton);

  const addButtonChoicesWrapper = document.createElement('div');
  addButtonChoicesWrapper.classList.add('general-writing-each-content-item-add-button-choices-wrapper');

  const choices = [
    {
      name: 'header',
      viewBox: '0 0 448 512',
      path: 'M0 64C0 46.3 14.3 32 32 32H80h48c17.7 0 32 14.3 32 32s-14.3 32-32 32H112V208H336V96H320c-17.7 0-32-14.3-32-32s14.3-32 32-32h48 48c17.7 0 32 14.3 32 32s-14.3 32-32 32H400V240 416h16c17.7 0 32 14.3 32 32s-14.3 32-32 32H368 320c-17.7 0-32-14.3-32-32s14.3-32 32-32h16V272H112V416h16c17.7 0 32 14.3 32 32s-14.3 32-32 32H80 32c-17.7 0-32-14.3-32-32s14.3-32 32-32H48V240 96H32C14.3 96 0 81.7 0 64z'
    },
    {
      name: 'text',
      viewBox: '0 0 448 512',
      path: 'M192 32h64H416c17.7 0 32 14.3 32 32s-14.3 32-32 32H384l0 352c0 17.7-14.3 32-32 32s-32-14.3-32-32l0-352H288V448c0 17.7-14.3 32-32 32s-32-14.3-32-32V352H192c-88.4 0-160-71.6-160-160s71.6-160 160-160z'
    },
    {
      name: 'image',
      viewBox: '0 0 512 512',
      path: 'M448 80c8.8 0 16 7.2 16 16V415.8l-5-6.5-136-176c-4.5-5.9-11.6-9.3-19-9.3s-14.4 3.4-19 9.3L202 340.7l-30.5-42.7C167 291.7 159.8 288 152 288s-15 3.7-19.5 10.1l-80 112L48 416.3l0-.3V96c0-8.8 7.2-16 16-16H448zM64 32C28.7 32 0 60.7 0 96V416c0 35.3 28.7 64 64 64H448c35.3 0 64-28.7 64-64V96c0-35.3-28.7-64-64-64H64zm80 192a48 48 0 1 0 0-96 48 48 0 1 0 0 96z'
    },
    {
      name: 'video',
      viewBox: '0 0 576 512',
      path: 'M549.655 124.083c-6.281-23.65-24.787-42.276-48.284-48.597C458.781 64 288 64 288 64S117.22 64 74.629 75.486c-23.497 6.322-42.003 24.947-48.284 48.597-11.412 42.867-11.412 132.305-11.412 132.305s0 89.438 11.412 132.305c6.281 23.65 24.787 41.5 48.284 47.821C117.22 448 288 448 288 448s170.78 0 213.371-11.486c23.497-6.321 42.003-24.171 48.284-47.821 11.412-42.867 11.412-132.305 11.412-132.305s0-89.438-11.412-132.305zm-317.51 213.508V175.185l142.739 81.205-142.739 81.201z'
    },
    {
      name: 'list',
      viewBox: '0 0 512 512',
      path: 'M64 144a48 48 0 1 0 0-96 48 48 0 1 0 0 96zM192 64c-17.7 0-32 14.3-32 32s14.3 32 32 32H480c17.7 0 32-14.3 32-32s-14.3-32-32-32H192zm0 160c-17.7 0-32 14.3-32 32s14.3 32 32 32H480c17.7 0 32-14.3 32-32s-14.3-32-32-32H192zm0 160c-17.7 0-32 14.3-32 32s14.3 32 32 32H480c17.7 0 32-14.3 32-32s-14.3-32-32-32H192zM64 464a48 48 0 1 0 0-96 48 48 0 1 0 0 96zm48-208a48 48 0 1 0 -96 0 48 48 0 1 0 96 0z'
    },
    {
      name: 'code',
      viewBox: '0 0 640 512',
      path: 'M392.8 1.2c-17-4.9-34.7 5-39.6 22l-128 448c-4.9 17 5 34.7 22 39.6s34.7-5 39.6-22l128-448c4.9-17-5-34.7-22-39.6zm80.6 120.1c-12.5 12.5-12.5 32.8 0 45.3L562.7 256l-89.4 89.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l112-112c12.5-12.5 12.5-32.8 0-45.3l-112-112c-12.5-12.5-32.8-12.5-45.3 0zm-306.7 0c-12.5-12.5-32.8-12.5-45.3 0l-112 112c-12.5 12.5-12.5 32.8 0 45.3l112 112c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L77.3 256l89.4-89.4c12.5-12.5 12.5-32.8 0-45.3z'
    },
    {
      name: 'quote',
      viewBox: '0 0 448 512',
      path: 'M0 216C0 149.7 53.7 96 120 96h8c17.7 0 32 14.3 32 32s-14.3 32-32 32h-8c-30.9 0-56 25.1-56 56v8h64c35.3 0 64 28.7 64 64v64c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V320 288 216zm256 0c0-66.3 53.7-120 120-120h8c17.7 0 32 14.3 32 32s-14.3 32-32 32h-8c-30.9 0-56 25.1-56 56v8h64c35.3 0 64 28.7 64 64v64c0 35.3-28.7 64-64 64H320c-35.3 0-64-28.7-64-64V320 288 216z'
    },
    {
      name: 'ellipsis',
      viewBox: '0 0 448 512',
      path: 'M0 256a56 56 0 1 1 112 0A56 56 0 1 1 0 256zm160 0a56 56 0 1 1 112 0 56 56 0 1 1 -112 0zm216-56a56 56 0 1 1 0 112 56 56 0 1 1 0-112z'
    }
  ];

  choices.forEach(choice => {
    const eachChoice = document.createElement('div');
    eachChoice.classList.add('general-writing-each-content-item-add-button-each-choice');
    eachChoice.classList.add('general-writing-each-choice-' + choice.name);

    const eachChoiceIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    eachChoiceIcon.classList.add('general-writing-each-content-item-add-button-each-choice-icon');
    eachChoiceIcon.setAttributeNS(null, 'viewBox', choice.viewBox);
    
    const eachChoicePath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    eachChoicePath.setAttributeNS(null, 'd', choice.path);
    eachChoiceIcon.appendChild(eachChoicePath);
    eachChoice.appendChild(eachChoiceIcon);

    addButtonChoicesWrapper.appendChild(eachChoice);
  });

  addButtonWrapper.appendChild(addButtonChoicesWrapper);
  leftLine.appendChild(addButtonWrapper);

  leftOptions.appendChild(leftLine);
  wrapper.appendChild(leftOptions);

  const innerWrapper = document.createElement('div');
  innerWrapper.classList.add('general-writing-each-content-item-inner-wrapper');
  const innerWrapperSpan = document.createElement('span');
  innerWrapper.appendChild(innerWrapperSpan);
  wrapper.appendChild(innerWrapper);

  const rightOptions = document.createElement('div');
  rightOptions.classList.add('general-writing-each-content-item-right-tag-wrapper');

  const rightLine = document.createElement('div');
  rightLine.classList.add('general-writing-each-content-item-tag-line');

  const orderUpButton = document.createElement('div');
  orderUpButton.classList.add('general-writing-each-content-item-order-up-button');

  const orderUpButtonIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  orderUpButtonIcon.classList.add('general-writing-each-content-item-order-button-icon');
  orderUpButtonIcon.setAttributeNS(null, 'viewBox', '0 0 448 512');

  const orderUpButtonPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  orderUpButtonPath.setAttributeNS(null, 'd', 'M201.4 105.4c12.5-12.5 32.8-12.5 45.3 0l192 192c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L224 173.3 54.6 342.6c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3l192-192z');
  orderUpButtonIcon.appendChild(orderUpButtonPath);
  orderUpButton.appendChild(orderUpButtonIcon);
  rightLine.appendChild(orderUpButton);

  const orderDownButton = document.createElement('div');
  orderDownButton.classList.add('general-writing-each-content-item-order-down-button');

  const orderDownButtonIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  orderDownButtonIcon.classList.add('general-writing-each-content-item-order-button-icon');
  orderDownButtonIcon.setAttributeNS(null, 'viewBox', '0 0 448 512');

  const orderDownButtonPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  orderDownButtonPath.setAttributeNS(null, 'd', 'M201.4 406.6c12.5 12.5 32.8 12.5 45.3 0l192-192c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L224 338.7 54.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l192 192z');
  orderDownButtonIcon.appendChild(orderDownButtonPath);
  orderDownButton.appendChild(orderDownButtonIcon);
  rightLine.appendChild(orderDownButton);

  rightOptions.appendChild(rightLine);
  wrapper.appendChild(rightOptions);

  return wrapper;
};

function createEllipsis() {
  const wrapper = document.querySelector('.general-writing-content-items-wrapper');
};

function formatHTML(contentInnerHTML, index, options) {
  if (!index)
    index = 0;

  if (!options)
    options = {};

  if (index >= contentInnerHTML.length)
    return '';

  let tag = '';
  while (contentInnerHTML[index] != '>')
    tag += contentInnerHTML[index++];
  tag += contentInnerHTML[index++];

  let newContentInnerHTML = '';

  const newOptions = {
    in_bold: tag.includes('general-writing-text-bold') || options?.in_bold,
    in_italic: tag.includes('general-writing-text-italic') || options?.in_italic,
    in_underline: tag.includes('general-writing-text-underline') || options?.in_underline
  };

  while (contentInnerHTML.substring(index, index + 7) != '</span>') {
    if (contentInnerHTML.substring(index, index + 5) == '<span') {
      const inner = formatHTML(contentInnerHTML, index, newOptions);
      newContentInnerHTML += inner.trim().split('\\').join('');
      index += inner.split('\\').join('').length;
    } else {
      newContentInnerHTML += contentInnerHTML[index++];
    }
  }

  if (
    (tag.includes('general-writing-text-empty')) ||
    (tag.includes('general-writing-text-bold') && options?.in_bold) ||
    (tag.includes('general-writing-text-italic') && options?.in_italic) ||
    (tag.includes('general-writing-text-underline') && options?.in_underline)
  ) {
    return tag.split('').map(_ => ' ').join('') + '\\' + newContentInnerHTML + '\\' + '       ';
  } else {
    return tag + newContentInnerHTML + '</span>';
  }
}

window.addEventListener('load', () => {
  const selectionMenu = document.querySelector('.general-writing-selection-menu');

  document.addEventListener('click', event => {
    if (ancestorWithClassName(event.target, 'general-writing-each-content-item-add-button')) {
      changeAddContentState(ancestorWithClassName(event.target, 'general-writing-each-content-item-add-button').parentNode);
    }

    if (ancestorWithClassName(event.target, 'general-writing-each-choice-text')) {
      const target = ancestorWithClassName(event.target, 'general-writing-each-choice-text').parentNode.parentNode.parentNode.parentNode;
      const newItem = createEachContentItemWrapper();

      const textWrapper = document.createElement('div');
      textWrapper.classList.add('general-writing-text');
      textWrapper.contentEditable = true;
      textWrapper.spellcheck = false;

      newItem.childNodes[1].appendChild(textWrapper);

      document.querySelector('.general-writing-content-items-wrapper').insertBefore(newItem, target);
      newItem.childNodes[1].childNodes[0].focus();

      changeAddContentState(target.childNodes[0].childNodes[0].childNodes[1])
    }

    if (ancestorWithClassName(event.target, 'general-writing-each-content-item-delete-button')) {
      const target = ancestorWithClassName(event.target, 'general-writing-each-content-item-delete-button').parentNode.parentNode.parentNode;
      createConfirm({
        title: 'Are you sure you want to delete this item?',
        text: 'You cannot take back this action. Please make sure you do not need this item anymore.',
        reject: 'Cancel',
        accept: 'Delete'
      }, res => {
        if (res) target.remove();
      });
    }

    if (ancestorWithClassName(event.target, 'general-writing-each-content-item-order-up-button')) {
      const target = ancestorWithClassName(event.target, 'general-writing-each-content-item-order-up-button').parentNode.parentNode.parentNode;
      if (target.previousElementSibling) {
        target.parentNode.insertBefore(target, target.previousElementSibling);
      }
    }

    if (ancestorWithClassName(event.target, 'general-writing-each-content-item-order-down-button')) {
      const target = ancestorWithClassName(event.target, 'general-writing-each-content-item-order-down-button').parentNode.parentNode.parentNode;
      if (target.nextElementSibling) {
        target.parentNode.insertBefore(target.nextElementSibling, target);
      }
    }

    if (ancestorWithClassName(event.target, 'general-writing-bold-button')) {
      event.preventDefault();

      const target = ancestorWithClassName(event.target, 'general-writing-bold-button');

      if (selectionIndex < 0 || !selectionNode || !selectionString?.trim().length) {
        target.parentNode.style.display = 'none';
        return;
      }

      const wrapper = selectionNode;

      if (target.classList.contains('general-writing-selection-menu-icon-selected')) { // Case 1
        const contentInnerHTML = wrapper.innerHTML.substring(0, wrapper.innerHTML.length - 7);
        let openTags = [];
        let i = 6;
        let contentInnerText = '';
        let newContentInnerHTML = '';

        if (contentInnerHTML.substring(0, 6) != '<span>')
          return;

        while (i < contentInnerHTML.length && contentInnerText.length < selectionIndex) {
          if (contentInnerHTML.substring(i, i + 7) == '</span>') {
            newContentInnerHTML += '</span>';
            openTags.pop();
            i += 7;
          } else if (contentInnerHTML.substring(i, i + 5) == '<span') {
            let tag = '';
            while (contentInnerHTML[i] != '>')
              tag += contentInnerHTML[i++];
            tag += contentInnerHTML[i++];
  
            openTags.push(tag);
            newContentInnerHTML += tag;
          } else {
            contentInnerText += contentInnerHTML[i];
            newContentInnerHTML += contentInnerHTML[i++];
          }
        }

        for (let i = 0; i < openTags.length; i++)
          newContentInnerHTML += '</span>';

        for (let i = 0; i < openTags.length; i++)
          newContentInnerHTML += openTags[i].replace('general-writing-text-bold', 'general-writing-text-empty');

        while (i < contentInnerHTML.length && contentInnerText.length < selectionIndex + selectionString.length) {
          if (contentInnerHTML.substring(i, i + 7) == '</span>') {
            newContentInnerHTML += '</span>';
            openTags.pop();
            openTags.pop();
            openTags.push('<span class=\'general-writing-text-bold-new\'>');
            newContentInnerHTML += '<span class=\'general-writing-text-bold-new\'>';
            i += 7;
          } else if (contentInnerHTML.substring(i, i + 5) == '<span') {
            let tag = '';
            while (contentInnerHTML[i] != '>')
              tag += contentInnerHTML[i++];
            tag += contentInnerHTML[i++];

            tag.replace('general-writing-text-bold', 'general-writing-text-empty');

            openTags.push(tag);
            newContentInnerHTML += tag;
          } else {
            contentInnerText += contentInnerHTML[i];
            newContentInnerHTML += contentInnerHTML[i++];
          }
        }

        for (let i = 0; i < openTags.length; i++)
          newContentInnerHTML += '</span>';

        openTags = openTags.filter(each => each.replace('general-writing-text-empty', 'general-writing-text-bold'));

        for (let i = 0; i < openTags.length; i++)
          newContentInnerHTML += openTags[i];

        while (i < contentInnerHTML.length) {
          if (contentInnerHTML.substring(i, i + 7) == '</span>') {
            newContentInnerHTML += '</span>';
            openTags.pop();
            i += 7;
          } else if (contentInnerHTML.substring(i, i + 5) == '<span') {
            let tag = '';
            while (contentInnerHTML[i] != '>')
              tag += contentInnerHTML[i++];
            tag += contentInnerHTML[i++];
  
            openTags.push(tag);
            newContentInnerHTML += tag;
          } else {
            contentInnerText += contentInnerHTML[i];
            newContentInnerHTML += contentInnerHTML[i++];
          }
        }

        for (let i = 0; i < openTags.length; i++)
          newContentInnerHTML += '</span>';

        wrapper.innerHTML = formatHTML('<span>' + newContentInnerHTML + '</span>');
        target.classList.remove('general-writing-selection-menu-icon-selected');        
      } else { // Case 2
        const contentInnerHTML = wrapper.innerHTML.substring(0, wrapper.innerHTML.length - 7);
        let openTags = [];
        let i = 6;
        let contentInnerText = '';
        let newContentInnerHTML = '';
  
        if (contentInnerHTML.substring(0, 6) != '<span>')
          return;
  
        while (i < contentInnerHTML.length && contentInnerText.length < selectionIndex) {
          if (contentInnerHTML.substring(i, i + 7) == '</span>') {
            newContentInnerHTML += '</span>';
            openTags.pop();
            i += 7;
          } else if (contentInnerHTML.substring(i, i + 5) == '<span') {
            let tag = '';
            while (contentInnerHTML[i] != '>')
              tag += contentInnerHTML[i++];
            tag += contentInnerHTML[i++];
  
            openTags.push(tag);
            newContentInnerHTML += tag;
          } else {
            contentInnerText += contentInnerHTML[i];
            newContentInnerHTML += contentInnerHTML[i++];
          }
        }

        for (let i = 0; i < openTags.length; i++)
          newContentInnerHTML += '</span>';

        openTags = openTags.filter(each => !each.includes('general-writing-text-bold')); // If any of these tags finish before new tag, then it would fall into case 1

        for (let i = 0; i < openTags.length; i++)
          newContentInnerHTML += openTags[i];

        openTags.push('<span class=\'general-writing-text-bold-new\'>');
        newContentInnerHTML += '<span class=\'general-writing-text-bold-new\'>';

        while (i < contentInnerHTML.length && contentInnerText.length < selectionIndex + selectionString.length) {
          if (contentInnerHTML.substring(i, i + 7) == '</span>') {
            if (!openTags[openTags.length - 1].includes('general-writing-text-bold-new')) {
              newContentInnerHTML += '</span>';
              openTags.pop();
            } else {
              newContentInnerHTML += '</span>';
              openTags.pop();
              openTags.pop();
              openTags.push('<span class=\'general-writing-text-bold-new\'>');
              newContentInnerHTML += '<span class=\'general-writing-text-bold-new\'>';
            }
            i += 7;
          } else if (contentInnerHTML.substring(i, i + 5) == '<span') {
            let tag = '';
            while (contentInnerHTML[i] != '>')
              tag += contentInnerHTML[i++];
            tag += contentInnerHTML[i++];

            openTags.push(tag);
            newContentInnerHTML += tag;
          } else {
            contentInnerText += contentInnerHTML[i];
            newContentInnerHTML += contentInnerHTML[i++];
          }
        }

        const tempOpenTags = [];

        while (!openTags[openTags.length - 1].includes('general-writing-text-bold-new')) {
          tempOpenTags.push(openTags.pop());
          newContentInnerHTML += '</span>';
        }

        openTags.pop();
        newContentInnerHTML += '</span>';

        while (tempOpenTags.length) {
          newContentInnerHTML += tempOpenTags[0];
          openTags.push(tempOpenTags.pop());
        }

        while (i < contentInnerHTML.length) {
          if (contentInnerHTML.substring(i, i + 7) == '</span>') {
            newContentInnerHTML += '</span>';
            openTags.pop();
            i += 7;
          } else if (contentInnerHTML.substring(i, i + 5) == '<span') {
            let tag = '';
            while (contentInnerHTML[i] != '>')
              tag += contentInnerHTML[i++];
            tag += contentInnerHTML[i++];
  
            openTags.push(tag);
            newContentInnerHTML += tag;
          } else {
            contentInnerText += contentInnerHTML[i];
            newContentInnerHTML += contentInnerHTML[i++];
          }
        }

        for (let i = 0; i < openTags.length; i++)
          newContentInnerHTML += '</span>';

        wrapper.innerHTML = formatHTML('<span>' + newContentInnerHTML.split('general-writing-text-bold-new').join('general-writing-text-bold') + '</span>');
        target.classList.add('general-writing-selection-menu-icon-selected');
      }
    }

    if (ancestorWithClassName(event.target, 'general-writing-italic-button')) {
      event.preventDefault();

      const target = ancestorWithClassName(event.target, 'general-writing-italic-button');

      if (selectionIndex < 0 || !selectionNode || !selectionString?.trim().length) {
        target.parentNode.style.display = 'none';
        return;
      }

      const wrapper = selectionNode;

      if (target.classList.contains('general-writing-selection-menu-icon-selected')) {
        const contentInnerHTML = wrapper.innerHTML.substring(0, wrapper.innerHTML.length - 7);
        const openTags = [];
        let i = 6;
        let contentInnerText = '';
        let newContentInnerHTML = '';
  
        if (contentInnerHTML.substring(0, 6) != '<span>')
          return;
  
        while (i < contentInnerHTML.length && contentInnerText.length < selectionIndex) {
          if (contentInnerHTML.substring(i, i + 7) == '</span>') {
            newContentInnerHTML += '</span>';
            openTags.pop();
            i += 7;
          } else if (contentInnerHTML.substring(i, i + 5) == '<span') {
            let tag = '';
            while (contentInnerHTML[i] != '>') {
              tag += contentInnerHTML[i++];
            }
            tag += contentInnerHTML[i++];
  
            openTags.push(tag);
            newContentInnerHTML += tag;
          } else {
            contentInnerText += contentInnerHTML[i];
            newContentInnerHTML += contentInnerHTML[i++];
          }
        }

        for (let i = 0; i < openTags.length; i++)
          newContentInnerHTML += '</span>';

        for (let i = 0; i < openTags.length; i++)
          if (!openTags[i].includes('general-writing-text-italic'))
            newContentInnerHTML += openTags[i];

        while (i < contentInnerHTML.length && contentInnerText.length < selectionIndex + selectionString.length) {
          if (contentInnerHTML.substring(i, i + 7) == '</span>') {
            if (!openTags[openTags.length - 1].includes('general-writing-text-italic'))
              newContentInnerHTML += '</span>';
            openTags.pop();
            i += 7;
          } else if (contentInnerHTML.substring(i, i + 5) == '<span') {
            let tag = '';
            while (contentInnerHTML[i] != '>') {
              tag += contentInnerHTML[i++];
            }
            tag += contentInnerHTML[i++];
  
            openTags.push(tag);
            if (!tag.includes('general-writing-text-italic'))
              newContentInnerHTML += tag;
          } else {
            contentInnerText += contentInnerHTML[i];
            newContentInnerHTML += contentInnerHTML[i++];
          }
        }

        for (let i = 0; i < openTags.length; i++)
          if (!openTags[i].includes('general-writing-text-italic'))
            newContentInnerHTML += '</span>';

        for (let i = 0; i < openTags.length; i++)
          newContentInnerHTML += openTags[i];

        while (i < contentInnerHTML.length) {
          if (contentInnerHTML.substring(i, i + 7) == '</span>') {
            newContentInnerHTML += '</span>';
            openTags.pop();
            i += 7;
          } else if (contentInnerHTML.substring(i, i + 5) == '<span') {
            let tag = '';
            while (contentInnerHTML[i] != '>') {
              tag += contentInnerHTML[i++];
            }
            tag += contentInnerHTML[i++];
  
            openTags.push(tag);
            newContentInnerHTML += tag;
          } else {
            contentInnerText += contentInnerHTML[i];
            newContentInnerHTML += contentInnerHTML[i++];
          }
        }

        for (let i = 0; i < openTags.length; i++)
          newContentInnerHTML += '</span>';

        wrapper.innerHTML = '<span>' + newContentInnerHTML + '</span>';
        target.classList.remove('general-writing-selection-menu-icon-selected');
      } else {
        const contentInnerHTML = wrapper.innerHTML.substring(0, wrapper.innerHTML.length - 7);
        const openTags = [];
        let i = 6;
        let contentInnerText = '';
        let newContentInnerHTML = '';
  
        if (contentInnerHTML.substring(0, 6) != '<span>')
          return;
  
        while (i < contentInnerHTML.length && contentInnerText.length < selectionIndex) {
          if (contentInnerHTML.substring(i, i + 7) == '</span>') {
            newContentInnerHTML += '</span>';
            openTags.pop();
            i += 7;
          } else if (contentInnerHTML.substring(i, i + 5) == '<span') {
            let tag = '';
            while (contentInnerHTML[i] != '>') {
              tag += contentInnerHTML[i++];
            }
            tag += contentInnerHTML[i++];
  
            openTags.push(tag);
            newContentInnerHTML += tag;
          } else {
            contentInnerText += contentInnerHTML[i];
            newContentInnerHTML += contentInnerHTML[i++];
          }
        }

        for (let i = 0; i < openTags.length; i++)
          newContentInnerHTML += '</span>';

        for (let i = 0; i < openTags.length; i++)
          if (!openTags[i].includes('general-writing-text-italic'))
            newContentInnerHTML += openTags[i];

        newContentInnerHTML += '<span class=\'general-writing-text-italic\'>';

        while (i < contentInnerHTML.length && contentInnerText.length < selectionIndex + selectionString.length) {
          if (contentInnerHTML.substring(i, i + 7) == '</span>') {
            if (!openTags[openTags.length - 1].includes('general-writing-text-italic'))
              newContentInnerHTML += '</span>';
            openTags.pop();
            i += 7;
          } else if (contentInnerHTML.substring(i, i + 5) == '<span') {
            let tag = '';
            while (contentInnerHTML[i] != '>') {
              tag += contentInnerHTML[i++];
            }
            tag += contentInnerHTML[i++];
  
            openTags.push(tag);
            if (!tag.includes('general-writing-text-italic'))
              newContentInnerHTML += tag;
          } else {
            contentInnerText += contentInnerHTML[i];
            newContentInnerHTML += contentInnerHTML[i++];
          }
        }

        newContentInnerHTML += '</span>';

        for (let i = 0; i < openTags.length; i++)
          if (!openTags[i].includes('general-writing-text-italic'))
            newContentInnerHTML += '</span>';

        for (let i = 0; i < openTags.length; i++)
          newContentInnerHTML += openTags[i];

        while (i < contentInnerHTML.length) {
          if (contentInnerHTML.substring(i, i + 7) == '</span>') {
            newContentInnerHTML += '</span>';
            openTags.pop();
            i += 7;
          } else if (contentInnerHTML.substring(i, i + 5) == '<span') {
            let tag = '';
            while (contentInnerHTML[i] != '>') {
              tag += contentInnerHTML[i++];
            }
            tag += contentInnerHTML[i++];
  
            openTags.push(tag);
            newContentInnerHTML += tag;
          } else {
            contentInnerText += contentInnerHTML[i];
            newContentInnerHTML += contentInnerHTML[i++];
          }
        }

        for (let i = 0; i < openTags.length; i++)
          newContentInnerHTML += '</span>';

        wrapper.innerHTML = '<span>' + newContentInnerHTML + '</span>';
        target.classList.add('general-writing-selection-menu-icon-selected');
      }
    }

    if (ancestorWithClassName(event.target, 'general-writing-underline-button')) {
      event.preventDefault();

      const target = ancestorWithClassName(event.target, 'general-writing-underline-button');

      if (selectionIndex < 0 || !selectionNode || !selectionString?.trim().length) {
        target.parentNode.style.display = 'none';
        return;
      }

      const wrapper = selectionNode;

      if (target.classList.contains('general-writing-selection-menu-icon-selected')) {
        const contentInnerHTML = wrapper.innerHTML.substring(0, wrapper.innerHTML.length - 7);
        const openTags = [];
        let i = 6;
        let contentInnerText = '';
        let newContentInnerHTML = '';
  
        if (contentInnerHTML.substring(0, 6) != '<span>')
          return;
  
        while (i < contentInnerHTML.length && contentInnerText.length < selectionIndex) {
          if (contentInnerHTML.substring(i, i + 7) == '</span>') {
            newContentInnerHTML += '</span>';
            openTags.pop();
            i += 7;
          } else if (contentInnerHTML.substring(i, i + 5) == '<span') {
            let tag = '';
            while (contentInnerHTML[i] != '>') {
              tag += contentInnerHTML[i++];
            }
            tag += contentInnerHTML[i++];
  
            openTags.push(tag);
            newContentInnerHTML += tag;
          } else {
            contentInnerText += contentInnerHTML[i];
            newContentInnerHTML += contentInnerHTML[i++];
          }
        }

        for (let i = 0; i < openTags.length; i++)
          newContentInnerHTML += '</span>';

        for (let i = 0; i < openTags.length; i++)
          if (!openTags[i].includes('general-writing-text-underline'))
            newContentInnerHTML += openTags[i];

        while (i < contentInnerHTML.length && contentInnerText.length < selectionIndex + selectionString.length) {
          if (contentInnerHTML.substring(i, i + 7) == '</span>') {
            if (!openTags[openTags.length - 1].includes('general-writing-text-underline'))
              newContentInnerHTML += '</span>';
            openTags.pop();
            i += 7;
          } else if (contentInnerHTML.substring(i, i + 5) == '<span') {
            let tag = '';
            while (contentInnerHTML[i] != '>') {
              tag += contentInnerHTML[i++];
            }
            tag += contentInnerHTML[i++];
  
            openTags.push(tag);
            if (!tag.includes('general-writing-text-underline'))
              newContentInnerHTML += tag;
          } else {
            contentInnerText += contentInnerHTML[i];
            newContentInnerHTML += contentInnerHTML[i++];
          }
        }

        for (let i = 0; i < openTags.length; i++)
          if (!openTags[i].includes('general-writing-text-underline'))
            newContentInnerHTML += '</span>';

        for (let i = 0; i < openTags.length; i++)
          newContentInnerHTML += openTags[i];

        while (i < contentInnerHTML.length) {
          if (contentInnerHTML.substring(i, i + 7) == '</span>') {
            newContentInnerHTML += '</span>';
            openTags.pop();
            i += 7;
          } else if (contentInnerHTML.substring(i, i + 5) == '<span') {
            let tag = '';
            while (contentInnerHTML[i] != '>') {
              tag += contentInnerHTML[i++];
            }
            tag += contentInnerHTML[i++];
  
            openTags.push(tag);
            newContentInnerHTML += tag;
          } else {
            contentInnerText += contentInnerHTML[i];
            newContentInnerHTML += contentInnerHTML[i++];
          }
        }

        for (let i = 0; i < openTags.length; i++)
          newContentInnerHTML += '</span>';

        wrapper.innerHTML = '<span>' + newContentInnerHTML + '</span>';
        target.classList.remove('general-writing-selection-menu-icon-selected');
      } else {
        const contentInnerHTML = wrapper.innerHTML.substring(0, wrapper.innerHTML.length - 7);
        const openTags = [];
        let i = 6;
        let contentInnerText = '';
        let newContentInnerHTML = '';
  
        if (contentInnerHTML.substring(0, 6) != '<span>')
          return;
  
        while (i < contentInnerHTML.length && contentInnerText.length < selectionIndex) {
          if (contentInnerHTML.substring(i, i + 7) == '</span>') {
            newContentInnerHTML += '</span>';
            openTags.pop();
            i += 7;
          } else if (contentInnerHTML.substring(i, i + 5) == '<span') {
            let tag = '';
            while (contentInnerHTML[i] != '>') {
              tag += contentInnerHTML[i++];
            }
            tag += contentInnerHTML[i++];
  
            openTags.push(tag);
            newContentInnerHTML += tag;
          } else {
            contentInnerText += contentInnerHTML[i];
            newContentInnerHTML += contentInnerHTML[i++];
          }
        }

        for (let i = 0; i < openTags.length; i++)
          newContentInnerHTML += '</span>';

        for (let i = 0; i < openTags.length; i++)
          if (!openTags[i].includes('general-writing-text-underline'))
            newContentInnerHTML += openTags[i];

        newContentInnerHTML += '<span class=\'general-writing-text-underline\'>';

        while (i < contentInnerHTML.length && contentInnerText.length < selectionIndex + selectionString.length) {
          if (contentInnerHTML.substring(i, i + 7) == '</span>') {
            if (!openTags[openTags.length - 1].includes('general-writing-text-underline'))
              newContentInnerHTML += '</span>';
            openTags.pop();
            i += 7;
          } else if (contentInnerHTML.substring(i, i + 5) == '<span') {
            let tag = '';
            while (contentInnerHTML[i] != '>') {
              tag += contentInnerHTML[i++];
            }
            tag += contentInnerHTML[i++];
  
            openTags.push(tag);
            if (!tag.includes('general-writing-text-underline'))
              newContentInnerHTML += tag;
          } else {
            contentInnerText += contentInnerHTML[i];
            newContentInnerHTML += contentInnerHTML[i++];
          }
        }

        newContentInnerHTML += '</span>';

        for (let i = 0; i < openTags.length; i++)
          if (!openTags[i].includes('general-writing-text-underline'))
            newContentInnerHTML += '</span>';

        for (let i = 0; i < openTags.length; i++)
          newContentInnerHTML += openTags[i];

        while (i < contentInnerHTML.length) {
          if (contentInnerHTML.substring(i, i + 7) == '</span>') {
            newContentInnerHTML += '</span>';
            openTags.pop();
            i += 7;
          } else if (contentInnerHTML.substring(i, i + 5) == '<span') {
            let tag = '';
            while (contentInnerHTML[i] != '>') {
              tag += contentInnerHTML[i++];
            }
            tag += contentInnerHTML[i++];
  
            openTags.push(tag);
            newContentInnerHTML += tag;
          } else {
            contentInnerText += contentInnerHTML[i];
            newContentInnerHTML += contentInnerHTML[i++];
          }
        }

        for (let i = 0; i < openTags.length; i++)
          newContentInnerHTML += '</span>';

        wrapper.innerHTML = '<span>' + newContentInnerHTML + '</span>';
        target.classList.add('general-writing-selection-menu-icon-selected');
      }
    }
  });

  document.addEventListener('mouseover', event => {
    if (ancestorWithClassName(event.target, 'general-writing-each-content-item-wrapper')) {
      const target = ancestorWithClassName(event.target, 'general-writing-each-content-item-wrapper');

      if (hoveredContentItem == target)
        return;

      target.classList.add('general-writing-each-content-item-wrapper-hovered');
      target.childNodes[0].style = 'visibility: visible';
      target.childNodes[2].style = 'visibility: visible';

      if (hoveredContentItem) {
        hoveredContentItem.classList.remove('general-writing-each-content-item-wrapper-hovered');
        hoveredContentItem.childNodes[0].style = 'visibility: hidden';
        hoveredContentItem.childNodes[2].style = 'visibility: hidden';
        hoveredContentItem = target;
      } else {
        hoveredContentItem = target;
      }
    } else if (hoveredContentItem) {
      hoveredContentItem.classList.remove('general-writing-each-content-item-wrapper-hovered');
      hoveredContentItem.childNodes[0].style = 'visibility: hidden';
      hoveredContentItem.childNodes[2].style = 'visibility: hidden';
      hoveredContentItem = null
    }
  });

  document.addEventListener('keydown', event => {
    if (ancestorWithClassName(event.target, 'general-writing-text')) {
      const target = ancestorWithClassName(event.target, 'general-writing-text');

      if (event.key == 'Enter' && selectionIndex) {
        event.preventDefault();

        const wrapper = target;
        const contentInnerHTML = wrapper.innerHTML.substring(0, wrapper.innerHTML.length - 7);
        const openTags = [];
        let i = 6;
        let contentInnerText = '';
        let firstContentInnerHTML = '';
        let secondContentInnerHTML = '';
  
        if (contentInnerHTML.substring(0, 6) != '<span>')
          return;
  
        while (i < contentInnerHTML.length && contentInnerText.length < selectionIndex) {
          if (contentInnerHTML.substring(i, i + 7) == '</span>') {
            firstContentInnerHTML += '</span>';
            openTags.pop();
            i += 7;
          } else if (contentInnerHTML.substring(i, i + 5) == '<span') {
            let tag = '';
            while (contentInnerHTML[i] != '>') {
              tag += contentInnerHTML[i++];
            }
            tag += contentInnerHTML[i++];
  
            openTags.push(tag);
            firstContentInnerHTML += tag;
          } else {
            contentInnerText += contentInnerHTML[i];
            firstContentInnerHTML += contentInnerHTML[i++];
          }
        }

        for (let i = 0; i < openTags.length; i++)
          firstContentInnerHTML += '</span>';

        for (let i = 0; i < openTags.length; i++)
          secondContentInnerHTML += openTags[i];

        while (i < contentInnerHTML.length) {
          if (contentInnerHTML.substring(i, i + 7) == '</span>') {
            secondContentInnerHTML += '</span>';
            openTags.pop();
            i += 7;
          } else if (contentInnerHTML.substring(i, i + 5) == '<span') {
            let tag = '';
            while (contentInnerHTML[i] != '>') {
              tag += contentInnerHTML[i++];
            }
            tag += contentInnerHTML[i++];
  
            openTags.push(tag);
            secondContentInnerHTML += tag;
          } else {
            contentInnerText += contentInnerHTML[i];
            secondContentInnerHTML += contentInnerHTML[i++];
          }
        }

        wrapper.innerHTML = '<span>' + firstContentInnerHTML + '</span>';
      
        const newItem = createEachContentItemWrapper();

        const textWrapper = document.createElement('div');
        textWrapper.classList.add('general-writing-text');
        textWrapper.contentEditable = true;
        textWrapper.spellcheck = false;
        textWrapper.innerHTML = '<span>' + secondContentInnerHTML + '</span>';

        newItem.childNodes[1].appendChild(textWrapper);

        document.querySelector('.general-writing-content-items-wrapper').insertBefore(newItem, target.parentNode.parentNode);
        document.querySelector('.general-writing-content-items-wrapper').insertBefore(target.parentNode.parentNode, newItem);
        newItem.childNodes[1].childNodes[0].focus();
      } else if (event.key == 'Backspace') {
        if (!target.innerText.length) {
          target.parentNode.parentNode.remove();
        } else if (selectionIndex == 0 && target.parentNode?.parentNode?.previousElementSibling && target.parentNode.parentNode.previousElementSibling.childNodes[1].childNodes[0].classList.contains('general-writing-text')) {

          const wrapper = target.parentNode.parentNode.previousElementSibling.childNodes[1].childNodes[0];
          let innerHTML = wrapper.innerHTML.substring(6, wrapper.innerHTML.length - 7);
          innerHTML += target.innerHTML.substring(6, target.innerHTML.length - 7);
          wrapper.innerHTML = '<span>' + innerHTML + '</span>';
          target.parentNode.parentNode.remove();
        }
      }
    }

    if (event.target.classList.contains('general-writing-title') || event.target.classList.contains('general-writing-subtitle')) {
      if (event.key == 'Enter') {
        event.preventDefault();
        event.target.blur();
      }
    }
  });

  document.addEventListener('mouseup', event => {
    if (ancestorWithClassName(event.target, 'general-writing-selection-menu'))
      return;

    const selection = document.getSelection();
    const target = ancestorWithClassName(selection?.focusNode?.parentNode, 'general-writing-text');

    if (!target) {
      selectionMenu.style.display = 'none';
      selectionIndex = -1;
      focusNode = null;
      selectionString = null;
      return;
    }

    let anchorIndex = selection.anchorOffset;
    let focusIndex = selection.focusOffset;

    let anchorPrev = selection?.anchorNode;
    while (anchorPrev && !anchorPrev.classList?.contains('general-writing-text')) {
      while (anchorPrev.previousSibling) {
        anchorPrev = anchorPrev.previousSibling;
        anchorIndex += anchorPrev.innerText?.length || anchorPrev.nodeValue?.length || 0;
      }

      anchorPrev = anchorPrev.parentNode;
    }

    let focusPrev = selection?.focusNode;
    while (focusPrev && !focusPrev.classList?.contains('general-writing-text')) {
      while (focusPrev.previousSibling) {
        focusPrev = focusPrev.previousSibling;
        focusIndex += focusPrev.innerText?.length || focusPrev.nodeValue?.length || 0;
      }

      focusPrev = focusPrev.parentNode;
    }

    if (anchorIndex < focusIndex) {
      anchorNode = selection?.anchorNode?.parentNode;
      focusNode = selection?.focusNode?.parentNode;
      selectionIndex = anchorIndex;
    } else {
      anchorNode = selection?.focusNode?.parentNode;
      focusNode = selection?.anchorNode?.parentNode;
      selectionIndex = focusIndex;
    }

    selectionNode = target;
    selectionString = selection.toString();

    selectionMenu.style.display = 'flex';
    selectionMenu.style.left = target.getBoundingClientRect().left + 'px';
    selectionMenu.style.top = target.getBoundingClientRect().top + 'px';

    if (ancestorWithClassName(focusNode, 'general-writing-text-bold') && ancestorWithClassName(anchorNode, 'general-writing-text-bold'))
      document.querySelector('.general-writing-bold-button').classList.add('general-writing-selection-menu-icon-selected');
    else
      document.querySelector('.general-writing-bold-button').classList.remove('general-writing-selection-menu-icon-selected');

    if (ancestorWithClassName(focusNode, 'general-writing-text-italic') && ancestorWithClassName(anchorNode, 'general-writing-text-italic'))
      document.querySelector('.general-writing-italic-button').classList.add('general-writing-selection-menu-icon-selected');
    else
      document.querySelector('.general-writing-italic-button').classList.remove('general-writing-selection-menu-icon-selected');

    if (ancestorWithClassName(focusNode, 'general-writing-text-underline') && ancestorWithClassName(anchorNode, 'general-writing-text-underline'))
      document.querySelector('.general-writing-underline-button').classList.add('general-writing-selection-menu-icon-selected');
    else
      document.querySelector('.general-writing-underline-button').classList.remove('general-writing-selection-menu-icon-selected');
  });

  document.addEventListener('keyup', event => {
    const selection = document.getSelection();
    const target = ancestorWithClassName(selection?.focusNode?.parentNode, 'general-writing-text');

    if (!target) {
      selectionMenu.style.display = 'none';
      selectionIndex = -1;
      focusNode = null;
      selectionString = null;
      return;
    }

    let anchorIndex = selection.anchorOffset;
    let focusIndex = selection.focusOffset;

    let anchorPrev = selection?.anchorNode;
    while (anchorPrev && !anchorPrev.classList?.contains('general-writing-text')) {
      while (anchorPrev.previousSibling) {
        anchorPrev = anchorPrev.previousSibling;
        anchorIndex += anchorPrev.innerText?.length || anchorPrev.nodeValue?.length || 0;
      }

      anchorPrev = anchorPrev.parentNode;
    }

    let focusPrev = selection?.focusNode;
    while (focusPrev && !focusPrev.classList?.contains('general-writing-text')) {
      while (focusPrev.previousSibling) {
        focusPrev = focusPrev.previousSibling;
        focusIndex += focusPrev.innerText?.length || focusPrev.nodeValue?.length || 0;
      }

      focusPrev = focusPrev.parentNode;
    }

    if (anchorIndex < focusIndex) {
      anchorNode = selection?.anchorNode?.parentNode;
      focusNode = selection?.focusNode?.parentNode;
      selectionIndex = anchorIndex;
    } else {
      anchorNode = selection?.focusNode?.parentNode;
      focusNode = selection?.anchorNode?.parentNode;
      selectionIndex = focusIndex;
    }

    selectionNode = target;
    selectionString = selection.toString();

    selectionMenu.style.display = 'flex';
    selectionMenu.style.left = target.getBoundingClientRect().left + 'px';
    selectionMenu.style.top = target.getBoundingClientRect().top + 'px';

    if (ancestorWithClassName(focusNode, 'general-writing-text-bold') && ancestorWithClassName(anchorNode, 'general-writing-text-bold'))
      document.querySelector('.general-writing-bold-button').classList.add('general-writing-selection-menu-icon-selected');
    else
      document.querySelector('.general-writing-bold-button').classList.remove('general-writing-selection-menu-icon-selected');

    if (ancestorWithClassName(focusNode, 'general-writing-text-italic') && ancestorWithClassName(anchorNode, 'general-writing-text-italic'))
      document.querySelector('.general-writing-italic-button').classList.add('general-writing-selection-menu-icon-selected');
    else
      document.querySelector('.general-writing-italic-button').classList.remove('general-writing-selection-menu-icon-selected');

    if (ancestorWithClassName(focusNode, 'general-writing-text-underline') && ancestorWithClassName(anchorNode, 'general-writing-text-underline'))
      document.querySelector('.general-writing-underline-button').classList.add('general-writing-selection-menu-icon-selected');
    else
      document.querySelector('.general-writing-underline-button').classList.remove('general-writing-selection-menu-icon-selected');
  });

  document.addEventListener('focusin', event => {
    if (ancestorWithClassName(event.target, 'general-writing-text')) {
      const target = ancestorWithClassName(event.target, 'general-writing-text');
      target.spellcheck = false;
      target.focus();
    }

    if (event.target.classList.contains('general-writing-title') || event.target.classList.contains('general-writing-subtitle')) {
      event.target.spellcheck = false;
      event.target.focus();
    }
  });

  document.addEventListener('input', event => {
    if (event.target.classList.contains('general-writing-title') || event.target.classList.contains('general-writing-subtitle')) {
      event.target.style.height = (event.target.scrollHeight) + 'px';
      event.target.style.minHeight = (event.target.scrollHeight) + 'px';
    }
  });
});