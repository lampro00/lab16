const User = require("../models/user");
const { validationResult, check } = require("express-validator");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const sendgridTransport = require("nodemailer-sendgrid-transport");
const transporter = nodemailer.createTransport(
  sendgridTransport({
    auth: {
      api_key:
        "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",
    },
  })
);
exports.getLogin = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
    errorMessege: message,
    oldinput: {
      email: "",
      password: "",
    },
    validatorerro: [],
  });
};

exports.getSignup = (req, res, next) => {
  res.render("auth/signup", {
    path: "/signup",
    pageTitle: "Signup",
    errorMessege: req.flash("error"),
    oldinput: {
      email: "",
      password: "",
    },
    validatorerro: [],
  });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render("auth/login", {
      path: "/login",
      pageTitle: "Login",
      errorMessege: errors.array()[0].msg,
      oldinput: {
        email: email,
        password: password,
      },
      validatorerro: errors.array(),
    });
  }

  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        return res.status(422).render("auth/login", {
          path: "/login",
          pageTitle: "Login",
          errorMessege: "Invalid email or password.",
          oldInput: {
            email: email,
            password: password,
          },
          validatorerro: [],
        });
      }
      bcrypt
        .compare(password, user.password)
        .then((doMatch) => {
          if (doMatch) {
            req.session.isLoggedIn = true;
            req.session.user = user;
            return req.session.save((err) => {
              console.log(err);
              res.redirect("/");
            });
          }
          return res.status(422).render("auth/login", {
            path: "/login",
            pageTitle: "Login",
            errorMessege: "Invalid email or password.",
            oldinput: {
              email: email,
              password: password,
            },
            validatorerro: [],
          });
        })
        .catch((err) => {
          console.log(err);
          res.redirect("/login");
        });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatuCode = 500;
      next(error);
    });
};

exports.postSignup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;
  const errorvalidator = validationResult(req);
  if (!errorvalidator.isEmpty()) {
    console.log(errorvalidator.array()[0]);
    return res.status(422).render("auth/signup", {
      path: "/signup",
      pageTitle: "Signup",
      errorMessege: errorvalidator.array()[0].msg,
      oldinput: {
        email: email,
        password: password,
      },
      validatorerro: errorvalidator.array(),
    });
  }
  bcrypt
    .hash(password, 12)
    .then((hasdPassword) => {
      const user = new User({
        email: email,
        password: hasdPassword,
        cart: { item: [] },
      });
      return user.save();
    })
    .then((result) => {
      res.redirect("/");
      return transporter.sendMail({
        to: email,
        from: "lamvtfx17437@funix.edu.vn",
        subject: "sigin ok",
        html: "<h1>you successtFuly Signed up</h1>",
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatuCode = 500;
      next(error);
    });
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    console.log(err);
    res.redirect("/");
  });
};
