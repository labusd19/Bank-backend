"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Transaction extends Model {
    static associate(models) {
      // Veza sa BankAccount (pošiljalac)
      Transaction.belongsTo(models.BankAccount, {
        foreignKey: "sender_account_id",
        onDelete: "CASCADE",
      });

      // Veza sa BankAccount (primalac)
      Transaction.belongsTo(models.BankAccount, {
        foreignKey: "reciver_account_id",
        onDelete: "CASCADE",
      });
    }
  }

  Transaction.init(
    {
      sender_account_id: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
          model: "BankAccounts",
          key: "accountNumber",
        },
      },
      reciver_account_id: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
          model: "BankAccounts",
          key: "accountNumber",
        },
      },
      amount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        validate: {
          min: 0.01,
        },
      },
      description: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "Transaction",
      tableName: "Transactions",
      timestamps: true,
    }
  );

  return Transaction;
};
