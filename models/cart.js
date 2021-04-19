'use strict';
module.exports = (sequelize, DataTypes) => {
    const cart = sequelize.define('cart', {
        cart_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        product_id: {
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
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    }, { timestamps: true, underscored: true });
    cart.associate = function (models) {
    // associations can be defined here
        cart.belongsTo(models.products, { foreignKey: 'product_id' });
        cart.belongsTo(models.users, { foreignKey: 'user_id' });
        cart.hasMany(models.orders, { foreignKey: 'cart_id' });
    };
    return cart;
};