const { User } = require("../models");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const express = require("express");
const router = express.Router();

router.post("/register", async (req, res, next) => {
  const { fullname, email, phone, birthdate, adress, password, isAdmin } =
    req.body;

  try {
    const newUser = await User.create({
      fullname: fullname,
      email: email,
      phone: phone,
      birthdate: birthdate,
      adress: adress,
      password: await bcrypt.hash(password, 12),
      isAdmin: isAdmin,
    });
    await newUser.save();
    return res.status(201).json({ message: "User created!" });
  } catch (err0r) {
    console.log("Creating user failed! Error: ", error);
    return res.status(500).json({ error: error });
  }
});

router.post("/login", async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: "Invalid password!" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, isAdmin: user.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRATION }
    );

    return res
      .status(200)
      .json({ message: "Login successfully!", token: token });
  } catch (error) {
    return res.status(500).json({ error: error });
  }
});

module.exports = router;
