const mongoose = require("mongoose")
const recommendationSchema = new mongoose.Schema({
    patient: {
     
            type: mongoose.Schema.Types.ObjectId,
            ref: "patient",
            required:true
        
    },
    meds: {
        type: [
            {
              type: mongoose.Schema.Types.ObjectId,
              ref: "medication",
            },
          ],
          default: [],
    },
    ActiveDrug:{
        type:[
            {type:String}
        ],
        default:[]
    },
    conditions:{
        type: [
            {
              type: mongoose.Schema.Types.ObjectId,
              ref: "condition",
            },
          ],
          default: []
    },
    conditionNames:{
        type:[
            {type:String}
        ],
        default:[]
    },
    renalFunction:{
        type: String,
        default: "unknown"
    },
    Avoids:{
        type:[
            {type: String}
        ]
    },
    Caution:{
        type:[
            {type:String}
        ]
    },
    Interactions:{
        type:[
            {type:String}
        ]
    },
    patientReport:{
        type:[String],
        required:true
    },
    physicianReport:{
        type:[String],
        required:true
    }
},
{
    timestamps:true

}
)

module.exports = mongoose.model('recommendation', recommendationSchema);