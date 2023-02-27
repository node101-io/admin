module.exports = _date => {
  if (!_date || isNaN(new Date(_date)))
    return '';

  const date = new Date(_date);

  return `${
    date.getFullYear()
  }-${
    (date.getMonth() + 1) < 10 ?
    '0' + (date.getMonth() + 1) :
    (date.getMonth() + 1)
  }-${
    date.getDate() < 10 ?
    '0' + date.getDate() :
    date.getDate()
  }`
}