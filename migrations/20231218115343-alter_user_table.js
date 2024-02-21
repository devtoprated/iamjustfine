'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Set default value to false for the existing records where it's null
    await queryInterface.sequelize.query(`
      UPDATE users
      SET isSubscriptionPurchased = false
      WHERE isSubscriptionPurchased IS NULL;
    `);

    // Modify the column definition to have a default value of false
    await queryInterface.changeColumn('users', 'isSubscriptionPurchased', {
      type: Sequelize.BOOLEAN,
      allowNull: false,  // If you want to disallow null values in the future
      defaultValue: false,
    });
  },

  async down(queryInterface, Sequelize) {
    // Note: It's generally not recommended to revert changes like this if data has been modified.
    // If you need to revert, make sure you have a backup of your data.
  }
};
