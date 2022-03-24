const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const userShchema = mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
});

userShchema.plugin(uniqueValidator);
module.exports = mongoose.model('User', userShchema);