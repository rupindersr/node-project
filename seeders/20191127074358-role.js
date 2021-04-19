'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.bulkInsert('People', [{
        name: 'John Doe',
        isBetaMember: false
      }], {});
    */
   return queryInterface.bulkInsert('roles', [
      {
        name: 'super admin',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'admin',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'parent',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'teacher',
        created_at: new Date(),
        updated_at: new Date()
      }
], {force:true});
  },

  down: (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.bulkDelete('People', null, {});
    */
  //  return queryInterface.bulkDelete('roles', null, {});
  return queryInterface.dropTable('roles')
  }
};
