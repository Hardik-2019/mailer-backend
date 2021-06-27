const passport = require("passport");
const token = require('../controllers/auth');

module.exports = (req, res, next) => {
    // console.log("Here is jwt",res);
    // const tp = token.tokenCall();
    // console.log(tp);
    passport.authenticate('jwt', function(err, user, info) {
        if (err) return next(err);
        // console.log("inside authenticate",user);
        if (!user) return res.status(401).json({message: "Unauthorized Access - No Token Provided!"});
        req.user = user;
        next();
    })(req, res, next);
};