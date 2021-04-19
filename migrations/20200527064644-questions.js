'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
     queryInterface.addColumn(
        'questions',
        'correct_answer',
        Sequelize.STRING
    );
    return queryInterface.changeColumn(
      'description',
      'description',
      {
        type: Sequelize.TEXT,
      }
    )
  },

  down: (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.dropTable('users');
    */
  }
};
