const validEmailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
const validateEmail = (email) => {
  if (!email) {
    return "Email is required";
  }
  if (!validEmailRegex.test(email)) {
    return "Please enter a valid email";
  }
};

module.exports = validateEmail;
