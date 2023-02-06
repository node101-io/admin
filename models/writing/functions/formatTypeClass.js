module.exports = type => {
  if (!type || typeof type != 'string')
    throw Error('Unknown Error: Unexpected type string.');

  return type.substring(0, 1).toUpperCase() + type.substring(1);
};