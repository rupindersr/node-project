'use strict';
module.exports = (sequelize, DataTypes) => {
    const products_images = sequelize.define('products_images', {
        product_image_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            allowNull: true,
            primaryKey: true,
        },
        product_image: {
            type: DataTypes.STRING,
            defaultValue: ''
        },
        product_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'products',
                key: 'product_id'
            }
        }
    }, { timestamps: false, underscored: true });
    products_images.associate = function (models) {
    // associations can be defined here
        products_images.belongsTo(models.products, { foreignKey: 'product_id' });
    };
    return products_images;
};