const router = require("express").Router();
const otpController = require("../controllers/otp.controller");
const { otpLimiter, wrongOtpLimiter } = require("../middlewares/otpLimit");

router.get("/test", async (req, res) =>{
    res.send({message: "HELLOOO"})
});
router.post("/generate-otp", otpLimiter, otpController.generateOtp);
router.post("/verify-otp", wrongOtpLimiter, otpController.verifyOtp);

module.exports = router;
