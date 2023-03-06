function createSelectionItem(id, name) {
  const choice = document.createElement('div');
  choice.classList.add('general-select-each-input-choice');
  choice.id = 'select-input-' + id;
  choice.innerHTML = name;
  return choice;
};

window.addEventListener('load', () => {
  const guide = JSON.parse(document.getElementById('guide-json').value);

  if (document.getElementById('guide-search-input')) {
    document.getElementById('guide-search-input').focus();
    document.getElementById('guide-search-input').select();

    document.getElementById('guide-search-input').addEventListener('keyup', event => {
      if (event.key == 'Enter' && event.target.value?.trim()?.length) {
        window.location = `/guide?search=${event.target.value.trim()}`;
      } else if (event.key == 'Enter') {
        window.location = '/guide';
      }
    });
  }

  document.addEventListener('click', event => {
    if (event.target.id == 'update-button') {
      const error = document.getElementById('update-error');
      error.innerHTML = '';

      const title = document.getElementById('title').value;
      const projectId = document.getElementById('project-id').value;
      const subtitle = document.getElementById('subtitle').value;
      const mainnetExplorerURL = document.getElementById('mainnet-explorer-url').value;
      const testnetExplorerURL = document.getElementById('testnet-explorer-url').value;
      const rewards = document.getElementById('rewards').value;
      const lockPeriod = document.getElementById('lock-period').value;
      const cpu = document.getElementById('cpu').value;
      const ram = document.getElementById('ram').value;
      const os = document.getElementById('os').value;
      const network = document.getElementById('network').value;
      const socialMediaAccounts = {};

      const socialAccountInputs = document.querySelectorAll('.social-account-input');

      for (let i = 0; i < socialAccountInputs.length; i++)
        if (socialAccountInputs[i].value && socialAccountInputs[i].value.trim().length)
          socialMediaAccounts[socialAccountInputs[i].id]= socialAccountInputs[i].value.trim();

      if (!title || !title.trim().length)
        return error.innerHTML = 'Please enter a title for the guide.';

      if (!projectId || !projectId.trim().length)
        return error.innerHTML = 'Please specify the Project the guide is related to.';

      if (!subtitle || !subtitle.trim().length)
        return error.innerHTML = 'Please enter a subtitle for the guide.';

      serverRequest('/guide/edit?id=' + guide._id, 'POST', {
        title,
        project_id: projectId,
        subtitle,
        mainnet_explorer_url: mainnetExplorerURL,
        testnet_explorer_url: testnetExplorerURL,
        rewards,
        lock_period: lockPeriod,
        cpu,
        ram,
        os,
        network,
        social_media_accounts: socialMediaAccounts
      }, res => {
        if (!res.success && res.error == 'duplicated_unique_field')
          return error.innerHTML = 'There is already a guide with this title.'
        if (!res.success)
          return throwError(res.error);

          return createConfirm({
            title: 'Guide is Updated',
            text: 'Guide is updated. Close to reload the page.',
            accept: 'Close'
          }, _ => window.location.reload());
      });
    }

    if (event.target.id == 'update-turkish-button') {
      const error = document.getElementById('update-turkish-error');
      error.innerHTML = '';

      if (!guide.is_completed)
        return error.innerHTML = 'Please complete the guide before adding a translation.';

      const title = document.getElementById('turkish-title').value;
      const subtitle = document.getElementById('turkish-subtitle').value;
      const mainnetExplorerURL = document.getElementById('turkish-mainnet-explorer-url').value;
      const testnetExplorerURL = document.getElementById('turkish-testnet-explorer-url').value;
      const rewards = document.getElementById('turkish-rewards').value;
      const lockPeriod = document.getElementById('turkish-lock-period').value;
      const cpu = document.getElementById('turkish-cpu').value;
      const ram = document.getElementById('turkish-ram').value;
      const os = document.getElementById('turkish-os').value;
      const network = document.getElementById('turkish-network').value;
      const socialMediaAccounts = {};

      const socialAccountInputs = document.querySelectorAll('.turkish-social-account-input');

      for (let i = 0; i < socialAccountInputs.length; i++)
        if (socialAccountInputs[i].value && socialAccountInputs[i].value.trim().length)
          socialMediaAccounts[socialAccountInputs[i].id.replace('turkish-', '')]= socialAccountInputs[i].value.trim();

      if (!title || !title.trim().length)
        return error.innerHTML = 'Please enter a title for the guide.';

      if (!subtitle || !subtitle.trim().length)
        return error.innerHTML = 'Please enter a subtitle for the guide.';

      serverRequest('/guide/translate?id=' + guide._id, 'POST', {
        language: 'tr',
        title,
        subtitle,
        mainnet_explorer_url: mainnetExplorerURL,
        testnet_explorer_url: testnetExplorerURL,
        rewards,
        lock_period: lockPeriod,
        cpu,
        ram,
        os,
        network,
        social_media_accounts: socialMediaAccounts
      }, res => {
        if (!res.success && res.error == 'duplicated_unique_field')
          return error.innerHTML = 'There is already a guide with this title.'
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

      if (!guide.is_completed)
        return error.innerHTML = 'Please complete the guide before adding a translation.';

      const title = document.getElementById('russian-title').value;
      const subtitle = document.getElementById('russian-subtitle').value;
      const mainnetExplorerURL = document.getElementById('russian-mainnet-explorer-url').value;
      const testnetExplorerURL = document.getElementById('russian-testnet-explorer-url').value;
      const rewards = document.getElementById('russian-rewards').value;
      const lockPeriod = document.getElementById('russian-lock-period').value;
      const cpu = document.getElementById('russian-cpu').value;
      const ram = document.getElementById('russian-ram').value;
      const os = document.getElementById('russian-os').value;
      const network = document.getElementById('russian-network').value;
      const socialMediaAccounts = {};

      const socialAccountInputs = document.querySelectorAll('.russian-social-account-input');

      for (let i = 0; i < socialAccountInputs.length; i++)
        if (socialAccountInputs[i].value && socialAccountInputs[i].value.trim().length)
          socialMediaAccounts[socialAccountInputs[i].id.replace('russian-', '')]= socialAccountInputs[i].value.trim();

      if (!title || !title.trim().length)
        return error.innerHTML = 'Please enter a title for the guide.';

      if (!subtitle || !subtitle.trim().length)
        return error.innerHTML = 'Please enter a subtitle for the guide.';

      serverRequest('/guide/translate?id=' + guide._id, 'POST', {
        language: 'ru',
        title,
        subtitle,
        mainnet_explorer_url: mainnetExplorerURL,
        testnet_explorer_url: testnetExplorerURL,
        rewards,
        lock_period: lockPeriod,
        cpu,
        ram,
        os,
        network,
        social_media_accounts: socialMediaAccounts
      }, res => {
        if (!res.success && res.error == 'duplicated_unique_field')
          return error.innerHTML = 'There is already a guide with this title.'
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

      serverRequest('/guide/image?id=' + guide._id, 'FILE', {
        file
      }, res => {
        if (!res.success) return throwError(res.error);
    
        return createConfirm({
          title: 'Guide Image is Updated',
          text: 'Guide image is updated. Close to reload the page.',
          accept: 'Close'
        }, _ => window.location.reload());
      });
    }
  });

  document.addEventListener('input', event => {
    if (event.target.id == 'project-search') {
      if (!event.target.value?.trim().length)
        return;

      serverRequest('/project/filter?name=' + event.target.value?.trim(), 'GET', {}, res => {
        if (!res.success)
          return throwError(res.error);

        document.getElementById('project-choices').innerHTML = '';
        document.getElementById('project-id').value = '';
        res.projects.forEach(project => {
          document.getElementById('project-choices').appendChild(createSelectionItem(project._id, project.name))
          if (event.target.value?.trim().toLocaleLowerCase() == project.name.toLocaleLowerCase())
            document.getElementById('project-id').value = project._id.toString();
        });
      });
    }
  });
});