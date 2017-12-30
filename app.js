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
const route = require("./controllers/users");
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
    app.use(bodyParser.urlencoded({ extended: false }));
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
    app.use(route);
}

