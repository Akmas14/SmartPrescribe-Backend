import { predictAlternative } from './Predictions.js';

// Example input data (match this with Python inputs)
const exampleDemographics = { age: 75, gender: 'male' };
const exampleConditionNames = ['Syncope'];
const exampleSymptoms = ['Fatigue', 'Dizziness'];
const exampleRenalFunction = 55;
const exampleMedications = ['Desipramine', 'Tolmetin'];

// Run the prediction
predictAlternative(
    exampleDemographics,
    exampleConditionNames,
    exampleSymptoms,
    exampleRenalFunction,
    exampleMedications
).then((predictions) => {
    console.log('Predictions:', predictions);
}).catch((error) => {
    console.error('Error during prediction:', error);
});
// Encode inputs
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
const encoders = JSON.parse(fs.readFileSync('./encoder_mappings.json', 'utf-8'));
const medicationMapping = JSON.parse(fs.readFileSync('./medication_mapping.json', 'utf-8'));

// Create a reverse mapping for medications
const reverseMedicationMapping = Object.fromEntries(
    Object.entries(medicationMapping).map(([key, value]) => [value, key])
);