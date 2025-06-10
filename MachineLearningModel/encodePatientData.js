const Patient = require('../Models/updatesModel')
const fs = require('fs');
const medicationMapping = JSON.parse(fs.readFileSync('medication_mapping.json', 'utf-8'));
const conditionMapping = JSON.parse(fs.readFileSync('condition_mapping.json', 'utf-8'));

const encodeMedications = (medications) => medications.map(med => medicationMapping[med] || -1);
const encodeConditions = (conditions) => conditions.map(cond => conditionMapping[cond] || -1);

const fetchPatientData = async () => {
    const patients = await Patient.find({});

    const patientData = patients.map(patient => ({
        patient_id: patient.patient_id,
        demographics: [patient.demographics.age, patient.demographics.gender === "male" ? 1 : 0],
        renal_function: patient.renal_function,
        conditions: encodeConditions(patient.conditions.map(c => c.condition_name)),
        current_medications: encodeMedications(patient.current_medications.map(m => m.medication_name)),
        feedback_sequence: patient.feedback_sequence.map(fb => ({
            severity: fb.symptom_severity,
            adjustments: fb.medication_adjustments.map(adj => medicationMapping[adj.medication_name] || -1)
        }))
    }));

    fs.writeFileSync('encoded_patient_data.json', JSON.stringify(patientData, null, 2), 'utf-8');
    console.log("Encoded patient data saved to encoded_patient_data.json");
};

fetchPatientData();