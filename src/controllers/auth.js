const User = require('../models/user');
const Token = require('../models/token');
const {sendEmail} = require('../utils/emailAndStorage');

var token;

exports.register = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (user) return res.status(401).json({message: 'Email pehle se register ho rakha hai.'});
        const newUser = new User({ ...req.body, role: "basic" });
        const user_ = await newUser.save();
        await sendVerificationEmail(user_, req, res);
    } catch (error) {
        res.status(500).json({success: false, message: error.message})
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) 
            return res.status(401).json({msg: 'yeh ' + email + ' galat email hai'});
        if (!user.comparePassword(password)) 
            return res.status(401).json({message: 'galat hai email/pass'});
        if (!user.isVerified) 
            return res.status(401).json({ type: 'not-verified', message: 'Verify nai hua.' });
        // res.status(200).json({token: user.generateJWT(), user: user});
        const token = user.generateJWT();
        res.cookie('token', token, { httpOnly: true });
        res.json({ token });
       
        // token = user.generateJWT();
        // this.tokenCall()
    } catch (error) {
        res.status(500).json({message: error.message})
    }
};

exports.verify = async (req, res) => {
    if(!req.params.token) 
        return res.status(400).json({message: "aisa koi nai hai"});
    try {
        const token = await Token.findOne({ token: req.params.token });
        if (!token) 
            return res.status(400).json({ message: 'link expire ho gaya' });
        User.findOne({ _id: token.userId }, (err, user) => {
            if (!user) 
                return res.status(400).json({ message: 'aisa koi nai hai' });
            if (user.isVerified) 
                return res.status(400).json({ message: 'verified hai already' });
            user.isVerified = true;
            user.save(function (err) {
                if (err) 
                    return res.status(500).json({message:err.message});
                res.status(200).send("Verify ho gaya login karlo.");
            });
        });
    } catch (error) {
        res.status(500).json({message: error.message})
    }
};

exports.resendToken = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) 
            return res.status(401).json({ message: 'yeh ' + req.body.email + ' email register nai hua hai'});
        if (user.isVerified) 
            return res.status(400).json({ message: 'Verify ho gaya , login kar lo'});
        await sendVerificationEmail(user, req, res);
    } catch (error) {
        res.status(500).json({message: error.message})
    }
};

async function sendVerificationEmail(user, req, res){
    try{
        const token = user.generateVerificationToken();
        await token.save();
        let subject = "Account Verification Token";
        let to = user.email;
        let from = process.env.FROM_EMAIL;
        let link="http://"+req.headers.host+"/auth/verify/"+token.token;
        let html = `<p>Hi ${user.username}<p><br><p>Click on the following <a href="${link}">link</a> to verify your account.</p>`;
        await sendEmail({to, from, subject, html});
        console.log(link);
        res.status(200).json({message: 'verification email gaya hai ' + user.email + ' pe.'});
    }catch (error) {
        res.status(500).json({message: error.message});
    }
}

// exports.tokenCall=()=>{
//     // const { email, password } = req.body;
//     // const user = await User.findOne({ email });
//     // return res.status(200).json({token: user.generateJWT(), user: user});
//     return token;
// }