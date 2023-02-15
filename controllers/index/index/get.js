module.exports = (req, res) => {
  const admin = req.session.admin;

  return res.render('index/index', {
    page: 'index/index',
    title: res.__('Admin Dashboard'),
    includes: {
      external: {
        css: ['confirm', 'form', 'formPopUp', 'general', 'header', 'items', 'navbar', 'navigation', 'text'],
        js: ['createConfirm', 'createFormPopUp', 'navbarListeners', 'page', 'serverRequest']
      }
    },
    admin
  });
}
