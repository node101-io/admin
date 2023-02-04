module.exports = (req, res) => {
  const admin = req.session.admin;

  return res.render('index/writing', {
    page: 'index/writing',
    title: 'Writing',
    includes: {
      external: {
        css: ['confirm', 'form', 'formPopUp', 'general', 'header', 'items', 'navbar', 'navigation', 'text', 'writing'],
        js: ['createConfirm', 'createFormPopUp', 'page', 'serverRequest']
      }
    },
    admin
  });
}
