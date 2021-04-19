'use strict';
module.exports = (sequelize, DataTypes) => {
    const orders = sequelize.define('orders', {
        order_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        cart_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            reference: {
                name: 'products',
                key: 'product_id'
            }
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            reference: {
                name: 'users',
                key: 'user_id'
            }
        },
        sub_total: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 0
        },
        shipping_charges: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 0
        },
        tax: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 0
        },
        total_amount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 0
        },
        shipped_date: {
            type: DataTypes.DATEONLY,
            defaultValue: DataTypes.NOW,
            allowNull: false,
        },
        order_status: {
            type: DataTypes.ENUM('pending', 'completed', 'cancelled'),
            defaultValue: 'pending'
        }
    }, { timestamps: true, underscored: true });
    orders.associate = function (models) {
    // associations can be defined here
        orders.belongsTo(models.cart, { foreignKey: 'cart_id' });
        orders.belongsTo(models.users, { foreignKey: 'user_id' });
    };
    return orders;
};