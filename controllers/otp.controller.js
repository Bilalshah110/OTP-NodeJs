const catchError = require("../utils/catchError");
const Otp = require("../models/otp.model");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const axios = require("axios");
const { wrongOtpLimiter } = require("../middlewares/otpLimit");
const validatePhone = require("../utils/validatePhone");
const validateEmail = require("../utils/validateEmail");
const validateOtp = require("../utils/validateOtp");
// const { SMS_KEY, EMAIL_KEY } = require("../utils/variables");

const { EMAIL_KEY, SMS_KEY } = process.env;

// Create a Nodemailer transporter using SendGrid
const transporter = nodemailer.createTransport({
  host: "smtp.sendgrid.net",
  port: 587,
  secure: false, // Set to true if you're using SSL/TLS
  auth: {
    user: "apikey",
    pass: EMAIL_KEY,
  },
});

const sendEmail = async (to, subject, text) => {
  const mailOptions = {
    from: "bilalhassan393@gmail.com",
    to: to,
    subject: subject,
    text: text,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error(error);
      return error;
    } else {
      console.log("Email sent: " + info.response);
      return info.response;
    }
  });
};

// ################################## GENERATE OTP ##################################

exports.generateOtp = async (req, res) => {
  const { phone, email } = req.body;

  if (!(email || phone) || (email && phone)) {
    return res.status(400).send({
      success: false,
      message: "Please provide either an email or a phone number",
    });
  }

  const invalid = phone ? validatePhone(phone) : validateEmail(email);

  if (invalid) {
    return res.status(400).send({
      success: false,
      message: invalid,
    });
  }

  const otp = crypto.randomInt(100000, 999999);
  const message = `Your OTP for Agronomics is ${otp}. For any issue contact us 03217336243.`;
  const expiry = new Date();
  expiry.setMinutes(expiry.getMinutes() + 10);

  const identifierKey = phone ? "phone" : "email";
  const identifierValue = phone ? phone : email;

  const otpData = {
    [identifierKey]: identifierValue,
    otp,
    expiry,
  };

  try {
    let sendSuccess = false;

    if (phone) {
      const url = `https://secure.h3techs.com/sms/api/send?email=greenageservices@gmail.com&key=${SMS_KEY}&mask=81478&to=${phone}&message=${message}`;
      const { status, data } = await axios.post(url);
      if (status === 200 && data) {
        sendSuccess = true;
      }
    } else if (email) {
      // Assuming sendEmail function sends the email synchronously
      sendEmail(email, "OTP - Agronomics", message);
      sendSuccess = true;
    }

    if (sendSuccess) {
      // Save OTP in the database only if sent successfully
      const existingOtpRecord = await Otp.findOne({
        where: { [identifierKey]: identifierValue },
      });

      if (existingOtpRecord) {
        // Update existing record
        await Otp.update(otpData, {
          where: { [identifierKey]: identifierValue },
        });
      } else {
        // Create new record
        await Otp.create(otpData);
      }

      return res.status(200).send({
        success: true,
        message: `OTP sent successfully to ${identifierValue}`,
      });
    } else {
      return res.status(500).send({
        success: false,
        message: "Failed to send OTP",
      });
    }
  } catch (error) {
    catchError(res, error);
  }
};

// ################################## VERIFY OTP ##################################

exports.verifyOtp = async (req, res) => {
  const { phone, email, otp } = req.body;

  let invalid;

  if (!(email || phone) || (email && phone)) {
    return res.status(400).send({
      success: false,
      message: "Please provide either an email or a phone number",
    });
  }

  invalid = phone ? validatePhone(phone) : validateEmail(email);

  if (!invalid) {
    invalid = validateOtp(otp);
  }

  if (invalid) {
    return res.status(400).send({
      success: false,
      message: invalid,
    });
  }

  try {
    const identifierKey = phone ? "phone" : "email";
    const identifierValue = phone || email;

    // Retrieve the OTP record from the database based on phone number or email
    const otpData = await Otp.findOne({
      where: {
        [identifierKey]: identifierValue,
      },
    });

    if (otpData) {
      const isOtpValid = otpData.otp === otp;
      const isNotExpired = new Date() < new Date(otpData.expiry);

      if (isOtpValid && isNotExpired) {
        wrongOtpLimiter.resetKey(req);
        // Update expiry time to 10 minutes from the current time
        const newExpiry = new Date();
        newExpiry.setMinutes(newExpiry.getMinutes() + 10);
        await Otp.update(
          { expiry: newExpiry },
          {
            where: {
              [identifierKey]: identifierValue,
            },
          }
        );

        res.status(200).send({
          success: true,
          message: "OTP verified successfully",
        });
      } else {
        res.status(400).send({
          success: false,
          message: "Invalid OTP or OTP expired",
        });
      }
    } else {
      res.status(404).send({
        success: false,
        message: "OTP record not found",
      });
    }
  } catch (error) {
    catchError(res, error);
  }
};
