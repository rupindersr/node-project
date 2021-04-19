'use strict';
module.exports = (sequelize, DataTypes) => {
    const product_category = sequelize.define('product_category', {
        product_category_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true,
        },
        category_name: {
            type: DataTypes.STRING,
            defaultValue: ''
        },
        has_deleted: {
            type: DataTypes.ENUM('true', 'false'),
            defaultValue: 'false'
        }
    }, { timestamps: true, underscored: true });
    product_category.associate = function () {
    // associations can be defined here
    // product_category.hasMany(models.products, { foreignKey: 'product_category_id' })
    };
    return product_category;
};
