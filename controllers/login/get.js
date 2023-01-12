module.exports = (req, res) => {
  return res.render('login/index', {
    page: 'login/index',
    title: res.__('Log In'),
    includes: {
      external: {
        css: ['form', 'general', 'page', 'text'],
        js: ['page', 'serverRequest']
      }
    }
  });
}
