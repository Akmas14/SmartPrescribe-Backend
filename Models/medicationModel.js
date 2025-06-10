const mongoose = require("mongoose")
const medicationSchema = new mongoose.Schema({
    Medication: {
        type: String,
        required: true
    },
    Comments: {
        type: String,
        required: true
    },
    Related_Condition:{
        type:String
    },
    Renal_Function:{
        type:String
    },
    Drug_Class:{
        type:String
    },
    Rationale:{
        type:String,
        default:'Rationale not available for this drug'
    }

})

module.exports = mongoose.model('Medication', medicationSchema);

