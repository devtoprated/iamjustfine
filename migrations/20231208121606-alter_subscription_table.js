'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('subscription', { id: Sequelize.INTEGER });
     */

    await queryInterface.addColumn('subscription', 'stripeSubscriptionPlanId', {
      type: Sequelize.BOOLEAN,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('subscription');
     */

    await queryInterface.removeColumn('subscription', 'stripeSubscriptionPlanId');

  }
};