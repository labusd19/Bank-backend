"use strict";
const { Model } = require("sequelize");

function generate13DigitNumber() {
  return Math.floor(1000000000000 + Math.random() * 9000000000000).toString();
}

module.exports = (sequelize, DataTypes) => {
  class BankAccount extends Model {
    static associate(models) {
      BankAccount.belongsTo(models.User, { foreignKey: "userId" });
      BankAccount.hasMany(models.Card, { foreignKey: "bankAccountId" });
      BankAccount.hasMany(models.Transaction, {
        as: "SentTransactions",
        foreignKey: "sender_account_id",
      });
      BankAccount.hasMany(models.Transaction, {
        as: "ReceivedTransactions",
        foreignKey: "reciver_account_id",
      });
    }
  }

  BankAccount.init(
    {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      accountNumber: {
        type: DataTypes.STRING,
        unique: true,
      },
      currency: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "RSD",
      },
      balance: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
    },
    {
      sequelize,
      modelName: "BankAccount",
    }
  );

  // Hook za generisanje jedinstvenog broja računa
  BankAccount.beforeCreate(async (bankAccount, options) => {
    let unique = false;
    let generatedNumber;

    while (!unique) {
      generatedNumber = generate13DigitNumber();
      const existing = await BankAccount.findOne({
        where: { accountNumber: generatedNumber },
      });

      if (!existing) {
        unique = true;
      }
    }

    bankAccount.accountNumber = generatedNumber;
  });

  return BankAccount;
};
