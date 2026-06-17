if(process.env.NODE_ENV != "production"){
    require('dotenv').config();
};

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");


const dbUrl = process.env.ATLASDB_URL;

async function main() {
  await mongoose.connect(dbUrl);
}

main()
.then(() => console.log("connection successful"))
.catch(err => console.log(err));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname,"views"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname,"/public")));


const sessionOption = {
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    }
};


app.use(session(sessionOption));
app.use(flash());

//signup method
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Flash Messages
app.use((req,res,next) => {
    res.locals.success = req.flash("success"); // res.locals makes them available in every EJS template automatically.
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});

// app.get("/demouser", async (req,res) => {
//     let fakeUser = new User({
//         email: "student@gmail.com",
//         username: "anuj"
//     });

//    let registerdUser = await User.register(fakeUser, "helloworld");
//    res.send(registerdUser);
// })

function asyncWrap(fn) {
    return function (req,res,next) {
        fn(req,res,next).catch((err) => next(err));
    };
}

// checking tokens 

//  const checkToken = (req,res,next) => {
//      let {token} = req.query;
//      if (token === "Divyapratap") {
//         return next();
//      }
//     res.send("ACCESS DENIED!");
// };


app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);

// error handling
app.use((err, req, res, next) => {
    console.log(err.stack);

    let { status = 500, message = "Something went wrong!" } = err;

    if(res.headersSent){
        return next(err);
    }

    res.status(status).render("error.ejs", { errMsg: message });
});

app.listen(8080, () => {
    console.log("server is listening on port 8080");
});
