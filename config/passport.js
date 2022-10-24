const passport = require('passport');
const { validPassword } = require('../lib/passwordUtils');
const LocalStrategy = require('passport-local').Strategy;
const connection = require('./database');
const User = connection.models.User;

const customFields = {
    usernameField: 'uname',
    passwordField: 'pw'
};

// I THINK VERIFY CALLBACK NEEDS REQ as first argument to work with customfields https://stackoverflow.com/questions/36761291/how-can-i-store-other-form-fields-with-passport-local-js
const verifyCallback = (username, password, done) => {
    console.log('MAde it to callback!')
    User.findOne({ username: username })
        .then((user) => {
            if (!user) { 
                console.log('user not found!')
                return done(null, false);
            }
            const isValid = validPassword(password, user.hash, user.salt);
            if (isValid) {
                console.log('user and password valid!')
                return done(null, user);
            } else {
                console.log('password invalid!')
                return done(null, false);
            }
        })
        .catch((err) => {
            done(err);
        });
};

const strategy = new LocalStrategy(customFields, verifyCallback);

passport.use(strategy);

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((userId, done) => {
    User.findById(userId)
        .then((user) => {
            done(null, user);
        })
        .catch(err => done(err))
});