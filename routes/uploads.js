const router = require('express-promise-router')();
const uploadController = require('../controller/uploads');

router.route('/').post(uploadController.upload);

module.exports = router;
