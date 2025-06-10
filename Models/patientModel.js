const mongoose = require("mongoose");

// Function to generate a short, user-friendly unique ID
const genId = () => {
  // Generate a short random string + last 5 digits of the current timestamp
  const randomString = Math.random().toString(36).substring(2, 6); // Generates a 4-character random string
  const timestamp = Date.now().toString().slice(-5); // Use last 5 digits of the timestamp
  return `PAT-${randomString}${timestamp}`; // Concatenate random string and timestamp
};

const patientSchema = new mongoose.Schema({
  Prescription: {
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "medication",
      },
    ],
    default: [],
  },
  Conditions: {
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "condition",
      },
    ],
    default: [],
  },
  Symptoms: {
    type: [{
        type: String,
    }
    ],
    default: [],
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  renalFunction: {
    type: Number,
    default: -1,
    required: true,
  },
  givenId: {
    type: String,
    unique: true, // Ensure it's unique
    //required: true,
  },
});

// Use a pre-save hook to generate the unique, user-friendly ID
patientSchema.pre("save", function (next) {
  if (!this.givenId) {
    this.givenId = genId(); // Set the custom ID if not already set
  }
  next();
});

module.exports = mongoose.model("patient", patientSchema);
