const validatePhone = (phone) => {
  const networks = ["9230", "9231", "9232", "9233", "9234", "9235"];

  if (!phone) {
    return "Phone number is required";
  }

  if (!phone.startsWith("92")) return "Phone number should must start with 92";

  if (!networks.some((network) => phone.startsWith(network))) {
    return "Please enter a valid network";
  }

  if (phone.length !== 12) {
    return "Please enter a valid phone number";
  }
};

module.exports = validatePhone;
