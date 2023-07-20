const express = require("express");
const router = express.Router();


const {signup, signin, signout, requireSignin , getAllUsers  , getUserById , getAllManagerUsers, updateUser, forgotPasswordCheckEmail, forgotPasswordCheckOTP, changePassword, getAllUsersByRole} = require("../controllers/user")

const {userSignupValidator} = require("../validator")

router.post("/signup",userSignupValidator, signup);
router.post("/signin", signin);
router.get("/signout", signout);
router.get("/",  requireSignin , getAllUsers);
router.get("/managers",  requireSignin , getAllManagerUsers);
router.get("/:userId",  requireSignin , getUserById);
router.post("/:userId/update", requireSignin, updateUser);
router.post("/check-email", forgotPasswordCheckEmail);
router.post("/check-otp", forgotPasswordCheckOTP);
router.post("/change-password", changePassword);
router.get("/users-list/:userId",  requireSignin , getAllUsersByRole);

module.exports = router;