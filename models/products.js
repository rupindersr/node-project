'use strict';
module.exports = (sequelize, DataTypes) => {
    const products = sequelize.define('products', {
        product_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true,
        },
        title: {
            type: DataTypes.STRING,
            defaultValue: ''
        },
        description: {
            type: DataTypes.STRING,
            defaultValue: ''
        },
        price: {
            type: DataTypes.STRING,
            defaultValue: ''
        },
        has_deleted: {
            type: DataTypes.ENUM('true', 'false'),
            defaultValue: 'false'
        },
    // product_category_id: {
    //   type: DataTypes.INTEGER,
    //   allowNull: false,
    //   references: {
    //     model: 'product_category',
    //     key: 'category_id'
    //   }
    // }
    }, { timestamps: true, underscored: true });
    products.associate = function (models) {
    // associations can be defined here
        products.hasMany(models.products_images, { foreignKey: 'product_id' });
        products.hasMany(models.cart, { foreignKey: 'product_id' });
        products.belongsTo(models.product_category, { foreignKey: 'product_category_id' });
    };
    return products;
};