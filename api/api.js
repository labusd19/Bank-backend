require("dotenv").config();

const { Op } = require("sequelize");
const Decimal = require("decimal.js");

const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");

const { User, BankAccount, Transaction } = require("../models");

const isAuth = require("../middleware/is-auth");
const isAdmin = require("../middleware/is-admin");

async function getUserTransactions(id) {
  try {
    const transactions = await Transaction.findAll({
      where: {
        [Op.or]: [{ sender_account_id: id }, { reciver_account_id: id }],
      },
    });
    if (!transactions) {
      return "No transactions found";
    }
    return transactions;
  } catch (error) {
    console.error(error);
    return error;
  }
}

//User part

// GET user by id
router.get("/user/:id", isAuth, isAdmin, async (req, res, next) => {
  const { id } = req.params;

  try {
    const user = await User.findByPk(id);

    if (user) {
      return res.status(200).json(user);
    } else {
      return res.status(404).json({ message: "User not found!" });
    }
  } catch (error) {
    console.error("Error fetching user: ", error);
    return res.status(500).json({ error: error });
  }
});

// Edit user
router.put("/edit-user/:id", isAuth, async (req, res, next) => {
  const { id } = req.params;
  const { fullname, email, phone, birthdate, adress } = req.body;

  try {
    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    if (!req.user.id === id) {
      return res
        .status(403)
        .json({ message: "You do not have permission to edit this user!" });
    }

    if (fullname) user.fullname = fullname;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (birthdate) user.birthdate = birthdate;
    if (adress) user.adress = adress;

    await user.save();

    return res.status(200).json({ message: "User updated successfully!" });
  } catch (error) {
    console.error("Error editing user: ", error);
    return res.status(500).json({ error: error });
  }
});

// Delete user

router.delete("/user/:id", isAuth, async (req, res, next) => {
  const { id } = req.params;
  try {
    const user = await User.findByPk(id);
    await user.destroy();
    return res.status(200).json({ message: "User deleted!" });
  } catch (error) {
    console.error("Error deleting user: ", error);
    return res.status(500).json({ error: error });
  }
});

// Password reset

router.put("/reset-password/:id", isAuth, async (req, res, next) => {
  const { id } = req.params;
  const { password, confirmPassword } = req.body;

  try {
    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    if (password !== confirmPassword) {
      return res
        .status(401)
        .json({ message: "Password and confirm password must be the same!" });
    }
    user.password = await bcrypt.hash(password, 12);
    await user.save();
    return res.status(200).json({ message: "Password reset successfully!" });
  } catch (error) {
    console.error("Error occured! ", error);
    return res.status(500).json({ error: error });
  }
});

// Bank account crud

// Get bank account by ID

router.get("/bank-account/:id", async (req, res, next) => {
  const { id } = req.params;

  try {
    const bankAccount = await BankAccount.findByPk(id, {
      include: {
        model: User,
        attributes: ["fullname"],
      },
    });

    if (!bankAccount) {
      return res
        .status(404)
        .json({ message: "Bank account with this id does not exist." });
    }

    // bankAccount.balance = new Decimal(bankAccount.balance);

    let balanceCheck = new Decimal("0.00");

    const transactions = await getUserTransactions(bankAccount.accountNumber);

    for (const t of transactions) {
      console.log("Transakcija: ", t.amount);
      console.log("Balancecheck for: ", balanceCheck);
      if (t.sender_account_id === bankAccount.accountNumber) {
        balanceCheck = balanceCheck.minus(new Decimal(t.amount));
      } else if (t.reciver_account_id === bankAccount.accountNumber) {
        balanceCheck = balanceCheck.plus(new Decimal(t.amount));
      }
    }

    return res.status(200).json(bankAccount);
    // Check if balance is equal to all transactions
    // if (balanceCheck.toFixed(2) === bankAccount.balance) {
    //   return res.status(200).json(bankAccount);
    // } else {
    //   bankAccount.balance = balanceCheck;
    //   bankAccount.save();
    //   return res.status(200).json({
    //     message:
    //       "There was a difference between balance and transactions but it is fixed!",
    //   });
    // }
  } catch (error) {
    console.error("error occured! ", error);
    return res.status(500).json({ error: error });
  }
});

