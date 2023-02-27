const AWS = require('aws-sdk');

const s3 = new AWS.S3({	
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,	
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY	
});

module.exports = (data, callback) => {
  s3.copyObject({
    Bucket: process.env.AWS_BUCKET_NAME,
    CopySource: process.env.AWS_BUCKET_NAME + '/' + data.url.split('/')[data.url.split('/').length - 1],
    Key: data.original_name
   }, err => {
    if (err) return callback(err);
    
    return callback(null, data.url.split('/').filter((_, i) => i < data.url.split('/').length - 1).join('/') + '/' + data.original_name);
  });
}
