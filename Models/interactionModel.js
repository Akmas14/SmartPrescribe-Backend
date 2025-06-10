const mongoose = require('mongoose')
const interactionSchema = new mongoose.Schema({
    Drug1:{
        type: String,
        required: true
    },
    Drug2:{
        type: String,
        required: true
    },
    Recommendation:{
        type: String,
        required: true
    },
    PotentialOutcome:{
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

module.exports = mongoose.model('Interaction', interactionSchema);