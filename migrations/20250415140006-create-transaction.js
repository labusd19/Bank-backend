"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Transactions", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
        onDelete: "CASCADE",
      },
      sender_account_id: {
        type: Sequelize.STRING, // Tip treba da bude INTEGER
        allowNull: false,
        references: {
          model: "BankAccounts", // Pokazuje na tabelu BankAccounts
          key: "accountNumber",
        },
      },
      reciver_account_id: {
        type: Sequelize.STRING, // Tip treba da bude INTEGER
        allowNull: false,
        references: {
          model: "BankAccounts", // Pokazuje na tabelu BankAccounts
          key: "accountNumber",
        },
      },
      amount: {
        type: Sequelize.DECIMAL(12, 2), // Decimal tip sa preciznošću
        allowNull: false,
      },
      description: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Transactions");
  },
};
