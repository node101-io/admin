const Blog = require('../../../models/blog/Blog');
const Project = require('../../../models/project/Project');

module.exports = (req, res) => {
  const types = {
    'node101': res.__('node101'),
    'project': res.__('Project'),
    'terms': res.__('Terms')
  };
  const socialAccounts = {
    'medium': 'Medium',
    'youtube': 'Youtube',
    'spotify': 'Spotify'
  };

  Blog.findBlogByIdAndFormat(req.query.id, (err, blog) => {
    if (err) return res.redirect('/error?message=' + err);

    return res.render('blog/edit', {
      page: 'blog/edit',
      title: blog.name,
      includes: {
        external: {
          css: ['confirm', 'create', 'form', 'formPopUp', 'general', 'header', 'items', 'navbar', 'navigation', 'text'],
          js: ['ancestorWithClassName', 'createConfirm', 'createFormPopUp', 'form', 'navbarListeners', 'page', 'serverRequest']
        }
      },
      blog,
      types,
      socialAccounts
    });
  });
};
