function setCSSNotYetStakabableVariable(notYetStakable) {
  const root = document.querySelector(':root');

  if (notYetStakable)
    root.style.setProperty('--not-yet-stakable', 'none');
  else
    root.style.setProperty('--not-yet-stakable', 'unset');
};

window.addEventListener('load', () => {
  let notYetStakable = JSON.parse(document.getElementById('not-yet-stakable').value);
  let isActive = JSON.parse(document.getElementById('is-active').value);
  let isActiveUpdating = false;
  const stake = JSON.parse(document.getElementById('stake-json').value);

  setCSSNotYetStakabableVariable(notYetStakable);

  setInterval(() => {
    if (notYetStakable != JSON.parse(document.getElementById('not-yet-stakable').value)) {
      notYetStakable = JSON.parse(document.getElementById('not-yet-stakable').value);
      setCSSNotYetStakabableVariable(notYetStakable);
    }
  }, 100);

  setInterval(() => {
    if (isActive != JSON.parse(document.getElementById('is-active').value) && !isActiveUpdating) {
      isActiveUpdating = true;
      serverRequest('/stake/status', 'POST', {
        id: stake._id
      }, res => {
        isActiveUpdating = false;
        isActive = !isActive;
        if (!res.success) return throwError(res.error);

        return;
      });
    }
  }, 100);

  if (document.getElementById('project-search-input')) {
    document.getElementById('project-search-input').focus();
    document.getElementById('project-search-input').select();

    document.getElementById('project-search-input').addEventListener('keyup', event => {
      if (event.key == 'Enter' && event.target.value?.trim()?.length) {
        window.location = `/project?search=${event.target.value.trim()}`;
      } else if (event.key == 'Enter') {
        window.location = '/project';
      }
    });
  }

  document.addEventListener('click', event => {
    if (event.target.id == 'update-button') {
      const error = document.getElementById('update-error');
      error.innerHTML = '';
      
      const apr = document.getElementById('apr').value;
      const stakeURL = document.getElementById('stake-url').value;
      const howToStakeURL = document.getElementById('how-to-stake-url').value;

      if (notYetStakable) {
        serverRequest('/stake/edit?id=' + stake._id, 'POST', {
          not_yet_stakable: true,
          apr,
          stake_url: stakeURL,
          how_to_stake_url: howToStakeURL
        }, res => {
          if (!res.success) return throwError(res.error);

            return createConfirm({
              title: 'Project stake information is Updated',
              text: 'Stake information is updated. Close to reload the page.',
              accept: 'Close'
            }, _ => window.location.reload());
        });
      } else {
        if (!apr || !apr.trim().length)
          return error.innerHTML = 'Please enter the APR for the project.';

        if (!stakeURL || !stakeURL.trim().length)
          return error.innerHTML = 'Please enter the stake URL for the project.';

        if (!howToStakeURL || !howToStakeURL.trim().length)
          return error.innerHTML = 'Please enter the how to stake URL for the project.';

        serverRequest('/stake/edit?id=' + stake._id, 'POST', {
          not_yet_stakable: false,
          apr,
          stake_url: stakeURL,
          how_to_stake_url: howToStakeURL
        }, res => {
          if (!res.success) return throwError(res.error);

            return createConfirm({
              title: 'Project stake information is Updated',
              text: 'Stake information is updated. Close to reload the page.',
              accept: 'Close'
            }, _ => window.location.reload());
        });
      }
    }

    if (event.target.id == 'update-turkish-button') {
      const error = document.getElementById('update-turkish-error');
      error.innerHTML = '';

      const stakeURL = document.getElementById('turkish-stake-url').value;
      const howToStakeURL = document.getElementById('turkish-how-to-stake-url').value;
    
      if (!stake.is_completed)
        return error.innerHTML = 'Please complete the stakable information of the project before adding a translation.';

      if (!stakeURL || !stakeURL.trim().length)
        return error.innerHTML = 'Please enter the stake URL for the project.';

      if (!howToStakeURL || !howToStakeURL.trim().length)
        return error.innerHTML = 'Please enter the how to stake URL for the project.';

      serverRequest('/stake/translate?id=' + stake._id, 'POST', {
        language: 'tr',
        stake_url: stakeURL,
        how_to_stake_url: howToStakeURL
      }, res => {
        if (!res.success) return throwError(res.error);

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

      const stakeURL = document.getElementById('russian-stake-url').value;
      const howToStakeURL = document.getElementById('russian-how-to-stake-url').value;

      if (!stake.is_completed)
        return error.innerHTML = 'Please complete the stakable information of the project before adding a translation.';

      if (!stakeURL || !stakeURL.trim().length)
        return error.innerHTML = 'Please enter the stake URL for the project.';

      if (!howToStakeURL || !howToStakeURL.trim().length)
        return error.innerHTML = 'Please enter the how to stake URL for the project.';

      serverRequest('/stake/translate?id=' + stake._id, 'POST', {
        language: 'ru',
        stake_url: stakeURL,
        how_to_stake_url: howToStakeURL
      }, res => {
        if (!res.success) return throwError(res.error);

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

      serverRequest('/stake/image?id=' + stake._id, 'FILE', {
        file
      }, res => {
        if (!res.success) return throwError(res.error);
    
        return createConfirm({
          title: 'Project Stake Image is Updated',
          text: 'Project stake image is updated. Close to reload the page.',
          accept: 'Close'
        }, _ => window.location.reload());
      });
    }
  });
});