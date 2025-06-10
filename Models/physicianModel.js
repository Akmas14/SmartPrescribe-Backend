const mongoose = require("mongoose")
const physicianSchema = new mongoose.Schema({
    patients:{
        type: [
            {
              type: mongoose.Schema.Types.ObjectId,
              ref: "patient",
            },
          ],
          default: [],
          required: false
    },
    User: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        
    }
})

module.exports = mongoose.model('Physician', physicianSchema);