"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Card extends Model {
    static associate(models) {
      Card.belongsTo(models.BankAccount, { foreignKey: "bankAccountId" });
    }
  }
  Card.init(
    {
      bankAccountId: DataTypes.INTEGER,
      cardNumber: DataTypes.STRING,
      expiryDate: DataTypes.DATE,
      cvv: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Card",
    }
  );
  return Card;
};
