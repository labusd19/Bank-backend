require("dotenv").config();

const path = require("path");
const cors = require("cors");

const { Sequelize } = require("sequelize");
const express = require("express");

const app = express();
app.use(cors());
app.use(express.json());
console.log("App ", process.env.POSTGRES_URL);

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT,
    logging: false,
  }
);

const authRoutes = require("./api/auth");
const apiRoutes = require("./api/api");

app.use(authRoutes);
app.use(apiRoutes);

(async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connected!");

    await sequelize
      .sync({ alter: true })
      .then(() => console.log("Tables synchronized successfully."))
      .catch((error) => console.error("Error synchronizing tables: ", error));

    app.listen(process.env.PORT, () => {
      console.log("Server listen on port", process.env.PORT);
    });
  } catch (error) {
    console.error("Connection denied: ", error);
  }
})();
