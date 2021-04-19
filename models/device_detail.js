'use strict';
module.exports = (sequelize, DataTypes) => {
    const device_detail = sequelize.define('device_detail', {
        device_type: {
            type: DataTypes.STRING,
            defaultvalue: ''
        },
        device_id: {
            type: DataTypes.STRING,
            defaultvalue: ''
        },
        fcm_token: {
            type: DataTypes.STRING,
            defaultvalue: ''
        },
        token: {
            type: DataTypes.STRING,
            defaultvalue: ''
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id'
            }
        }
    }, { underscored: true, timestamps: true });
    // device_detail.associate = function(models) {
    //   // associations can be defined here
    //   device_detail.belongsTo(models.users, {
    //     // onDelete: 'CASCADE',
    //     hooks: true,
    //     foreignKey: {
    //       name: "user_id",
    //       allowNull: false
    //     }
    //   })
    // };
    return device_detail;
};