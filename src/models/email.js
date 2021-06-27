const mongoose = require('mongoose');

const EmailSchema = new mongoose.Schema({
    from: {
        type: String,
        required: 'From email is required',
        trim: true
    },
    to: {
        type: String,
        required: 'To email is required',
        trim: true
    },
    subject: {
        type: String,
        required: 'Subject is required',
        max: 100
    },
    text: {
        type: String,
        required: 'Mail Body is required',
        max: 200
    },
    type: {
        type: String,
        required: 'Mail Body is required',
        max: 200
    },
    selectedDate: {
        type: String,
        required: 'Mail Body is required',
        max: 200
    }
}, {timestamps: true})

module.exports = mongoose.model('Emails', EmailSchema);