const mongoose = require('mongoose')
const OTPSchema = new mongoose.Schema({
    Email:{
        type:String
    },
    OTP:{
        type:String
    },
    expiry:{
        type:String
    }
})
module.exports = mongoose.model('OTP2', OTPSchema);