const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const http = require('http');
const cookieParser = require("cookie-parser");
const validator = require("express-validator");
var session = require("express-session");
const flash = require("express-flash");
const MongoStore = require("connect-mongo")(session);
const mongoose = require("mongoose");
const passport = require("passport");
const localStrategy = require("passport-local");
const facebookStrategy = require("passport-facebook").Strategy;
const passportLocalMongoose = require("passport-local-mongoose");
const route = require("./controllers/users");
const User = require("./models/user");
const secret = require("./helpers/secret");

//Use global promise for mongoose
mongoose.Promise = global.Promise;
mongoose.connect("mongodb://localhost/crazyink", {useMongoClient: true});
const app = setupExpress();


function setupExpress() {
    const app = express();
    const server = http.createServer(app);
    server.listen(3000, function () {
        console.log("Listenig on port 3000")
    });
    configureExpress(app);
}


function configureExpress(app) {
    app.set('views', path.join(__dirname, 'views'));
    app.set('view engine', 'ejs');
    app.use(express.static(path.join(__dirname, 'public')));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(cookieParser());
    app.use(session({
        secret: "Welcome to hell",
        resave: false,
        saveUninitialized: false,
        store: new MongoStore({mongooseConnection: mongoose.connection})
    }))
    app.use(flash());
    app.use(validator());
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(cookieParser());
    passport.serializeUser(User.serializeUser());
    passport.deserializeUser(User.deserializeUser());
    passport.use(new localStrategy(User.authenticate()));
    passport.use(new facebookStrategy({
        clientID: secret.facebook.clientID,
        clientSecret: secret.facebook.clientSecret,
        profileFields: ['email', 'displayName', 'photos'],
        callbackURL: 'http://localhost:3000/auth/facebook/callback',
        passRegToCallback: true
    }, function (req, token, refreshToken, profile, done) {
        User.findOne({facebook: profile.id}, function(err, user){
            if(err) {
                return done(err)
            }
            if(user) {
                return done(null, user)
            }
            else {
                const newUser = new User();
                newUser.facebook = profile.id;
                newUser.username = profile.displayName;
                newUser.email = profile._json.email;
                newUser.profilePic = 'https://graph.facebook.com/' + profile.id + '/picture?type=large';
                newUser.fbTokens.push({token: token});

                newUser.save(function (err) {
                    return done(null, user);
                });
            }
        })
    }));
    app.use(function (req, res, next) {
        res.locals.currentUser = req.user;
        next();
    });
    app.use(route);
    //middleware to diplay correct auth mode

}

