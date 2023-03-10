const AWS = require('aws-sdk');
const fs = require('fs');
const sharp = require('sharp');

const s3 = new AWS.S3({	
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,	
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY	
});

module.exports = (data, callback) => {
  const file_content = fs.readFileSync('./public/res/uploads/' + data.file_name);

  const resizeParameters = {
    fit: 'cover',
    position: 'center'
  }

  if (data.width) resizeParameters.width = data.width;
  if (data.height) resizeParameters.height = data.height;

  sharp(file_content)
    .resize(resizeParameters)
    .webp()
    .toBuffer()
    .then(image => {
      const params = {	
        Bucket: process.env.AWS_BUCKET_NAME,	
        Key: data.original_name,
        Body: image,
        ContentType: 'image/webp',
        ACL: 'public-read'
      };
      
      s3.upload(params, (err, response) => {
        if (err) return callback(err);

        return callback(null, response.Location);
      });
    })
    .catch(err => callback('database_error'));
}
