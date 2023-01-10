module.exports = (req, res) => {
  return res.render('index/index', {
    page: 'index/index',
    title: res.__('Admin Dashboard'),
    includes: {
      external: {
        css: ['form', 'general', 'page', 'text'],
        js: ['page']
      }
    },
    user: req.session.user
  });
}
