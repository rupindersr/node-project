const router = require('express-promise-router')();
const { validateBody, schemas } = require('../helper/route_helpers');
const orderController = require('../controller/order');

router.route('/add')
    .post(validateBody(schemas.placeOrder), orderController.placeOrder)

module.exports = router;