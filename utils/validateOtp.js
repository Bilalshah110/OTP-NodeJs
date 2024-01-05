const validateOtp = (otp) => {
  if (!otp) {
    return "Otp is required";
  }

  const otpPattern = /^\d{0,6}$/;

  if (!otpPattern.test(otp)) {
    return "Please enter a valid otp";
  }
  if (otp.length !== 6) {
    return "OTP must have exactly 6 digits";
  }
};

module.exports = validateOtp;
