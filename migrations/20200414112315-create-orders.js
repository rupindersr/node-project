'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    queryInterface.dropTable();
    return queryInterface.createTable('orders', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      product_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        reference: {
          name: 'products',
          key: 'product_id'
        }
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        reference: {
          name: 'users',
          key: 'user_id'
        }
      },
      sub_total: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      },
      shipping_charges: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      },
      tax: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      },
      total_amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      },
      shipped_date: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Date.NOW
      },
      order_status: {
        type: Sequelize.ENUM('pending', 'completed', 'cancelled'),
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('orders');
  }
};