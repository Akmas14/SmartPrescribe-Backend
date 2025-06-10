import fs from 'fs';
import * as tf from '@tensorflow/tfjs-node';
const User = require('../Models/userModel')
const Patient = require('../Models/patientModel')
const Physician = require('../Models/physicianModel')
const recommendation = require('../Models/recommendationModel')
const Drug = require('../Models/medicationModel')
const Condition = require('../Models/conditionModel')
const bcrypt = require("bcrypt");
const Feedback = require('../Models/feedbackModel')
const Avoid = require('../Models/avoidModel')
const Caution = require('../Models/cautionModel')
const Interaction = require('../Models/interactionModel')
const Renal = require('../Models/renalModel')
const Syndrome = require('../Models/syndromeModel')
const Chart = require('../Models/chartModel')
const Symptoms =require('../Models/symptomModel')
const updates = require('../Models/updatesModel')
const encoders = JSON.parse(fs.readFileSync('./encoder_mappings.json', 'utf-8'));
const medicationMapping = JSON.parse(fs.readFileSync('./medication_mapping.json', 'utf-8'));
/**
 * Normalize numeric values.
 * @param {number} value - The value to normalize.
 * @param {number} max - The maximum value for normalization.
 * @returns {number} - The normalized value.
 */
function normalize(value, max) {
    return value / max;
}
// Create a reverse mapping for medications
const reverseMedicationMapping = Object.fromEntries(
    Object.entries(medicationMapping).map(([key, value]) => [value, key])
);
const calculateAge = (dob) => {
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };
const getPrediction = async (req,res) => {
    try {
        const id = req.params.id
        const user = await User.findOne({_id:id})
        const patient = await Patient.findOne({user:id})
        const Prescription = patient.Prescription
        const conditions = patient.Conditions
        const symptoms = patient.Symptoms
        const demographics = {
            gender:user.Gender,
            age:calculateAge(user.DateOfBirth)
        }
        const conds = await Condition.find({_id:conditions})
        const conditionNames = []
        for(let i =0;i<conditions.length;i++){
            conditionNames.push(conds[i].Name)
        }
        const meds = await Drug.find({_id:Prescription})
        const medications = []
        for(let i =0;i<conditions.length;i++){
            medications.push(meds[i].Name)
        }
        const renalFunction = patient.renalFunction
        const genderEncoded = encoders.gender[demographics.gender];
console.log("Encoded Gender:", genderEncoded);

const conditionsEncoded = conditionNames.map((name) => encoders.condition_name[name]);
console.log("Encoded Conditions:", conditionsEncoded);

const symptomsEncoded = symptoms.map((name) => encoders.symptom_name[name]);
console.log("Encoded Symptoms:", symptomsEncoded);

const medicationsEncoded = medications.map((name) => medicationMapping[name]);
console.log("Encoded Medications:", medicationsEncoded);

// Normalize continuous inputs
const ageNormalized = normalize(demographics.age, 100); // Assuming max age is 100
const renalFunctionNormalized = normalize(renalFunction, 100); // Assuming max renal function is 100
console.log("Normalized Age:", ageNormalized);
console.log("Normalized Renal Function:", renalFunctionNormalized);

// Prepare input vectors
const inputVectors = [];
medicationsEncoded.forEach((med) => {
    conditionsEncoded.forEach((condition) => {
        symptomsEncoded.forEach((symptom) => {
            inputVectors.push([
                ageNormalized,
                genderEncoded,
                renalFunctionNormalized,
                condition,
                1, // condition_severity
                symptom,
                1, // symptom_severity
                med
            ]);
        });
    });
});

        // Send a POST request to the Flask API
        const response = await fetch('http://127.0.0.1:5000/predict', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ inputs: inputVectors })  // Send the input data as JSON
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }

        // Parse the response from the Flask API
        const result = await response.json();
        const predictionData = result 
        console.log("Prediction Result:", result);
        const processedResults = result.map((entry) => ({
            ...entry,
            suggested_medication_name: reverseMedicationMapping[entry.suggested_medication],
        }));

        console.log('Processed Results:', processedResults);
        return res.status(200).json(processedResults);
       

        // You can now use the result (predicted class and confidence) as needed
    } catch (error) {
        console.error("Error during prediction:", error);
        return res.status(500).json({message:error.message});
    }
}

// Example input data (adjust as per your model's input format)


module.exports = {
    getPrediction
}