const User = require("../models/user");

module.exports.renderSignupFrom = (req, res) => {
    res.render("user/signup.ejs");
};

// ✅ Complete fixed signup
module.exports.signup = async (req, res) => {
    try {
        let { username, email, password } = req.body;

        // ← these print in terminal — check what values arrive
        console.log("username:", username);
        console.log("email:", email);
        console.log("password:", password);

        const newUser = new User({ email, username });
        const registeredUser = await User.register(newUser, password);

        req.login(registeredUser, (err) => {
            if (err) return next(err);
            req.flash("success", "Welcome to Wanderlust!");
            res.redirect("/listings");
        });

    } catch(e) {
        console.log("Signup error:", e.message); // ← check terminal!
        req.flash("error", e.message);
        res.redirect("/signup");
    }
};

// login 

module.exports.renderLoginFrom = (req,res) => {
    res.render("user/login.ejs");
};

module.exports.login = async (req,res) => {
    req.flash("success", "Welcome back to Wanderlust!");
    let redirectUrl = res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);
};

module.exports.logout = (req,res,next) => {
    req.logout((err) => {
        if(err) {
            next(err);
        }
        req.flash("success", "you are logged out");
        res.redirect("/listings");
    });
};
