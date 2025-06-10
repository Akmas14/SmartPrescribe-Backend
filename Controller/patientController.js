const User = require('../Models/userModel')
const Patient = require('../Models/patientModel')
const Physician = require('../Models/physicianModel')
const recommendation = require('../Models/recommendationModel')
const Drug = require('../Models/medicationModel')
const Condition = require('../Models/conditionModel')
const bcrypt = require("bcrypt");
const Avoid = require('../Models/avoidModel')
const Caution = require('../Models/cautionModel')
const Interaction = require('../Models/interactionModel')
const Renal = require('../Models/renalModel')
const Syndrome = require('../Models/syndromeModel')
const Symptoms = require('../Models/symptomModel')

const addDrug = async(req,res)=>{
    try{
    const drug = req.body.drug
    const id = req.userId
    const checkDrug = await Drug.findOne({Medication:drug})
    const patient = await Patient.findOne({user:id})
    if(!checkDrug){
        const newDrug = new Drug({
            Medication:drug,
            Comments:"Safe according to beers criteria",
            Drug_Class:'Unknown'
        })
        await newDrug.save()
        const Prescription = patient.Prescription.push(newDrug._id)
        const updatedPatient = await Patient.findOneAndUpdate({user:id},{Prescription:patient.Prescription})
        return res.status(200).json(updatedPatient)    
    }
    if(patient.Prescription.includes(checkDrug._id)){
        return res
          .status(500)
          .json({ message: "drug already in the list" });
    }
    
    const Prescription = patient.Prescription.push(checkDrug._id)
    const updatedPatient = await Patient.findOneAndUpdate({user:id},{Prescription:patient.Prescription})
    return res.status(200).json(updatedPatient)    

}
    catch(err){
        return res.status(500).json({message: err.message})
    }
}
const addCondition = async(req,res)=>{
    try{const condition = req.body.condition
    const id = req.userId
    const checkCondition = await Condition.findById(condition)
    if(!checkCondition){
        return res
          .status(404)
          .json({ message: "No such condition exists in our system" });
    }
    const patient = await Patient.findOne({user:id})
    const Conditions = patient.Conditions
    if(Conditions.includes(condition)){
        return res
          .status(500)
          .json({ message: "condition already in the list" });
    }
    patient.Conditions.push(condition)
    const updatedPatient = await Patient.findOneAndUpdate({user:id},{Conditions:patient.Conditions})
    return res.status(200).json(updatedPatient)    
}
    catch(err){
        return res.status(500).json({message: err.message})
    }
}

const getDrugList = async(req,res)=>{
    try{
        const id = req.userId
        const patient = await Patient.findOne({user:id})
        const drugs = patient.Prescription
        const details = await Drug.find({_id:drugs})
        return res.status(200).json(details)
    }
    catch(err){
        return res.status(500).json({message: err.message})
    }
}

const getConditions = async(req, res)=>{
    try{
        const id = req.userId
        const patient = await Patient.findOne({user:id})
        const conditions = patient.Conditions
        const details = await Condition.find({_id:conditions})
        return res.status(200).json(details)
    }
    catch(err){
        return res.status(500).json({message: err.message})
    }
}
const removeDrug = async(req, res)=>{
    try{
        const drug = req.body.drug
        const id = req.userId
        const patient = await Patient.findOne({user:id})
        const Prescription = patient.Prescription
        const updatedPrescription = patient.Prescription.filter((target)=> target != drug)
        const updatedPatient = await Patient.findOneAndUpdate({user:id},{Prescription:updatedPrescription})
        return res.status(200).json(updatedPatient)
    }
    catch(err){
        return res.status(500).json({message: err.message})

    }
}

const removeCondition = async(req, res)=>{
    try{
        const cond = req.body.cond
        const id = req.userId
        const patient = await Patient.findOne({user:id})
        const Conditions = patient.Conditions
        const updatedConditions = patient.Conditions.filter((target)=> target != cond)
        const updatedPatient = await Patient.findOneAndUpdate({user:id},{Conditions:updatedConditions})
        return res.status(200).json(updatedPatient)
    }
    catch(err){
        return res.status(500).json({message: err.message})

    }
}

