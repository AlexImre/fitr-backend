require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
var passport = require('passport');
var crypto = require('crypto');
var routes = require('./routes');
const cors = require('cors');
const connection = require('./config/database');
const morgan = require('morgan');

// Package documentation - https://www.npmjs.com/package/connect-mongo
const MongoStore = require('connect-mongo');

require('./config/passport');

/**
 * -------------- GENERAL SETUP ----------------
 */

var app = express();
app.use(express.json());
app.use(morgan('tiny'));
app.use(cors());
app.use(express.urlencoded({extended: true}));
app.use(passport.initialize());
app.use(passport.session());

/**
 * -------------- SESSION SETUP ----------------
 */

const sessionStore = MongoStore.create({ mongoUrl: process.env.DB_STRING });
app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24
    }
}));

/**
 * -------------- PASSPORT AUTHENTICATION ----------------
 */

app.use(passport.initialize());
app.use(passport.session());

// for logging / debugging
// app.use((req, res, next) => {
//     console.log(req.session);
//     console.log(req.user);
//     next();
// })

/**
 * -------------- ROUTES ----------------
 */

app.use(routes);

// ADD ERROR HANDLING ROUTE

app.use((err, req, res, next) => {
    console.log(err);
    res.status(err.status || 500).send('Something went wrong!');
})

/**
 * -------------- SERVER ----------------
 */

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
});