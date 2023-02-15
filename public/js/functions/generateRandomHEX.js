const CHARSET = [
  '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'
];
const DEFAULT_LENGTH = 32;

module.exports = length => {
  if (!length || isNaN(parseInt(length)))
    length = DEFAULT_LENGTH;
  else
    length = parseInt(length);

  let str = '';

  for (let i = 0; i < length; i++)
    str += CHARSET[parseInt(Math.random() * CHARSET.length)];

  return str;
}
