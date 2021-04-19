'use strict';
module.exports = (sequelize, DataTypes) => {
    const notifications = sequelize.define('notifications', {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        sender_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        event_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        notification_type_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
        },
        is_read: {
            type: DataTypes.ENUM('false', 'true'),
            allowNull: false,
            defaultValue: 'false',
        },
        has_deleted: {
            type: DataTypes.ENUM('true', 'false'),
            defaultValue: 'false'
        },
        created_at:{
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize.fn('NOW'),
        },
        updated_at:{
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize.fn('NOW'),
        }

    }, { timestamps: false, underscored: true });

    notifications.associate = function (models) {
        // associations can be defined here
        notifications.belongsTo(models.users, {
            as:'receiver',
            foreignKey:  'user_id'
        });
        notifications.belongsTo(models.users, {
            as:'sender',
            foreignKey: 'sender_id'
        });
        notifications.belongsTo(models.notification_types, {
            foreignKey: {
                name: 'notification_type_id',
                allowNull: false
            }
        });
    // notifications.hasOne(models.users, {
    //   as: 'sender',
    //   foreignKey: 'id',
    // });
    };
    return notifications;
};