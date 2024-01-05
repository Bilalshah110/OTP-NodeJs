const rateLimit = require("express-rate-limit");

// Rate limiter for successful OTP verification
const otpLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: "Too many requests, please try again later.",
  keyGenerator: (req) => {
    const { email, phone } = req.body;
    return phone || email || req.ip;
  },
});

// Rate limiter for wrong OTP attempts
const wrongOtpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  message: "Too many wrong OTP attempts. Please try again after 10 minutes.",
  keyGenerator: (req) => {
    const { email, phone } = req.body;
    return phone || email || req.ip;
  },
});

module.exports = {
  otpLimiter,
  wrongOtpLimiter,
};
