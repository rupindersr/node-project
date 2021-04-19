const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const db = require('../models');
const CNST = require('../config/constant');
module.exports = {
    addToCart: async (req, res, next) => {
        let transaction;
        try {
            transaction = await db.sequelize.transaction();
            const { product_id, quantity } = req.value.body;
            //Add user_id in body
            req.value.body.user_id = req.user.id;
            //Check product with product_id exist in DB
            const hasProductExist = await db.products.findOne({
                where: {
                    [Op.and]: { product_id, has_deleted: 'false' }
                }
            })
            if (hasProductExist) {
                await db.cart.create(req.value.body, { transaction });
                await transaction.commit();
                return res.status(200).json({ message: CNST.PRODUCT_ADDED_IN_CART_SUCCESS })
            }
            else {
                return res.status(400).json({ message: CNST.INAVLID_PRODUCT_ID_ERROR })
            }
        } catch (error) {
            if (transaction) {
                await transaction.rollback();
            }
            return res.status(400).json({ message: error.message })
        }
    },
    updateProductIntoCart: async (req, res, next) => {
        let transaction;
        try {
            transaction = await db.sequelize.transaction();
            const { quantity } = req.value.body;
            const { product_id } = req.params;
            if (!product_id) {
                return res.status(400).json({ message: CNST.PRODUCT_ID_REQUIRED_ERROR })
            }
            //Check product with product_id exist in DB
            const hasProductExistInProductTable = await db.products.findOne({
                where: {
                    [Op.and]: { product_id, has_deleted: 'false' }
                }
            })
            //Check product id in cart table
            const hasProductExistInCart = await db.cart.findOne({ where: { product_id } })

            if (hasProductExistInProductTable && hasProductExistInCart) {
                await db.cart.update({ quantity }, { where: { product_id } }, { transaction });
                await transaction.commit();
                return res.status(200).json({ message: CNST.PRODUCT_UPDATED_IN_CART_SUCCESS })
            }
            else {
                return res.status(400).json({ message: CNST.INAVLID_PRODUCT_ID_ERROR })
            }
        } catch (error) {
            if (transaction) {
                await transaction.rollback();
            }
            return res.status(400).json({ message: error.message })
        }
    },
    fetchCartData: async (req, res, next) => {
        try {
            const user_id = req.user.id;
            const cart = await db.cart.findAll({
                subQuery: false,
                where: { user_id },
                attributes: {
                    include: ['product_id', 'product.title', 'product.products_images.product_image', 'product.description', 'product.price', 'product.product_category_id', 'product.product_category.category_name']
                },
                include: [
                    {
                        model: db.products,
                        attributes: [],
                        include: [{ model: db.products_images, attributes: [] }, { model: db.product_category, attributes: [] }]
                    }
                ],
                distinct: true,
                raw: true,
                order: [
                    ['cart_id', 'DESC']
                ],
            })
            return res.status(200).json({ data: cart, message: CNST.SUCCESS })
        } catch (error) {
            return res.status(400).json({ message: error.message })
        }
    },
    removeProductFromCart: async (req, res, next) => {
        let transaction;
        try {
            transaction = await db.sequelize.transaction();
            const { product_id } = req.params;
            if (!product_id) {
                return res.status(400).json({ message: CNST.PRODUCT_ID_REQUIRED_ERROR })
            }
            //Check product id in cart table
            const hasProductExistInCart = await db.cart.findOne({ where: { product_id } })
            if (hasProductExistInCart) {
                await db.cart.destroy({ where: { product_id } }, { transaction });
                await transaction.commit();
                return res.status(200).json({ message: CNST.PRODUCT_DELETED_FROM_CART_SUCCESS })
            }
            else {
                return res.status(400).json({ message: CNST.INAVLID_PRODUCT_ID_ERROR })
            }
        } catch (error) {
            if (transaction) {
                await transaction.rollback();
            }
            return res.status(400).json({ message: error.message })
        }
    },
}