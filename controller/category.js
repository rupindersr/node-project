const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const db = require('../models');
const CNST = require('../config/constant');

module.exports = {
    add: async (req, res, next) => {
        let transaction;
        try {
            transaction = await db.sequelize.transaction();
            const { category_name } = req.value.body;
            //Check category already exist
            hasCategoryExist = await db.product_category.findOne({
                where: {
                 [Op.and]: { category_name, has_deleted: 'false' }
                }
            }, { transaction })
            if (hasCategoryExist) {
                return res.status(400).json({ message: CNST.CATEGORY_ALREADY_EXIST_MSG })
            }
            await db.product_category.create({ category_name }, { transaction })
            await transaction.commit();
            return res.status(200).json({ message: CNST.CATEGORY_ADDED_SUCCESS })
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
            const [count, rows] = await Promise.all([
                db.product_category.count({ where: { has_deleted: 'false' } }),
                db.product_category.findAll({
                    where: { has_deleted: 'false' },
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
            const { product_category_id } = req.params;
            if (!product_category_id) {
                return res.status(400).json({ message: CNST.PRODUCT_CATEGORY_ID_REQUIRED_ERROR })
            }
            await db.product_category.update({ hase_deleted: 'true' }, { where: { product_category_id } })
            return res.status(200).json({ message: CNST.CATEGORY_DELETED_SUCCESS })
        } catch (error) {
            return res.status(400).json({ message: error.message })
        }
    }
}