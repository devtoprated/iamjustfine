'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('multipleUserSubscription', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      userId: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null,
      },
      planId: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null,
      },
      subscriptionId: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null,
      },
      contactNumber: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null,
      },
      dialCode: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null,
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('now'),
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('now'),
        allowNull: false,
      },
      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('multipleUserSubscription');
  },
};
