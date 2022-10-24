const router = require('express').Router();
const passport = require('passport');
const genPassword = require('../lib/passwordUtils').genPassword;
const connection = require('../config/database');
const User = connection.models.User;
const { isAuth, isAdmin } = require('./authMiddleware');

/**
 * -------------- POST ROUTES ----------------
 */

router.get('/test', (req, res, next) => {
    res.json('well done');
})

router.post('/login', 
    passport.authenticate('local'), 
    (req, res, next) => {
        console.log('made it to login API endpoint');
        res.send();
    });

 router.post('/register', async (req, res, next) => {
    // ADD CHECK TO SEE IF NAME ALREADY EXISTS!
    console.log('You just hit the post /register end point.');
    console.log(req.body);
    const saltHash = genPassword(req.body.pw);
    const salt = saltHash.salt;
    const hash = saltHash.hash;

    try {
        const newUser = new User({
            username: req.body.uname,
            hash: hash, 
            salt: salt,
            admin: true
        });
    
        await newUser.save()
            .then((user) => {
                console.log(user);
            });
        
    } catch (err) {
        console.log('MADE IT 3!');
        if(err.code === 11000) {
            const dupeError = new Error('Duplication Error!');
            err.status = 409;
        }
        res.status(err.status || 500).send();
        return;
    }
    res.status(201).send();
 });

router.post('/addEvent', async (req, res, next) => {
    console.log('You made it to addevent API endpoint!');
    console.log(req.body);
    console.log(req.user);
    const newEvent = req.body.newEvent;
    const user = await User.findOne({ username: req.user.username });

    console.log(user);
    user.allEvents.push(newEvent);
    await user.save();
    const index = user.allEvents.length - 1;
    console.log(index);
    const newEventSavedByDb = await User.aggregate([
        {$match: { username: req.user.username }},
        {$project: {
            lastItem: {$arrayElemAt: ["$allEvents", -1]}
        }
        }
    ])
    console.log(newEventSavedByDb);
    res.send(newEventSavedByDb);
})

 /**
 * -------------- GET ROUTES ----------------
 */

router.get('/auth', isAuth, (req, res, next) => {
    console.log('You made it to auth route');
    // res.send();
});

router.get('/allEvents', isAuth, async (req, res, next) => {
    console.log('You made it to get get allEvents route');
    const user = await User.findOne({ username: req.user.username });
    res.status(200).send(user);
});

// log user out
router.get('/logout', (req, res, next) => {
    req.logOut();

    // NOT SURE THIS IS BEST PRACTICE?
    req.session.destroy();
});

 /**
 * -------------- GET ROUTES ----------------
 */

 router.delete('/delete', async (req, res, next) => {
    const eventId = req.body.eventId;
    console.log(req.body);
    const user = await User.findOne({ username: req.user.username });
    // console.log(user);
    console.log(eventId);

    await User.findOneAndUpdate({ _id: user._id },
    { $pull: { allEvents: { _id: eventId } } });

    console.log('You deleted something!');
    res.status(204).send(user);

 })

module.exports = router;