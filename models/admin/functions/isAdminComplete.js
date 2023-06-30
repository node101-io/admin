module.exports = admin => {
  return admin && admin._id &&
    admin.name && typeof admin.name == 'string' && admin.name.trim().length
      ? true : false;
}