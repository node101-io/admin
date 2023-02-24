/*
  Create a custom input popup to create a new document in the DB
  Expects to receive 1-3 inputs, more may result in poor UI
  To use with serverRequest.js and form.css

  Request:
  data: {
    title: String, // Title of the input pop up
    url: String, // Url to send the request to
    method: String, // Method of the request: ['GET', 'POST']
    description?: String, // Description of the input pop up
    inputs: [
      {
        name: String, // Name of the input in the request
        placeholder: String // Placeholder to show in the input
      }
    ],
    errors?: { // Custom error strings to show by error message. Fallback to default
      [ErrorString]: String // Error name must be match the error standards
    },
    button?: String // Custom button text
  }

  Response:
  callback: (error, response) => {
    If the action throws an error inside the function returns (error: ErrorString, response: null)
    If the action cancelled returns (error: null, response: null)
    If the action called serverRequest and received response.success == false, no callback. Displays error message.
    If the action called serverRequest without error (error: null, response: ServerResponse)
  }
*/

let isPopUpActive = false;

function createFormPopUp(data, callback) {
  const DEFAULT_BUTTON_TEXT = 'Create';
  const DEFAULT_ERRORS = {
    'bad_request': 'Please complete all the inputs.',
    'database_error': 'An error occured in the server. Please contact the developer team.',
    'duplicated_unique_field': 'It seems a unique field is matching an existing document. Please use only unique values.',
    'email_validation': 'Please enter a valid email address.',
    'network_error': 'Please check your internet connection and try again.',
    'unknown_error': 'An unknown error occured. Please try again later.'
  };
  const METHOD_VALUES = ['GET', 'POST'];

  if (isPopUpActive)
    return callback(null); // Acts as if the action is cancelled if a pop up is already active

  isPopUpActive = true;

  if (!data || typeof data != 'object')
    return callback('bad_request');

  if (!data.title || typeof data.title != 'string' || !data.title.trim().length)
    return callback('bad_request');
  
  if (!data.url || typeof data.url != 'string' || !data.url.trim().length)
    return callback('bad_request');

  if (!data.method || !METHOD_VALUES.includes(data.method))
    return callback('bad_request');

  if (!data.inputs || !Array.isArray(data.inputs) || !data.inputs.length)
    return callback('bad_request');

  const title = data.title.trim();
  const url = data.url.trim();
  const method = data.method;
  const description = data.description && typeof data.description == 'string' && data.description.trim().length ? data.description.trim() : null;
  const inputs = data.inputs.filter(each => each.name && typeof each.name == 'string' && each.name.trim().length && each.placeholder && typeof each.placeholder == 'string' && each.placeholder.trim().length).map(each => { return { name: each.name.trim(), placeholder: each.placeholder.trim() } });
  const errors = data.errors && typeof data.errors == 'object' ? data.errors : {};
  const button = data.button && typeof data.button == 'string' && data.button.trim().length ? data.button.trim() : DEFAULT_BUTTON_TEXT;

  if (!inputs.length)
    return callback('bad_request');

  const popUpOuterWrapper = document.createElement('div');
  popUpOuterWrapper.classList.add('general-form-pop-up-outer-wrapper');

  const popUp = document.createElement('form');
  popUp.classList.add('general-form-pop-up');

  const popUpCloseButton = document.createElement('span');
  popUpCloseButton.classList.add('general-form-pop-up-close-button');
  popUpCloseButton.innerHTML = 'CLOSE';
  popUp.appendChild(popUpCloseButton);

  const popUpTitle = document.createElement('span');
  popUpTitle.classList.add('general-form-pop-up-title');
  popUpTitle.innerHTML = title;
  popUp.appendChild(popUpTitle);

  if (description) {
    const popUpDescription = document.createElement('span');
    popUpDescription.classList.add('general-form-pop-up-description');
    popUpDescription.innerHTML = description;
    popUp.appendChild(popUpDescription);
  }

  const inputDOMs = [];

  inputs.forEach(input => {
    const eachInput = document.createElement('input');
    eachInput.classList.add('general-input');
    eachInput.name = input.name;
    eachInput.type = 'text';
    eachInput.placeholder = input.placeholder;
    popUp.appendChild(eachInput);
    inputDOMs.push(eachInput);
  });

  const popUpButton = document.createElement('button');
  popUpButton.classList.add('general-button');
  popUpButton.innerHTML = button;
  popUp.appendChild(popUpButton)

  const popUpError = document.createElement('span');
  popUpError.classList.add('general-error');
  popUp.appendChild(popUpError);

  popUpCloseButton.addEventListener('click', function clickPopUpCloseButton() {
    isPopUpActive = false;
    popUpCloseButton.removeEventListener('click', clickPopUpCloseButton);
    popUpOuterWrapper.remove();
    return callback(null, null);
  });

  popUpOuterWrapper.addEventListener('click', function clickPopUpOuterWrapper(event) {
    if (event.target != popUpOuterWrapper)
      return;

    isPopUpActive = false;
    popUpOuterWrapper.removeEventListener('click', clickPopUpOuterWrapper);
    popUpOuterWrapper.remove();
    return callback(null, null);
  });
  
  popUp.addEventListener('submit', function createFormPopUpEventListener(event) {
    event.preventDefault();

    popUpError.innerHTML = '';

    const req = {};

    inputDOMs.forEach(input => {
      if (!input.value || !input.value.length) {
        popUpError.innerHTML = errors.bad_request || DEFAULT_ERRORS.bad_request;
        return;
      }
      req[input.name] = input.value;
    });

    serverRequest(url, method, req, res => {
      console.log(res);
      if (!res.success && res.error && DEFAULT_ERRORS[res.error])
        return popUpError.innerHTML = errors[res.error] || DEFAULT_ERRORS[res.error];
      if (!res.success)
        return popUpError.innerHTML = DEFAULT_ERRORS.unknown_error;

      isPopUpActive = false;
      popUp.removeEventListener('submit', createFormPopUpEventListener);
      popUpOuterWrapper.remove();
      return callback(null, res);
    });
  });

  popUpOuterWrapper.appendChild(popUp);
  document.body.appendChild(popUpOuterWrapper);
}