module.exports.isAuth = (req, res, next) => {
    console.log('You have hit isAuth function!');
    console.log(req.session);
    if (!req.user) {
        console.log('You are not authorised! #1');
        res.status(401).json({ msg: 'You are not authorised to view this resource' });
        return;
    }

    if (req.isAuthenticated) {
        console.log('You are authorised!');
        next();
    } else {
        console.log('You are not authorised! #2');
        res.status(401).json({ msg: 'You are not authorised to view this resource' });
    }
}

module.exports.isAdmin = (req, res, next) => {
    if (req.isAuthenticated && req.user.admin) {
        next();
    } else {
        res.status(401).json({ msg: 'You are not an admin' });
    }
}