const getReccomendationsByPatient = async(req,res) =>{
    try{
        const id = req.userId
        const patient = await Patient.find({user:id})
        const recommendations = await recommendation.find({patient:patient})
        return res.status(200).json(recommendations)
    }
    catch(err){
        return res.status(500).json({message: err.message})
    }
}

const getReccomendationById = async(req,res) =>{
    try{
        const id = req.userId
        const patient = await Patient.findOne({user:id})
        const rec = await recommendation.findById(req.params.id)
        if(rec.patient.equals(patient._id)){
             return res.status(200).json(rec)
        }
        return res.status(500).json({message:'not your recommendation cant access it'})

    }
    catch(err){
        return res.status(500).json({message: err.message})
    }
}
const getRenalFunction = async(req,res) =>{
    try{
        const id = req.userId
        const patient = await Patient.findOne({user:id})
        if(patient.renalFunction=== -1){
            return res.status(200).json({message:"unknown"})
        }
        console.log(patient.renalFunction)
        return res.status(200).json(patient.renalFunction)
    }
    catch(e){
        return res.status(500).json({message:e.message})
    }
}
const updateRenalFunction = async(req,res) =>{
    try{
        const id = req.userId
        console.log("zz")
        const {ren} = req.body
        console.log("zz")
        const patient = await Patient.find({user:id})
        console.log(ren)
        if(ren<=0){
            return res.status(500).json({message:"renal function cannot be less than 0"})
        }
        // patient.renalFunction = ren
        // await patient.save()
        const updatedPatient = await Patient.findOneAndUpdate({user:id},{renalFunction:ren})
        console.log(updatedPatient)
        return res.status(200).json(updatedPatient)
    }
    catch(e){
        return res.status(500).json({message:e.message})

    }
}
const generateRecommendation = async(req,res) =>{
    try{
        const id = req.userId
        const patient = await Patient.findOne({user:id})
        const drugs = patient.Prescription
        const conds = patient.Conditions
        const ren = patient.renalFunction
        let patientRep =["Based on the information you have entered here is your recommendation: "]
        let physRep = ["Based on the ags beers criteria here are the concerns: "]
        const details = await Drug.find({_id:drugs})
        console.log(details.Medication)
        const conditions = await Condition.find({_id:conds})
        // for(var i = 0;i<details.length;i++){
        //     console.log(111)

        //     if(details[i].Comments.includes('Avoid')){
        //         let tmp = `\n${details[i].Medication}: contains some concern please contact your local pharmacist/ primary care physician(Doctor) before taking any action`
        //         let tmp2 = `\n${details[i].Medication}: ${details[i].Comments}`
        //         console.log(details[i])
        //         patientRep = patientRep+tmp
        //         physRep = physRep + tmp2
                
        //     }
        //     else{                
        //         let tmp2 = `\n${details[i].Medication}: ${details[i].Comments}`
        //         patientRep = patientRep+tmp2
        //         physRep = physRep + tmp2
        //     }
        // }
        
        let meds =[]
        // for(let i =0;i<details.length;i++){
        //     meds.push(details[i].Medication)
        // }
        let condList = []
        for(let i =0;i<conditions.length;i++){
            condList.push(conditions[i].Name)
        }
        const avoidTable = await Avoid.find()
        const cautionTable = await Caution.find()
        const interactionTable = await Interaction.find()
        const renalTable = await Renal.find()
        const syndromeTable = await Syndrome.find()
        let avoidList = []
        let cautionList = []
        let interactionList = []
        for (var i = 0; i<details.length; i++){
            for(var j = 0; j<avoidTable.length; j++){
                if(avoidTable[j].Medication.toLowerCase().includes(details[i].Medication.toLowerCase())){
                    avoidTable[j].Medication = details[i].Medication
                    avoidList.push(avoidTable[j])
                    meds.push(details[i].Medication)
                }
                console.log("test 1")

            }
            for(var j = 0; j<cautionTable.length;j++){
                if(cautionTable[j].Medication.toLowerCase().includes(details[i].Medication.toLowerCase())){
                    cautionTable[j].Medication = details[i].Medication
                    cautionList.push(cautionTable[j])
                    meds.push(details[i].Medication)

                }
                console.log("test 2")

            }
            for(var j = 0; j<syndromeTable.length; j++){
               let lower;
               console.log("howa hena?")
                for(var z = 0; z<conds.length;z++)
                lower = conditions[z].Name.toLowerCase()
            console.log("garab hena")
                let flag = lower.toLowerCase().includes(syndromeTable[j].Condition.toLowerCase())
                let flag1 = syndromeTable[j].Medication.toLowerCase().includes(details[i].Medication.toLowerCase())||
                syndromeTable[j].Medication.toLowerCase().includes(details[i].Drug_Class.toLowerCase())
                console.log("test 3")
                if(flag1&& flag){
                    syndromeTable[j].Medication = details[i].Medication
                    avoidList.push(syndromeTable[j])
                    meds.push(details[i].Medication)

                }
            }
            for(var j = 0; j<renalTable.length;j++){
                if(renalTable[j].Medication.toLowerCase().includes(details[i].Medication.toLowerCase())){
                    renalTable[j].Medication= details[i].Medication
                    if(renalTable[j].Recommendation.toLowerCase().includes('avoid')){
                    avoidList.push(renalTable[j])
                    meds.push(details[i].Medication)

                }
                    else{
                    cautionList.push(renalTable[j])
                    meds.push(details[i].Medication)

                }
                console.log("test 4")

                }
            }
            for(var j = 0; j<interactionTable.length;j++){
                if(interactionTable[j].Drug1.toLowerCase().includes(details[i].Medication.toLowerCase()) ||
                interactionTable[j].Drug1.toLowerCase().includes(details[i].Drug_Class.toLowerCase()) 
            ){
                for(var k = i; k<details.length;k++){
                    if(interactionTable[j].Drug2.toLowerCase().includes(details[k].Medication.toLowerCase()) ||
                interactionTable[j].Drug2.toLowerCase().includes(details[k].Drug_Class.toLowerCase()) 
            ){
                interactionTable[j].Drug1 = details[i].Medication
                interactionTable[j].Drug2 = details[k].Medication
                interactionList.push(interactionTable[j])
                meds.push(details[i].Medication)
                meds.push(details[k].Medication)
            }
                }
                }
                if(interactionTable[j].Drug2.toLowerCase().includes(details[i].Medication.toLowerCase()) ||
                interactionTable[j].Drug2.toLowerCase().includes(details[i].Drug_Class.toLowerCase()) 
            ){
                for(var k = i; k<details.length;k++){
                    if(interactionTable[j].Drug1.toLowerCase().includes(details[k].Medication.toLowerCase()) ||
                interactionTable[j].Drug1.toLowerCase().includes(details[k].Drug_Class.toLowerCase()) 
            ){
                interactionTable[j].Drug2 = details[i].Medication
                interactionTable[j].Drug1 = details[k].Medication
                interactionList.push(interactionTable[j])
                meds.push(details[i].Medication)
                meds.push(details[k].Medication)
            }
                }
                }
                console.log("test 5")

            }
            if(!meds.includes(details[i].Medication)){
                console.log('test')
                if(details[i].Comments.toLowerCase().includes('avoid')){
                    details[i].Rationale = 'rationale not available for this drug'
                    details[i].Recommendation = details[i].Comments
                    avoidList.push(details[i])
                }
                else{
                    details[i].Rationale = 'rationale not available for this drug'
                    details[i].Recommendation = details[i].Comments
                    cautionList.push(details[i])
                    
                }
                meds.push(details[i].Medication)
                console.log("test 6")

            }

        }
        patientRep.push("The following drugs contains some concern please contact your local pharmacist/ primary care physician(Doctor) before taking any action:")
        console.log(avoidList)
        for(var i =0; i<avoidList.length;i++){
        patientRep.push(` ${avoidList[i].Medication},`)
        physRep.push(`\n ${avoidList[i].Medication}: ${avoidList[i].Recommendation} \n Rationale: ${avoidList[i].Rationale}`)
    }
    for(var i =0; i<cautionList.length;i++){
        patientRep.push(`\n ${cautionList[i].Medication}: ${cautionList[i].Recommendation}`)
        physRep.push(`\n ${cautionList[i].Medication}: ${cautionList[i].Recommendation} \n Rationale: ${cautionList[i].Rationale}`)
    }
    physRep.push(`\n The following are some interactions with some concern: `)
    for(var i =0; i<interactionList.length;i++){
        physRep.push(`\n ${interactionList[i].Drug1} + ${interactionList[i].Drug2}: ${interactionList[i].Recommendation} \n Rationale: ${interactionList[i].PotentialOutcome}`)
    }
        patientRep.push(`Give your physician the following code to add you if they havent already: ${patient.givenId}`)
        const ref = "Reference: https://pubmed.ncbi.nlm.nih.gov/37139824/"
        physRep.push(ref)
        const rec = new recommendation({
            patient:patient,
            meds:details,
            ActiveDrug:meds,
            conditions:conds,
            conditionNames:condList,
            renalFunction:ren,
            Avoids:avoidList,
            Caution:cautionList,
            Interactions:interactionList,
            patientReport:patientRep,
            physicianReport:physRep
        })        
        
        await rec.save()
        return res.status(200).json(rec)
    }
    catch(e){
        return res.status(500).json({message:e.message})
    }
}

