const mongoose = require("mongoose")
const conditionSchema = new mongoose.Schema({
    Name:{
        type: String,
        required: true
    }
})

module.exports = mongoose.model('Condition', conditionSchema);