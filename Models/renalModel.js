const mongoose = require('mongoose')
const renalSchema = new mongoose.Schema({
    Medication:{
        type: String,
        required: true
    },
    RenalThreshold:{
        type: String,
        required: true
    },
    Recommendation:{
        type: String,
        required: true
    },
    Rationale:{
        type: String,
        required: true
    },
    QualityofEvidence:{
        type: String,
        required: true
    },
    StrengthofRecommendation:{
        type: String,
        required: true
    }
})

module.exports = mongoose.model('Renal', renalSchema);