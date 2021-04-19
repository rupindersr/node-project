var router = require('express-promise-router')();
const productController = require('../controller/product');
const { validateBody, schemas } = require('../helper/route_helpers')
router.route('/add')
    .post(validateBody(schemas.addProduct), productController.add);

router.route('/list/:product_category_id')
    .get(productController.list);
router.route('/delete/:product_id')
    .delete(productController.delete);
module.exports = router;