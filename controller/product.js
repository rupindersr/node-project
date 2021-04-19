const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const db = require('../models');
const CNST = require('../config/constant');
module.exports = {
    add: async (req, res, next) => {
        let transaction;
        try {
            transaction = await db.sequelize.transaction();
            const { title, price, description, product_category_id, product_images } = req.value.body;
            //Check category exist in DB
            if (product_images.length == 0) {
                return res.status(400).json({ message: CNST.PRODUCT_IMAGE_REQUIRED_ERROR })
            }
            const hasCategoryExist = await db.product_category.findOne({
                where: { [Op.and]: { product_category_id, has_deleted: 'false' } }
            })
            if (hasCategoryExist) {
                const addProductRes = await db.products.create(req.value.body, { transaction });
                var product_images_arr = []
                for (let k = 0; k < product_images.length; k++) {
                    var product_image_obj = {
                        product_image: product_images[k],
                        product_id: addProductRes.product_id
                    }
                    product_images_arr.push(product_image_obj);
                }
                await db.products_images.bulkCreate(product_images_arr, { transaction });
                await transaction.commit();
                return res.status(200).json({ message: CNST.PRODUCT_ADDED_SUCCESS })
            }
            else {
                return res.status(400).json({ message: CNST.CATEGORY_NOT_EXIST_ERROR })
            }

        } catch (error) {
            if (transaction) {
                await transaction.rollback();
            }
            return res.status(400).json({ message: error.message })
        }
    },
    list: async (req, res, next) => {
        try {
            var page_number = parseInt(req.query.page_number) || CNST.DEFAULT_PAGE_NUMBER,
                page_size = parseInt(req.query.page_size) || CNST.DEFAULT_PAGE_SIZE,
                page_number = page_number <= 1 ? 0 : ((page_number * page_size) - page_size);
            const { product_category_id } = req.params;
            if (!product_category_id) {
                return res.status(400).json({ message: CNST.PRODUCT_CATEGORY_ID_REQUIRED_ERROR })
            }
            // const cou = await db.products.count({ where: { [Op.and]: { product_category_id, has_deleted: 'false' } } })
            const [count, rows] = await Promise.all([
                db.products.count({ where: { [Op.and]: { product_category_id, has_deleted: 'false' } } }),
                db.products.findAll({
                    subQuery: false,
                    where: { [Op.and]: { product_category_id, has_deleted: 'false' } },
                    attributes: {
                        include: ['products_images.product_image', 'product_category.category_name'],
                        exclude: ['has_deleted']
                    },
                    include: [
                        { model: db.products_images, attributes: [] },
                        { model: db.product_category, attributes: [] }
                    ],
                    distinct: true, raw: true,
                    order: [
                        ['product_id', 'DESC']
                    ],
                    offset: page_number, limit: page_size
                }, { rows: false })
            ])
            return res.status(200).json({ data: rows, total_records: count, message: CNST.SUCCESS })
        } catch (error) {
            return res.status(400).json({ message: error.message })
        }
    },
    delete: async (req, res, next) => {
        try {
            const { product_id } = req.params;
            if (!product_id) {
                return res.status(400).json({ message: CNST.PRODUCT_ID_REQUIRED_ERROR })
            }
            await db.products.update({ has_deleted: 'true' }, { where: { product_id } })
            return res.status(200).json({ message: CNST.PRODUCT_DELETED_SUCCESS })
        } catch (error) {
            return res.status(400).json({ message: error.message })
        }
    }
}