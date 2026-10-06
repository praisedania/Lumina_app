'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Conversations', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
      },
      type: {
        type: Sequelize.ENUM('room', 'dm'),
        allowNull: false
      },
      course_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'Courses',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      participants: {
        type: Sequelize.ARRAY(Sequelize.UUID),
        defaultValue: []
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Conversations');
    // Drop enum type manually if needed for some Postgres versions, 
    // but usually dropTable handles it or we can ignore for MVP.
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Conversations_type";');
  }
};
