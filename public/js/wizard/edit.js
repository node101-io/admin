window.addEventListener('load', () => {
  const isSynced = document.getElementById('is-synced').checked;
  const isNew = document.getElementById('is-new').checked;

  if (isSynced) {
    createConfirm({
      title: 'Synced with GitHub',
      text: isNew ? 'New version detected. You can publish the new version.' : 'No new version detected on GitHub.',
      accept: 'Close'
    }, _ => null);
  } else {
    throwError('github_sync_error');
  }

  document.addEventListener('focusout', () => {
    const wrapper = document.querySelector('.general-create-wrapper');
    const platformNodes = document.querySelectorAll('.each-platform-input-wrapper');
    let platformCount = 1;

    for (let i = 0; i < platformNodes.length; i++) {
      const platform = platformNodes[i];
      const name = platform.querySelector('#platform-name').value?.trim();
      const signature = platform.querySelector('#platform-signature').value?.trim();
      const url = platform.querySelector('#platform-url').value?.trim();
      
      if (!name.length && !signature.length && !url.length)
        platform.remove()
      else
        platformCount++;
    }

    const duplicate = document.getElementById('duplicate').cloneNode(true);
    duplicate.id = null;
    duplicate.classList.remove('display-none');
    duplicate.classList.add('each-platform-input-wrapper');

    duplicate.querySelector('#platform-name').previousElementSibling.innerHTML = duplicate.querySelector('#platform-name').previousElementSibling.innerHTML.split(' - ')[0] + ' - ' + platformCount;
    duplicate.querySelector('#platform-signature').previousElementSibling.innerHTML = duplicate.querySelector('#platform-signature').previousElementSibling.innerHTML.split(' - ')[0] + ' - ' + platformCount;
    duplicate.querySelector('#platform-url').previousElementSibling.innerHTML = duplicate.querySelector('#platform-url').previousElementSibling.innerHTML.split(' - ')[0] + ' - ' + platformCount;

    wrapper.appendChild(duplicate);
    wrapper.insertBefore(duplicate, duplicate.previousElementSibling);
  });

  document.addEventListener('click', event => {
    if (event.target.id == 'publish-button') {
      const error = document.getElementById('publish-error');
      error.innerHTML = '';

      const version = document.getElementById('version').value?.trim();
      const notes = document.getElementById('notes').value?.trim();

      if (!version || !version.length)
        return error.innerHTML = 'Please write the number of the new version.';

      const platformNodes = document.querySelectorAll('.each-platform-input-wrapper');
      const platforms = {};
      
      for (let i = 0; i < platformNodes.length; i++) {
        const platform = platformNodes[i];
        const name = platform.querySelector('#platform-name').value?.trim();
        const signature = platform.querySelector('#platform-signature').value?.trim();
        const url = platform.querySelector('#platform-url').value?.trim();
        
        if (name.length && signature.length && url.length)
          platforms[name] = {
            signature,
            url
          };
      }

      if (!Object.keys(platforms).length)
        return error.innerHTML = 'You must have at least one complete platform for your new version.';

      serverRequest('/wizard/edit', 'POST', {
        version,
        notes: notes || '',
        platforms
      }, res => {
        if (!res.success) return throwError(res.error);

        return createConfirm({
          title: 'New Version is Released',
          text: 'New version information is now reachable from the API gate. Close to reload the page.',
          accept: 'Close'
        }, _ => window.location.reload());
      });
    }
  })
});