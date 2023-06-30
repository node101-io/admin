const Admin = require('../Admin');

const isAdminComplete = require('./isAdminComplete');

module.exports = (admin, callback) => {
  if (!admin || !admin._id)
    return callback('document_not_found');

  const isCompleted = isAdminComplete(admin);

  if (isCompleted == admin.is_completed)
    return callback(null, {
      _id: admin._id.toString(),
      email: admin.email,
      is_completed: admin.is_completed,
      name: admin.name,
      roles: admin.roles,
      image: admin.image
    });

  Admin.findByIdAndUpdate(mongoose.Types.ObjectId(admin._id.toString()), {$set: {
    is_completed: isCompleted
  }}, { new: true }, (err, admin) => {
    if (err) return callback('database_error');

    return callback(null, admin);
  });
};
