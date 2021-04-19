'use strict';
module.exports = (sequelize, DataTypes) => {
    const notification_types = sequelize.define('notification_types', {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
        },
        type: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    },{ timestamps: false, underscored: true });

    notification_types.sync({ force: false, alter: true }).then(() => {
        notification_types.findOne({ where: { type: ['comment', 'like', 'follow'] } }).then(result => {
            if (!result) {
                const types = [{ id: 1, type: 'comment' }, { id: 2, type: 'like' }, { id: 3, type: 'follow' }];
                notification_types.bulkCreate(types);
            }
        });

    });
    return notification_types;
};