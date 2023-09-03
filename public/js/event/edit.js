window.addEventListener('load', () => {
  const original_event = JSON.parse(document.getElementById('event-json').value);
  if (document.getElementById('event-search-input')) {
    document.getElementById('event-search-input').focus();
    document.getElementById('event-search-input').select();

    document.getElementById('event-search-input').addEventListener('keyup', event => {
      if (event.key == 'Enter' && event.target.value?.trim()?.length) {
        window.location = `/event?search=${event.target.value.trim()}`;
      } else if (event.key == 'Enter') {
        window.location = '/event';
      }
    });
  }

  document.addEventListener('click', event => {
    if (event.target.id == 'update-button') {
      const error = document.getElementById('update-error');
      error.innerHTML = '';

      const name = document.getElementById('name').value;
      const description = document.getElementById('description').value;
      const category = document.getElementById('category').value;
      const eventType = document.getElementById('event-type').value;
      const startDate = document.getElementById('start-date').valueAsDate;
      const endDate = document.getElementById('end-date').valueAsDate;
      const label = document.getElementById('label').value;
      const location = document.getElementById('location').value;
      const registerURL = document.getElementById('register-url').value;
      const socialMediaAccounts = {};

      const socialAccountInputs = document.querySelectorAll('.social-account-input');

      for (let i = 0; i < socialAccountInputs.length; i++)
        if (socialAccountInputs[i].value && socialAccountInputs[i].value.trim().length)
          socialMediaAccounts[socialAccountInputs[i].id]= socialAccountInputs[i].value.trim();
      
      if (!name || !name.trim().length)
        return error.innerHTML = 'Please enter a name for the event.';

      if (!description || !description.trim().length)
        return error.innerHTML = 'Please enter a description for the event.';

      if (!category)
        return error.innerHTML = 'Please select a category for the event.';

      if (!eventType)
        return error.innerHTML = 'Please select an event type.';

      if (!startDate)
        return error.innerHTML = 'Please enter a valid start date for the event.';

      if (!label)
        return error.innerHTML = 'Please enter an event label.';

      serverRequest('/event/edit?id=' + original_event._id, 'POST', {
        name,
        description,
        category,
        event_type: eventType,
        start_date: startDate,
        end_date: endDate,
        label: label,
        location,
        register_url: registerURL,
        social_media_accounts: socialMediaAccounts
      }, res => {
        if (!res.success && res.error == 'duplicated_unique_field')
          return error.innerHTML = 'There is already an event with this information.'
        if (!res.success)
          return throwError(res.error);

          return createConfirm({
            title: 'Event is Updated',
            text: 'Event is updated. Close to reload the page.',
            accept: 'Close'
          }, _ => window.location.reload());
      });
    }

    if (event.target.id == 'update-turkish-button') {
      const error = document.getElementById('update-turkish-error');
      error.innerHTML = '';

      if (!original_event.is_completed)
        return error.innerHTML = 'Please complete the event before adding a translation.';

      const name = document.getElementById('turkish-name').value;
      const description = document.getElementById('turkish-description').value;
      const location = document.getElementById('turkish-location').value;
      const socialMediaAccounts = {};

      const socialAccountInputs = document.querySelectorAll('.turkish-social-account-input');

      for (let i = 0; i < socialAccountInputs.length; i++)
        if (socialAccountInputs[i].value && socialAccountInputs[i].value.trim().length)
          socialMediaAccounts[socialAccountInputs[i].id.replace('turkish-', '')]= socialAccountInputs[i].value.trim();

      if (!name || !name.trim().length)
        return error.innerHTML = 'Please enter a name for the event.';

      if (!description || !description.trim().length)
        return error.innerHTML = 'Please enter a description for the event.';

      serverRequest('/event/translate?id=' + original_event._id, 'POST', {
        language: 'tr',
        name,
        description,
        location,
        social_media_accounts: socialMediaAccounts
      }, res => {
        if (!res.success && res.error == 'duplicated_unique_field')
          return error.innerHTML = 'There is already an event with this information.'
        if (!res.success)
          return throwError(res.error);

          return createConfirm({
            title: 'Translation is Updated',
            text: 'Turkish translation is updated. Close to reload the page.',
            accept: 'Close'
          }, _ => window.location.reload());
      });
    }

    if (event.target.id == 'update-russian-button') {
      const error = document.getElementById('update-russian-error');
      error.innerHTML = '';

      if (!original_event.is_completed)
        return error.innerHTML = 'Please complete the event before adding a translation.';

      const name = document.getElementById('russian-name').value;
      const description = document.getElementById('russian-description').value;
      const location = document.getElementById('russian-location').value;
      const socialMediaAccounts = {};

      const socialAccountInputs = document.querySelectorAll('.russian-social-account-input');

      for (let i = 0; i < socialAccountInputs.length; i++)
        if (socialAccountInputs[i].value && socialAccountInputs[i].value.trim().length)
          socialMediaAccounts[socialAccountInputs[i].id.replace('russian-', '')]= socialAccountInputs[i].value.trim();

      if (!name || !name.trim().length)
        return error.innerHTML = 'Please enter a name for the event.';

      if (!description || !description.trim().length)
        return error.innerHTML = 'Please enter a description for the event.';

      serverRequest('/event/translate?id=' + original_event._id, 'POST', {
        language: 'ru',
        name,
        description,
        location,
        social_media_accounts: socialMediaAccounts
      }, res => {
        if (!res.success && res.error == 'duplicated_unique_field')
          return error.innerHTML = 'There is already an event with this information.'
        if (!res.success)
          return throwError(res.error);

          return createConfirm({
            title: 'Translation is Updated',
            text: 'Russian translation is updated. Close to reload the page.',
            accept: 'Close'
          }, _ => window.location.reload());
      });
    }
  });

  document.addEventListener('change', event => {
    if (event.target.id == 'image') {
      const file = event.target.files[0];
      const wrapper = event.target.parentNode;
  
      wrapper.style.cursor = 'progress';
      wrapper.childNodes[1].innerHTML = 'Loading...';
      wrapper.childNodes[0].type = 'text';

      serverRequest('/event/logo?id=' + original_event._id, 'FILE', {
        file
      }, res => {
        if (!res.success) return throwError(res.error);
    
        return createConfirm({
          title: 'Event Logo is Updated',
          text: 'Event Logo is updated. Close to reload the page.',
          accept: 'Close'
        }, _ => window.location.reload());
      });
    }
  });
});