module.exports = str => {
  if (typeof str != 'string' && isNaN(str.toString()))
    return '';

  return str.toString().split(' ').map(each => encodeURIComponent(each.trim()).toLowerCase().trim()).filter(each => each.length).join('-');
}
