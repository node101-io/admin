module.exports = str => {
  if (typeof str != 'string') return '';

  return str
    .toString()
    .toLocaleLowerCase()
    .split('ç').join('c')
    .split('ı').join('i')
    .split('ğ').join('g')
    .split('ö').join('o')
    .split('ş').join('s')
    .split('ü').join('u')
    .split(' ').map(each => encodeURIComponent(each.trim()).toLowerCase().trim()).filter(each => each.length).join('-');
}
