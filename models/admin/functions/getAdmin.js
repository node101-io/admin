module.exports = (admin, callback) => {
  if (!admin || !admin._id)
    return callback('document_not_found');

  return callback(null, {
    _id: admin._id.toString(),
    email: admin.email,
    is_completed: admin.is_completed,
    name: admin.name,
    roles: admin.roles,
    image: admin.image
  });
};
