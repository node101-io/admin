module.exports = str => {
  if (typeof str != 'string') return '';

  return str.toString().split(' ').map(each => encodeURIComponent(each.trim()).toLowerCase().trim()).filter(each => each.length).join('-');
}
