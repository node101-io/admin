const toURLString = require('../../../utils/toURLString');

module.exports = project => {
  if (!project || typeof project != 'object')
    return '';

  let search = new Set();

  if (project.name && typeof project.name == 'string') {
    const name = toURLString(project.name);
    name.split('-').forEach(each => search.add(each));
  }

  if (project.translations && typeof project.translations == 'object')
    Object.keys(project.translations).forEach(lang => {
      if (project.translations[lang].name && typeof project.translations[lang].name == 'string') {
        const name = toURLString(project.translations[lang].name);
        name.split('-').forEach(each => search.add(each));
      }
    });

  return Array.from(search);
}