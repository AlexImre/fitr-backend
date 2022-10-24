const mongoose = require('mongoose');

require('dotenv').config();

/**
 * -------------- DATABASE ----------------
 */

const conn = String(process.env.DB_STRING);
const connection = mongoose.createConnection(conn, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Creates simple schema for a User. The hash and salt are derived from the user's given password when they register
const UserSchema = new mongoose.Schema({
    username: {type: String, unique: true, required: true},
    hash: String,
    salt: String,
    allEvents: [{
        activity: String,
        start: Date,
        end: Date,
        length: Number
    }]
});

// const User = connection.model('User', UserSchema);
const User = connection.model('User', UserSchema);

// Expose the connection
module.exports = connection;