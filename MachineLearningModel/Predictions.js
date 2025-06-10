import fs from 'fs';
import * as tf from '@tensorflow/tfjs-node';

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
const getPrediction = async (demographics,conditionNames,symptoms,renalFunction,medications) => {
    try {
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
        return processedResults;
       

        // You can now use the result (predicted class and confidence) as needed
    } catch (error) {
        console.error("Error during prediction:", error);
    }
}

// Example input data (adjust as per your model's input format)


module.exports = {
    getPrediction
}