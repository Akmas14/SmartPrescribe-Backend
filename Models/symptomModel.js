const mongoose = require("mongoose")
const symptomSchema = new mongoose.Schema({
    Name:{
        type: String,
        required: true
    }
})

module.exports = mongoose.model('Symptom', symptomSchema);