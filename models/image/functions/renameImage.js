const AWS = require('aws-sdk');
const fs = require('fs');
const sharp = require('sharp');

const s3 = new AWS.S3({	
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,	
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY	
});

module.exports = (data, callback) => {
  s3.copyObject({
    Bucket: process.env.AWS_BUCKET_NAME,
    CopySource: data.url,	
    Key: data.original_name
  }, (err, response) => {
    if (err) return callback(err);
    
    s3.deleteObject({
      Bucket: process.env.AWS_BUCKET_NAME,	
      Key: data.url.split('/')[url.split('/').length-1]
    }, err => {
      if (err) return callback(err);

      return callback(null, response.Location);
    });
  });
}
