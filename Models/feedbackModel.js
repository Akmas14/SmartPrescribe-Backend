const mongoose = require('mongoose')
const feedbackSchema = new mongoose.Schema({
    Medication:{
        type:String,
        required:true
    },
    Approved:{
        type:Boolean,
        default:true
    },
    Comment:{
        type:String
    },
    relatedConditions:{
        type:[{
            type:String
        }],
        default:[]
    },
    ReasonOfDisapproval:{
        type:String,
        enum:['Expert opinion','Observational Study','Randomized Clinical trial (RCT)','Systematic review and meta analysis','Guidelines','Other']
    },
    OtherReasons:{
        type:String
    }
})

module.exports = mongoose.model('Feedback',feedbackSchema)