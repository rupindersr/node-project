'use strict';
module.exports = (sequelize, DataTypes) => {
    const settings = sequelize.define('settings', {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
        },
        enable_notification: {
            type: DataTypes.ENUM('true','false'),
            defaultValue: 'true'
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    }, { timestamps: true, underscored: true });
    settings.associate = function(models) {
        // associations can be defined here
        settings.belongsTo(models.users, {
            hooks: true,
            foreignKey: {
                name: 'user_id',
                allowNull: false
            }
        });
    };
    return settings;
};