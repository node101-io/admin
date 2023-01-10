module.exports = str => {
  if (isNaN(str.toString()))
    return '';

  return str.toString().split(' ').map(each => encodeURIComponent(each.trim()).trim()).filter(each => each.length).join('-')
}
