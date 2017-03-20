module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.addColumn(
      'user',
      'closedDate',
      { type: Sequelize.DATE }
    );
  },

  down: function(queryInterface, Sequelize) {
    return queryInterface.removeColumn('user', 'closedDate');
  }
}
