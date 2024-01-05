// models/otpModel.js

const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");

const OTP = sequelize.define("OTP", {
  phone: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  otp: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  expiry: {
    type: DataTypes.DATE,
    allowNull: false,
  },
});

module.exports = OTP;
