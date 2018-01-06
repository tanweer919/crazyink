const express = require("express");
const router = express.Router();
const bodyParser= require("body-parser");
const passport = require("passport");
const localStartegy = require("passport-local");
const passportLocalMongoose = require("passport-local-mongoose");
const User = require("../models/user");
const validator = require("../helpers/validator");

router.get("/", function (req, res) {
    res.render("index");
});

router.get("/home", isLoggedin, function (req, res) {
    res.render("home");
});


router.get("/signup", isNotLoggedIn,  function (req, res) {
    const errors = req.flash('error')
    console.log(errors)
    return res.render("signup", {signin: 'none', signup: 'block', signupActive: 'active', signinActive: '' ,messages: errors});
});

// router.post("/signup", passport.authenticate("local", {
//     successRedirect: "/home",
//     failureRedirect: "/signup"
// }), function (req, res) {
//     if(req.body.password === req.body.password2){
//         User.findOne({'email': req.body.email}, function (err, user) {
//             if(err) {
//                 req.flash('error', 'There is some error')
//                 return res.render("signup");
//             }
//             if(user){
//                 req.flash('error', 'User with email already exist');
//                 return res.render("signup");
//             }
//             const newUser = new User();
//             newUser.username = req.body.username;
//             newUser.email = req.body.email;
//             newUser.password = newUser.encryptPassword(req.body.password);
//             newUser.save();
//         })
//     }
//     else {
//         req.flash('error', 'Password does not match');
//         console.log("Password")
//         return res.render("/signup");
//     }
// })

    router.post("/signup", validator, function (req, res) {
    if(req.body.password === req.body.password2) {
        User.findOne({'email': req.body.email}, function (err, user) {
            if(user) {
                req.flash('error', 'User with email already exists');
                return res.redirect("/signup")
            }
            var newUser = new User({username: req.body.username, email: req.body.email});
            User.register(newUser, req.body.password, function (err, user) {
                if(err) {
                    req.flash('error', 'There is some error')
                     return res.redirect("/signup");
                }
                passport.authenticate("local")(req, res, function () {
                    //req.flash('success', 'Welcome to ChatOnn '+ user.username);
                    res.redirect("/home");
                })
            });
        });
    }
    else {
        req.flash('error', 'Password does not match');
        res.redirect("/signup");
    }
});


router.get("/signin", isNotLoggedIn, function (req, res) {
    const errors = req.flash('error')
    res.render("signup", {signin: 'block', signup: 'none',signupActive: '', signinActive: 'active', messages: errors});
})


router.post("/signin",passport.authenticate("local", {
    successRedirect: "/home",
    failureRedirect: "/signin",
    failureFlash: true
}));


//Logout route
router.get("/logout", function (req, res) {
    req.logout();
    req.flash("success", "Logged you out successfully");
    res.redirect("/");
});

router.get("/auth/facebook", passport.authenticate("facebook", {
    scope: 'email'
}));


router.get("/auth/facebook/callback", passport.authenticate("facebook", {
    successRedirect: "/home",
    failureRedirect: "/signin",
    failureFlash: true
}));
    


//middleware to authenticate
function isLoggedin(req, res, next) {
    if(req.isAuthenticated()) {
        return next();
    }
    req.flash("error", "Login to see the content");
    return res.redirect("/signin");
}
function isNotLoggedIn(req, res, next) {
    if(req.isAuthenticated()) {
        return res.redirect("/home");
    }
    return next();
};

module.exports = router;