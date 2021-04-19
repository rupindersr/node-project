const router = require('express-promise-router')();
const { validateBody, schemas } = require('../helper/route_helpers');
const categoryController = require('../controller/category');

router.route('/add')
    .post(validateBody(schemas.addCategory), categoryController.add)

router.route('/list')
    .get(categoryController.list)

router.route('/delete/:product_category_id')
    .delete(categoryController.delete)

module.exports = router;