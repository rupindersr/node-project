const aws = require('aws-sdk');
const fs = require('fs');
const config = require(__dirname + '/../config/config.json')['S3'];
const CNST = require('../config/constant');
const formidable = require('formidable');
module.exports = {
  upload: async (req, res, next) => {
    const form = new formidable.IncomingForm();
    form.parse(req, (err,fields,files) => {
      if(err){
        return res.status(400).json({ success: false, message: CNST.FILE_UPLOAD_ERROR})
      }
      const file = files.file;
      aws.config.update({
        accessKeyId: config.AccessKey,
        secretAccessKey: config.SecretKey,
        region: config.region
      });
    const s3 = new aws.S3();
    const name = file.name;
    const destination = `${Date.now()}${name}`;
    const params = {
      Bucket: config.Bucket,
      Body: fs.readFileSync(file.path),
      Key: destination,
      ACL: 'public-read'
    };
    try{
      s3.upload(params).promise().then(result => {
        return res.status(200).json({ success: true, message: CNST.FILE_UPLOAD_SUCCESS,data:{url: result.Location}})
      }).catch(err => {
        return res.status(400).json({ success: false, message: CNST.FILE_UPLOAD_ERROR})
      })
    }catch (e) {
      return res.status(400).json({ success: false, message: CNST.FILE_UPLOAD_ERROR})
    }
    });
  }
  };
