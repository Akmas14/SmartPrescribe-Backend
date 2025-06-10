// models/Patient.js
const mongoose = require('mongoose');

const updateSchema = new mongoose.Schema({
    patient_id:  {
     
        // type: mongoose.Schema.Types.ObjectId,
        // ref: "patient",
        type:String
},
    demographics: {
        age: { type: Number, required: true },
        gender: { type: String, required: true },
    },
    renal_function: { type: Number,  },
    conditions: [
        { condition_name: { type: String, required: true }, severity: { type: Number } }
    ],
    current_medications: [
        { medication_name: { type: String, required: true }, loweredDosage: { type: Boolean }, }
    ],
    symptoms: [
        {name: {type:String}, severity: {type: Number}}
    ],
    // feedback_sequence: [
    //     {
    //         timestamp: { type: Date, default: Date.now },
    //         symptom_severity: { type: Number }, // 0 for none 1 for mild 2 for severe
    //         side_effects: [{ type: String }],
    //         medication_adjustments: [{ 
    //             medication_name: { type: String, required: true }, 
    //             adjustment_type: { type: String } // dose reduced medication switched etc.
    //         }]
    //     }
    // ],
},
{
    timestamps:true

}
);

module.exports = mongoose.model('Updates', updateSchema);
