window.addEventListener('load', () => {
  const venue = JSON.parse(document.getElementById('venue-json').value);

  if (document.getElementById('venue-search-input')) {
    document.getElementById('venue-search-input').focus();
    document.getElementById('venue-search-input').select();

    document.getElementById('venue-search-input').addEventListener('keyup', event => {
      if (event.key == 'Enter' && event.target.value?.trim()?.length) {
        window.location = `/venue?search=${event.target.value.trim()}`;
      } else if (event.key == 'Enter') {
        window.location = '/venue';
      }
    });
  }

  document.addEventListener('click', event => {
    if (event.target.id == 'update-button') {
      const error = document.getElementById('update-error');
      error.innerHTML = '';

      const name = document.getElementById('name').value;
      const description = document.getElementById('description').value;
      const district = document.getElementById('district').value;
      const address = document.getElementById('address').value;
      const seatedCapacity = document.getElementById('seated-capacity').value;
      const standingCapacity = document.getElementById('standing-capacity').value;
      const contactNumber = document.getElementById('contact-number').value;
      const contactEmail = document.getElementById('contact-email').value;
      const socialMediaAccounts = {};

      const socialAccountInputs = document.querySelectorAll('.social-account-input');

      for (let i = 0; i < socialAccountInputs.length; i++)
        if (socialAccountInputs[i].value && socialAccountInputs[i].value.trim().length)
          socialMediaAccounts[socialAccountInputs[i].id]= socialAccountInputs[i].value.trim();
      
      if (!name || !name.trim().length)
        return error.innerHTML = 'Please enter a name for the venue.';

      if (!description || !description.trim().length)
        return error.innerHTML = 'Please enter a description for the venue.';

      if (!district)
        return error.innerHTML = 'Please select a district for the venue.';

      if (!address || !address.trim().length)
        return error.innerHTML = 'Please enter an address for the venue.';
      
      serverRequest('/venue/edit?id=' + venue._id, 'POST', {
        name,
        description,
        district,
        address,
        seated_capacity: parseInt(seatedCapacity),
        standing_capacity: parseInt(standingCapacity),
        contact_number: contactNumber,
        contact_email: contactEmail,
        social_media_accounts: socialMediaAccounts
      }, res => {
        if (!res.success && res.error == 'duplicated_unique_field')
          return error.innerHTML = 'There is already a venue with this name.'
        if (!res.success)
          return throwError(res.error);

          return createConfirm({
            title: 'Venue is Updated',
            text: 'Venue is updated. Close to reload the page.',
            accept: 'Close'
          }, _ => window.location.reload());
      });
    }

    if (event.target.id == 'update-turkish-button') {
      const error = document.getElementById('update-turkish-error');
      error.innerHTML = '';

      if (!venue.is_completed)
        return error.innerHTML = 'Please complete the venue before adding a translation.';

      const name = document.getElementById('turkish-name').value;
      const description = document.getElementById('turkish-description').value;
      const address = document.getElementById('turkish-address').value;
      const socialMediaAccounts = {};

      const socialAccountInputs = document.querySelectorAll('.turkish-social-account-input');

      for (let i = 0; i < socialAccountInputs.length; i++)
        if (socialAccountInputs[i].value && socialAccountInputs[i].value.trim().length)
          socialMediaAccounts[socialAccountInputs[i].id.replace('turkish-', '')]= socialAccountInputs[i].value.trim();

      if (!name || !name.trim().length)
        return error.innerHTML = 'Please enter a name for the venue.';

      if (!description || !description.trim().length)
        return error.innerHTML = 'Please enter a description for the venue.';

      serverRequest('/venue/translate?id=' + venue._id, 'POST', {
        language: 'tr',
        name,
        description,
        address,
        social_media_accounts: socialMediaAccounts
      }, res => {
        if (!res.success && res.error == 'duplicated_unique_field')
          return error.innerHTML = 'There is already a venue with this name.'
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

      if (!venue.is_completed)
        return error.innerHTML = 'Please complete the venue before adding a translation.';

      const name = document.getElementById('russian-name').value;
      const description = document.getElementById('russian-description').value;
      const address = document.getElementById('russian-address').value;
      const socialMediaAccounts = {};

      const socialAccountInputs = document.querySelectorAll('.russian-social-account-input');

      for (let i = 0; i < socialAccountInputs.length; i++)
        if (socialAccountInputs[i].value && socialAccountInputs[i].value.trim().length)
          socialMediaAccounts[socialAccountInputs[i].id.replace('russian-', '')]= socialAccountInputs[i].value.trim();

      if (!name || !name.trim().length)
        return error.innerHTML = 'Please enter a name for the venue.';

      if (!description || !description.trim().length)
        return error.innerHTML = 'Please enter a description for the venue.';

      serverRequest('/venue/translate?id=' + venue._id, 'POST', {
        language: 'ru',
        name,
        description,
        address,
        social_media_accounts: socialMediaAccounts
      }, res => {
        if (!res.success && res.error == 'duplicated_unique_field')
          return error.innerHTML = 'There is already a venue with this name.'
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

      serverRequest('/venue/image?id=' + venue._id, 'FILE', {
        file
      }, res => {
        if (!res.success) return throwError(res.error);
    
        return createConfirm({
          title: 'Venue Image is Updated',
          text: 'Venue image is updated. Close to reload the page.',
          accept: 'Close'
        }, _ => window.location.reload());
      });
    }
  });
});