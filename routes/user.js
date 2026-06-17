const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");
const userController = require("../controllers/user.js");

// signup
router.get("/signup", (req, res) => {
    res.render("user/signup.ejs");
});

router.post("/signup", wrapAsync(userController.signup));

// login
router.get("/login", (req, res) => {
    res.render("user/login.ejs");
});

router.post("/login",
    saveRedirectUrl,
    passport.authenticate("local", {
        failureRedirect: "/login",
        failureFlash: true,
    }),
    userController.login
);

// logout
router.get("/logout", userController.logout);

module.exports = router;