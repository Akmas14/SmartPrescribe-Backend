//const mongoose = require('mongoose');
const Medication = require('../Models/medicationModel');
const Patient = require('../Models/updatesModel')
const Conditions = require('../Models/conditionModel')
const Symptoms = require('../Models/symptomModel')
const fs = require('fs');

const createMedicationMapping = async () => {
    const medications = await Medication.find({});

    const medicationMapping = {};
    medications.forEach((med, index) => {
        medicationMapping[med.Medication] = index;
    });
    const conditions = await Conditions.find({})
    const conditionMapping = {};
    conditions.forEach((cond, index) => {
        conditionMapping[cond.Name] = index;
    });
    fs.writeFileSync('medication_mapping.json', JSON.stringify(medicationMapping, null, 2), 'utf-8');
    fs.writeFileSync('condition_mapping.json', JSON.stringify(conditionMapping, null, 2), 'utf-8');

    console.log("Medication mapping saved to medication_mapping.json");
    
};

createMedicationMapping();
