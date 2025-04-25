"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Transaction extends Model {
    static associate(models) {
      Transaction.belongsTo(models.BankAccount, {
        as: "Sender",
        foreignKey: "sender_account_id",
        targetKey: "accountNumber",
        onDelete: "CASCADE",
      });

      Transaction.belongsTo(models.BankAccount, {
        as: "Reciver",
        foreignKey: "reciver_account_id",
        targetKey: "accountNumber",
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
