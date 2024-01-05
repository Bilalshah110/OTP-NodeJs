require("dotenv").config();
const express = require("express");
const cors = require("cors");
const sequelize = require("./config/sequelize");
const otpRoutes = require("./routes/otp.routes");

const app = express();
const PORT = 8090;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Welcome API
app.get("/", (req, res) => {
  res.status(200).send({ message: "Welcome to Agronomics - OTP APIs" });
});

app.use("/",otpRoutes);

// Database Connection
sequelize
  .sync({ force: false })
  .then(() => {
    console.log("Connected to database");

    // Start the server after syncing
    app.listen(PORT, () => {
      console.log(`Server is listening at http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Error connecting to the database:", error);
  });
