const express = require('express');
const {check} = require('express-validator');
const multer = require('multer');
const User = require('../controllers/user');
const validate = require('../middlewares/validate');
const router = express.Router();
const upload = multer().single('profileImage');

router.get('/', User.index);

router.post('/', [
    check('email').isEmail().withMessage('Enter a valid email address'),
    check('username').not().isEmpty().withMessage('You username is required'),
    check('firstName').not().isEmpty().withMessage('You first name is required'),
    check('lastName').not().isEmpty().withMessage('You last name is required')
], validate, User.store);

router.get('/:id',  User.show);

router.put('/:id', upload, User.update);

router.delete('/:id', User.destroy);

router.put('/:id', User.upgrade);

router.post('/send', User.sendEmail)

router.post('/getall', User.getAllMail)

router.post('/getschedule', User.getAllSchedule)

module.exports = router;