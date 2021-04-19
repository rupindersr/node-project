const router = require('express-promise-router')();
const cartController = require('../controller/cart');
const { validateBody, schemas } = require('../helper/route_helpers');

router.route('/add')
    .post(validateBody(schemas.addToCart), cartController.addToCart)

router.route('/update/:product_id')
    .put(validateBody(schemas.updateCart), cartController.updateProductIntoCart)

router.route('/mycart')
    .get(cartController.fetchCartData)

router.route('/remove/:product_id')
    .delete(cartController.removeProductFromCart)

module.exports = router;