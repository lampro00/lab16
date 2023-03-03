const express = require("express");
const User = require("../models/user");
const authController = require("../controllers/auth");

const router = express.Router();
const { check, body } = require("express-validator");
router.get("/login", authController.getLogin);

router.get("/signup", authController.getSignup);

router.post(
  "/login",
  check("email").isEmail().withMessage("email không hợp lệ"),
  body("password", "Mật khẩu đủ 8 kí tự trở lên")
    .isLength({ min: 8 })
    .isAlphanumeric(),
  authController.postLogin
);

router.post(
  "/signup",
  check("email")
    .isEmail()
    .withMessage("email không hợp lệ")
    .custom((value, { req }) => {
      if (value === "") throw new Error("Trường email không dc để trống");
      return User.findOne({ email: value }).then((user) => {
        if (user) {
          return Promise.reject("email đã được dùng");
        }
        return true;
      });
    }),
  body("password", "Mật khẩu đủ 8 kí tự trở lên")
    .isLength({ min: 8 })
    .isAlphanumeric(),

  body("confirmPassword").custom((value, { req }) => {
    if (value != req.body.password) throw new Error("xác nhận mật không khớp");
    //   if (value === "")
    //     throw new Error("Trường confirmPassword không dc để trống");
    return true;
  }),
  authController.postSignup
);

router.post("/logout", authController.postLogout);

module.exports = router;
