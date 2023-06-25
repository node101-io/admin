const fs = require('fs');
const fetch = require('node-fetch');
const path = require('path');
const validator = require('validator');

const toURLString = require('./toURLString');

const MAX_TEXT_LENGTH = 1e4;
const OPERATION_VALUES = ['create', 'delete', 'delete_many', 'update'];

function formatNumberTo2Digits(number, addition) {
  if (isNaN(parseInt(number)))
    return '00';

  number = parseInt(number);

  if (addition)
    number++;

  if (number >= 10)
    return number.toString();
  if (number < 0)
    return '00';
  return `0${number}`;
};

function getToday() {
  return `${(new Date).getFullYear()}-${formatNumberTo2Digits((new Date).getMonth(), true)}-${formatNumberTo2Digits((new Date).getDate())}`;
};

async function updateLibrarySitemap(callback) {
  fetch('https://library.node101.io/sitemap')
    .then(res => res.json())
    .then(res => {
      if (!res.success)
        return callback(res.error || 'unknown_error');

      return callback(null);
    })
    .catch(_ => callback('library_sitemap_update_error'));
}

module.exports = (data, operation, callback) => {
  if (!data || typeof data != 'object') 
    return callback('bad_request');

  if (!operation || !OPERATION_VALUES.includes(operation))
    return callback('bad_request');

  if (!data._id || !validator.isMongoId(data._id.toString()))
    return callback('bad_request');

  if ((operation == 'create' || operation == 'update') && (!data.writing_id || !validator.isMongoId(data.writing_id.toString())))
    return callback('bad_request');

  if ((operation == 'create' || operation == 'update') && (!data.parent_title || !toURLString(data.parent_title).length || toURLString(data.parent_title).length > MAX_TEXT_LENGTH))
    return callback('bad_request');

  if ((operation == 'create' || operation == 'update') && (!data.title || !toURLString(data.title).length || toURLString(data.title).length > MAX_TEXT_LENGTH))
    return callback('bad_request');

  fs.readFile(path.join(__dirname, '../data/sitemap.json'), (err, file) => {
    if (err) return callback('fs_read_file_error');

    const fileData = JSON.parse(file);

    if (operation == 'delete') {
      const newFileData = fileData.filter(each => each.writing_filter_id != data._id.toString());

      fs.writeFile(path.join(__dirname, '../data/sitemap.json'), JSON.stringify(newFileData), err => {
        if (err) return callback('fs_write_file_error');

        updateLibrarySitemap(err => {
          if (err) return callback(err);

          return callback(null);
        });
      });
    } else if (operation == 'delete_many') {
      const newFileData = fileData.filter(each => each.writing_id != data._id.toString());

      fs.writeFile(path.join(__dirname, '../data/sitemap.json'), JSON.stringify(newFileData), err => {
        if (err) return callback('fs_write_file_error');

        updateLibrarySitemap(err => {
          if (err) return callback(err);

          return callback(null);
        });
      });
    } else if (operation == 'create' || operation == 'update') {
      const newFileData = fileData.filter(each => each.writing_filter_id != data._id.toString()); // Check in 'create' as well for precaution

      const newEntry = {
        writing_id: data.writing_id.toString(),
        writing_filter_id: data._id.toString(),
        loc: 'https://library.node101.io/blog/' + toURLString(data.parent_title) + '/' + toURLString(data.title),
        lastmod: getToday()
      };

      newFileData.push(newEntry);

      fs.writeFile(path.join(__dirname, '../data/sitemap.json'), JSON.stringify(newFileData), err => {
        if (err) return callback('fs_write_file_error');

        updateLibrarySitemap(err => {
          if (err) return callback(err);

          return callback(null);
        });
      });
    };
  });
};