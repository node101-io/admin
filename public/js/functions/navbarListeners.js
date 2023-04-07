window.addEventListener('load', () => {
  document.addEventListener('click', event => {
    if (event.target.classList.contains('each-navbar-group-link') && event.target.href.includes('/blog/create')) {
      event.preventDefault();

      createFormPopUp({
        title: 'Create a New Blog',
        url: '/blog/create',
        method: 'POST',
        description: 'You will be asked to complete blog details once you create it.',
        inputs: [
          {
            name: 'title',
            placeholder: 'Title (must be unique)'
          }
        ],
        button: 'Create New Blog',
        errors: {
          duplicated_unique_field: 'Each blog must have a unique title. Please use edit & translations page to change this blog\'s details.'
        }
      }, (error, res) => {
        if (error) return alert(error);
        if (!res) return;

        return window.location = '/blog/edit?id=' + res.id;
      });
    }

    if (event.target.classList.contains('each-navbar-group-link') && event.target.href.includes('/book/create')) {
      event.preventDefault();

      createFormPopUp({
        title: 'Create a New Book',
        url: '/book/create',
        method: 'POST',
        description: 'You will be asked to complete blog details once you create it.',
        inputs: [
          {
            name: 'name',
            placeholder: 'Name (must be unique)'
          }
        ],
        button: 'Create New Book',
        errors: {
          duplicated_unique_field: 'Each book must have a unique name. Please use edit & translations page to change this book\'s details.'
        }
      }, (error, res) => {
        if (error) return alert(error);
        if (!res) return;

        return window.location = '/book/edit?id=' + res.id;
      });
    }

    if (event.target.classList.contains('each-navbar-group-link') && event.target.href.includes('/project/create')) {
      event.preventDefault();

      createFormPopUp({
        title: 'Create a New Project',
        url: '/project/create',
        method: 'POST',
        description: 'You will be asked to complete project details once you create it.',
        inputs: [
          {
            name: 'name',
            placeholder: 'Name (must be unique)'
          }
        ],
        button: 'Create New Project',
        errors: {
          duplicated_unique_field: 'Each project must have a unique name. Please use edit & translations page to change this project\'s details.'
        }
      }, (error, res) => {
        if (error) return alert(error);
        if (!res) return;

        return window.location = '/project/edit?id=' + res.id;
      });
    }

    if (event.target.classList.contains('each-navbar-group-link') && event.target.href.includes('/guide/create')) {
      event.preventDefault();

      createFormPopUp({
        title: 'Create a New Testnet Guide',
        url: '/guide/create',
        method: 'POST',
        description: 'You will be asked to complete blog details once you create it.',
        inputs: [
          {
            name: 'title',
            placeholder: 'Title (must be unique)'
          }
        ],
        button: 'Create New Guide',
        errors: {
          duplicated_unique_field: 'Each guide must have a unique title. Please use edit & translations page to change this guide\'s details.'
        }
      }, (error, res) => {
        if (error) return alert(error);
        if (!res) return;

        return window.location = '/guide/edit?id=' + res.id;
      });
    }

    if (event.target.classList.contains('each-navbar-group-link') && event.target.href.includes('/member/create')) {
      event.preventDefault();

      createFormPopUp({
        title: 'Create a New Member',
        url: '/member/create',
        method: 'POST',
        description: 'You will be asked to complete member details once you create it.',
        inputs: [
          {
            name: 'name',
            placeholder: 'Name'
          }
        ],
        button: 'Create New Member'
      }, (error, res) => {
        if (error) return alert(error);
        if (!res) return;

        return window.location = '/member/edit?id=' + res.id;
      });
    }

    if (event.target.classList.contains('each-navbar-group-link') && event.target.href.includes('/writer/create')) {
      event.preventDefault();

      createFormPopUp({
        title: 'Create a New Writer',
        url: '/writer/create',
        method: 'POST',
        description: 'You will be asked to complete writer details once you create it.',
        inputs: [
          {
            name: 'name',
            placeholder: 'Name'
          }
        ],
        button: 'Create New Writer',
        errors: {
          duplicated_unique_field: 'Each writer must have a unique name. Please use edit & translations page to change this writer\'s details.'
        }
      }, (error, res) => {
        if (error) return alert(error);
        if (!res) return;

        return window.location = '/writer/edit?id=' + res.id;
      });
    }
  });
});