const updatePassword = async(req,res) =>{
    try{
        const {old , newPass,confirm} = req.body
        const id = req.userId
        let user = await User.findById(id)
        const match = await bcrypt.compare(user.Password, old)
        if(!newPass || !confirm){
            return res.status(500).json({message:"all fields must be filled"})

        }
        if(match){
            if(newPass===confirm){
                const hashedPassword = await bcrypt.hash(newPass,10)
                user = await User.findByIdAndDelete({id},{Password:hashedPassword})
                return res.status(200).json(user)
            }
            return res.status(500).json({message:"new password doesnt match confirm password"})
        }
        return res.status(500).jsom({message:"old password is incorrect please try again"})
    }
    catch(e){
        return res.status(500).jsom({message:e.message})
    }
}

const meds =  async (req, res) => {
    try {
      const medications = await Drug.find(); // Fetch all medications
      res.json(medications);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  const getAllConditions = async (req, res) => {
    try {
      const conditions = await Condition.find(); // Fetch all conditions from the DB
      res.status(200).json(conditions); // Return conditions as JSON
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }; 

const getGivenId = async(req,res) =>{
    try{
        const id = req.userId
        const patient = await Patient.findOne({user:id})
        const givenId = patient.givenId
        return res.status(200).json(givenId)
    }
    catch(e){
        return res.status(500).json({message:e.message})
    }
}
const addSymptom = async(req,res) =>{
    try{
    const id = req.userId
    const {symptom} = req.body
    const patient = await Patient.findOne({user:id})
    let symptoms;
        const flag = await Symptoms.findOne({Name:symptom})
        
        
        if(!flag){
            const newSymptom = new Symptoms({
                Name:symptom
            })
            await newSymptom.save()
            symptoms = patient.Symptoms.push(symptom)

        }
        else{
            symptoms=patient.Symptoms.push(flag.Name)
        }
    const updatedPatient = await Patient.findOneAndUpdate({user:id},{Symptoms:patient.Symptoms})
    return res.status(200).json(updatedPatient)  
}
    catch(e){
    return res.status(500).json({message:e.message})
    }
}
const removeSymptom = async (req,res) => {
    try{
        const id = req.userId
        const {symptom} = req.body
        const patient = await Patient.findOne({user:id})
        const symptoms = patient.Symptoms.filter((symp)=> symp!= symptom)
        const updatedPatient = await Patient.findOneAndUpdate({user:id},{Symptoms:symptoms})
        return res.status(200).json(updatedPatient)
    }
        catch(e){
        return res.status(500).json({message:e.message})
        }
}
const getSymptoms = async (req,res) => {
    try{
        const id = req.userId
        const patient = await Patient.findOne({user:id})
        const symptoms = await Symptoms.find({Name:patient.Symptoms})
        return res.status(200).json(symptoms)           
    }
        catch(e){
        return res.status(500).json({message:e.message})
        }
}
const getAllSymptoms = async (req,res) => {
    try{
        const symptoms = await Symptoms.find()
        return res.status(200).json(symptoms)
    }
    catch(e){
        return res.status(500).json({message:e.message})
    }
}
module.exports={
    addDrug,
    addCondition,
    removeDrug,
    getDrugList,
    generateRecommendation,
    getRenalFunction,
    updateRenalFunction,
    getReccomendationById,getReccomendationsByPatient,
    removeCondition,
    getConditions,
    updatePassword,
    meds,
    getAllConditions,
    getGivenId,
    addSymptom,
    removeSymptom,
    getSymptoms,
    getAllSymptoms
}