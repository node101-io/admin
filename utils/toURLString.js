// Support only turkish charset. TO DO: Russian charset

module.exports = name => {
  if (isNaN(name.toString()))
    return '';

  return name.toString()
    .toLocaleLowerCase()
    .split('ç').join('c')
    .split('ı').join('i')
    .split('ğ').join('g')
    .split('ö').join('o')
    .split('ş').join('s')
    .split('ü').join('u')
    .split('').map(each => ((each.charCodeAt(0) >= ('a').charCodeAt(0) && each.charCodeAt(0) <= ('z').charCodeAt(0)) || (each.charCodeAt(0) >= ('0').charCodeAt(0) && each.charCodeAt(0) <= ('9').charCodeAt(0)) ? each : ' ')).join('')
    .split(' ').map(each => each.trim()).filter(each => each.length).join('-')
    .split('-').map(each => each.trim()).filter(each => each.length).join('-');
}
