const User = require('../models/user');
const Email = require('../models/email')
const {uploader, sendEmail} = require('../utils/emailAndStorage');
const bcrypt = require('bcrypt');
let cron = require('node-cron');
let nodemailer = require('nodemailer');

exports.index = async function (req, res) {
    const users = await User.find({});
    res.status(200).json({users});
};

exports.sendEmail = async function (req, res) {
  
    // e-mail message options
    let mailOptions = {
          from: req.user.email,
          to: req.body.to,
          cc: req.body.cc,
          subject: req.body.subject,
          text: req.body.text,
          type: req.body.type,
          selectedDate: req.body.selectedDate
     };
  
    // e-mail transport configuration
    let transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: req.user.email,
            pass: req.body.password
          }
      });
    const types = req.body.type
    // const c = req.body.c
    console.log("Date Fetched",req.body.selectedDate)
    // const str = req.body.selectedData
    var str = "* * * * *";
    var strdt = req.body.selectedDatar.split(" ");
    var strtime = strdt[4].split(":");
    //Mon Aug 18 2014 21:11:54 GMT+0530 (India Standard Time)
    // cron.schedule('*/30 * * * * *', () => {
    cron.schedule('*/'+c+' * * * *', () => {
    // Send e-mail
    transporter.sendMail(mailOptions, function(error, info){
          if (error) {
            console.log(error);
          } else {
            console.log('Email sent: ' + info.response);
            let {mailop} = mailOptions
            const newMail = new Email(mailOptions);
            newMail.save();
          }
      });
    });
  
}

exports.getAllMail = async function (req, res) {
    try {
        const email = req.user.email;
        const emails = await Email.find({from: email});
        if (!emails) 
            return res.status(401).json({message: 'No mails'});
        res.status(200).json({emails});
        console.log(emails)
    } catch (error) {
        res.status(500).json({message: error.message})
    }
}

exports.getAllSchedule = async function (req, res) {
    try {
        const email = req.user.email;
        var emailList=[];
        const emails = await Email.find({from: email,type:{$not: {$eq: "None"}}});
        // emails.forEach(email => {
        //         if(email.type!="none")
        //             emailList.push(email);
        // });
        if (!emailList) 
            return res.status(401).json({message: 'No mails'});
        res.status(200).json({emailList});
        console.log(emailList)
    } catch (error) {
        res.status(500).json({message: error.message})
    }
}

exports.store = async (req, res) => {
    try {
        const {email} = req.body;
        const user = await User.findOne({email});
        if (user) 
            return res.status(401).json({message: 'The email address you have entered is already associated with another account. You can change this users role instead.'});
        const password = '_' + Math.random().toString(36).substr(2, 9); 
        const newUser = new User({...req.body, password});
        const user_ = await newUser.save();
        user_.generatePasswordReset();
        await user_.save();
        let domain = "http://" + req.headers.host;
        let subject = "New Account Created";
        let to = user.email;
        let from = process.env.FROM_EMAIL;
        let link = "http://" + req.headers.host + "/api/auth/reset/" + user.resetPasswordToken;
        let html = `<p>Hi ${user.username}<p><br><p>A new account has been created for you on ${domain}. Please click on the following <a href="${link}">link</a> to set your password and login.</p> 
                  <br><p>If you did not request this, please ignore this email.</p>`
        await sendEmail({to, from, subject, html});
        res.status(200).json({message: 'An email has been sent to ' + user.email + '.'});
    } catch (error) {
        res.status(500).json({success: false, message: error.message})
    }
};

exports.show = async function (req, res) {
    try {
        const id = req.params.id;
        const user = await User.findById(id);
        if (!user) 
            return res.status(401).json({message: 'User does not exist'});
        res.status(200).json({user});
    } catch (error) {
        res.status(500).json({message: error.message})
    }
};

exports.update = async function (req, res) {
    try {
        
        const update = req.body;
        const id = req.user._id;
        var abc = ""
        bcrypt.genSalt(10, function(err, salt) {
            if (err) return next(err);
            console.log(req.body.password)
            bcrypt.hash(req.body.password, salt, function(err, hash) {
                if (err) return next(err);
                console.log(hash)
                var abc = hash;
                console.log(abc)
            });
        });
        const user = await User.findByIdAndUpdate(id, {$set: update}, {new: true});
        const user1 = await User.findByIdAndUpdate(id, {$set: update}, {$set: {password: abc}}, {new: true});
        if (!req.file) 
            return res.status(200).json({user, message: 'User has been updated'});
        const result = await uploader(req);
        const user_ = await User.findByIdAndUpdate(id, {$set: update}, {$set: {profileImage: result.url}}, {new: true});

        if (!req.file)
            return res.status(200).json({user: user_, message: 'User has been updated'});
    } catch (error) {
        res.status(500).json({message: error.message});
    }
};

exports.destroy = async function (req, res) {
    try {
        const id = req.params.id;
        const user_id = req.user._id;
        if (user_id.toString() !== id.toString()) 
            return res.status(401).json({message: "No permission to delete this data."});
        await User.findByIdAndDelete(id);
        res.status(200).json({message: 'User has been deleted'});
    } catch (error) {
        res.status(500).json({message: error.message});
    }
};

exports.upgrade = async function (req, res) {
    try {
        const id = req.params.id;
        const user_ = await User.findById(id) 
        if (!user_) 
            return res.status(401).json({message: 'User does not exist'});
        user_.role = 'enterprise'
        await user_.save();

        res.status(200).json({user: user_, message: 'Upgraded to Enteprise'});
    }
    catch (error) {
        res.status(500).json({message: error.message});
    }
}