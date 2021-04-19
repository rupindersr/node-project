const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const db = require('../models');
const CNST = require('../config/constant');

module.exports = {
    getUserNotification: async (req, res, next) => {
        const user_id = req.query.user_id
        try {
            const quiz = await db.notifications.findAll({
                where: { has_deleted: "false", user_id },
                include: [
                    {
                        model: db.users, as: 'sender', attributes: [
                            'id', 'user_name', 'full_name', 'email', 'gender',
                            'date_of_birth', 'has_private', 'profile_picture',
                        ],
                    },
                ],
            }, { rows: false });
            return res.status(200).json({ success: true, message: CNST.NOTIFICATION_GET_SUCCESSFULLY, data: quiz })
        } catch (err) {
            return res.status(200).json({ success: true, message: err.message, data: [] })
        }
    },
    updateUserNotification: async (req, res, next) => {
        const user_id = req.query.notification_id
        try {
            const quiz = await db.notifications.update({ is_read: 'true' }, {
                where: { user_id }
            }, { rows: false });
            return res.status(200).json({ success: true, message: CNST.NOTIFICATION_UPDATED_SUCCESSFULLY })
        } catch (err) {
            return res.status(200).json({ success: true, message: err.message, data: [] })
        }
    },
    deleteUserNotification: async (req, res, next) => {
        const user_id = req.query.notification_id
        try {
            const quiz = await db.notifications.update({ has_deleted: 'true' }, {
                where: { user_id }
            }, { rows: false });
            return res.status(200).json({ success: true, message: CNST.NOTIFICATION_DELETED_SUCCESSFULLY })
        } catch (err) {
            return res.status(200).json({ success: true, message: err.message, data: [] })
        }
    },
    addUserNotification: async (req, res, next) => {
        try {
            await db.post_comments.create(req.body);
            return res.status(200).json({ success: true, message: CNST.NOTIFICATION_ADDED_SUCCESSFULLY})
        } catch (err) {
            return res.status(200).json({ success: true, message: err.message, data: [] })
        }
    },
    getNotificationTypes: async (req, res, next) => {
        try {
            const notification_types = await db.notification_types.findAll({ rows: false });
            return res.status(200).json({ success: true, message: CNST.NOTIFICATION_GET_TYPE_SUCCESSFULLY, data: notification_types })
        } catch (err) {
            return res.status(200).json({ success: true, message: err.message, data: [] })
        }
    }
};
