'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Courses', 'price', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00
    });
    await queryInterface.addColumn('Courses', 'currency', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'NGN'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Courses', 'price');
    await queryInterface.removeColumn('Courses', 'currency');
  }
};
