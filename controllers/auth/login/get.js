module.exports = (req, res) => {
  return res.render('auth/login', {
    page: 'auth/login',
    title: res.__('Log In'),
    includes: {
      external: {
        css: ['form', 'general', 'page', 'text'],
        js: ['page', 'serverRequest']
      }
    }
  });
}
