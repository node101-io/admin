module.exports = color => {
  const defaultColor = {
    r: 255,
    g: 255,
    b: 255,
    alpha: 1
  };

  if (!color || typeof color != 'object')
    return defaultColor;

  if (color.red && !isNaN(parseInt(color.red)) && parseInt(color.red) >= 0 && parseInt(color.red) <= 255)
    defaultColor.r = parseInt(color.red);

  if (color.green && !isNaN(parseInt(color.green)) && parseInt(color.green) >= 0 && parseInt(color.green) <= 255)
    defaultColor.g = parseInt(color.green);

  if (color.blue && !isNaN(parseInt(color.blue)) && parseInt(color.blue) >= 0 && parseInt(color.blue) <= 255)
    defaultColor.b = parseInt(color.blue);

  if (color.alpha && !isNaN(parseFloat(color.alpha)) && parseFloat(color.alpha) >= 0 && parseFloat(color.alpha) <= 1)
    defaultColor.alpha = parseFloat(color.alpha);

  return defaultColor;
}
