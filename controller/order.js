const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const db = require('../models');
const CNST = require('../config/constant');

module.exports = {
    placeOrder: async (req, res, next) => {
        let transaction;
        try {
            transaction = await db.sequelize.transaction();
            const { orders } = req.value.body;
            //Add user_id in request body
            for (let k = 0; k < orders.length; k++) {
                orders[k].user_id = req.user.id
            }
            // req.value.body.user_id = req.user.id;
            await db.orders.bulkCreate(orders, { transaction })
            await transaction.commit();
            return res.status(200).json({ message: CNST.SUCCESS })
            //Check product with product_id exist in DB
            // const hasProductExistInProductTable = await db.products.findOne({
            //     where: {
            //         [Op.and]: { product_id, has_deleted: 'false' }
            //     }
            // })
            // if (hasProductExistInProductTable) {
            // await db.orders.create(req.value.body, { transaction });
            // }
            // else {
            //     return res.status(400).json({ message: CNST.INAVLID_PRODUCT_ID_ERROR })
            // }
            // await db.orders.create(req.value.body)
        } catch (error) {
            if (transaction) {
                await transaction.rollback();
            }
            return res.status(400).json({ message: error.message })
        }
    }
}