// GET bank account by account number
router.get("/bank-account", async (req, res, next) => {
  const { accountNumber } = req.body;

  try {
    const bankAccount = await BankAccount.findOne({
      where: { accountNumber },
      include: {
        model: User,
        attributes: ["fullname"],
      },
    });

    if (!bankAccount) {
      return res.status(404).json({
        message: "Bank account with this account number does not exist.",
      });
    }

    return res.status(200).json(bankAccount);
  } catch (error) {
    console.error("error occured! ", error);
    return res.status(500).json({ error: error });
  }
});

// Create bank account

router.post("/bank-account", async (req, res) => {
  const { userId } = req.body;

  try {
    // Opcionalna provera da li korisnik postoji
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const newBankAccount = await BankAccount.create(
      { userId },
      { individualHooks: true }
    );

    return res.status(201).json(newBankAccount);
  } catch (error) {
    console.error("Error creating bank account:", error);
    return res.status(500).json({ error: error.message });
  }
});

// DELETE bank account

router.delete("/bank-account/:id", isAuth, isAdmin, async (req, res, next) => {
  const { id } = req.params;

  try {
    const bankAccount = await BankAccount.findByPk(id);

    if (!bankAccount) {
      return res
        .status(404)
        .json({ message: "Bank account under this id does not exist!" });
    }

    await bankAccount.destroy();

    return res.status(200).json({ message: "Bank account deleted!" });
  } catch (error) {
    console.error("Error occured! ", error);
    return res.status(500).json({ error: error });
  }
});

// TRANSACTIONS CRUD

// GET transaction by id

router.get("/transactions/:id", isAuth, async (req, res, next) => {
  const { id } = req.params;

  try {
    const transaction = await Transaction.findByPk(id);

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    return res.status(200).json(transaction);
  } catch (error) {
    console.error("Error occurred! ", error);
    return res
      .status(500)
      .json({ message: "Internal server error! ", error: error });
  }
});

router.post("/transactions", isAuth, async (req, res, next) => {
  const { sender_account_id, reciver_account_id, amount, description } =
    req.body;

  try {
    const sender = await BankAccount.findOne({
      where: { accountNumber: sender_account_id },
    });
    const reciver = await BankAccount.findOne({
      where: { accountNumber: reciver_account_id },
    });

    if (!sender || !reciver) {
      return res.status(404).json({ message: "Invalid account number!" });
    }

    const senderBalance = new Decimal(sender.balance);
    const transferAmount = new Decimal(amount);

    // if (senderBalance.lessThan(transferAmount)) {
    //   return res.status(400).json({
    //     message: "Insufficient funds on sender's account.",
    //   });
    // }

    const newTransaction = await Transaction.create({
      sender_account_id: sender_account_id,
      reciver_account_id: reciver_account_id,
      amount: amount,
      description: description,
    });

    sender.balance = new Decimal(sender.balance).minus(
      new Decimal(newTransaction.amount)
    );
    reciver.balance = new Decimal(reciver.balance).plus(
      new Decimal(newTransaction.amount)
    );

    await sender.save();
    await reciver.save();

    return res
      .status(200)
      .json({ message: "Trasaction successful", newTransaction });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Internal server error! ", error: error });
  }
});

// Delete transaction

router.delete("/transactions/:id", isAuth, isAdmin, async (req, res, next) => {
  const { id } = req.params;

  try {
    const transaction = await Transaction.findByPk(id);

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found!" });
    }
    transaction.destrou();

    return res.status(200).json({ message: "Transaction deleted!" });
  } catch (error) {
    console.error("Error occured! ", error);
    return res
      .status(500)
      .json({ message: "Internal server error!", error: error });
  }
});

module.exports = router;
