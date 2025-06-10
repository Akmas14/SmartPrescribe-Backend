const express = require("express");
const router = express.Router();
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
//const getPrediction = require('../MachineLearningModel/Predictions')
//const getPrediction = require('../MachineLearningModel/')
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
const addPatient = async (req,res)=>{
    try{
        const id  = req.userId
        console.log(id)
        const patientID = req.body.id
        //const user1 = await User.findOne({Email: Email})
        if(!patientID){
            return res
          .status(404)
          .json({ message: "please enter the patient id" });
        }
        //console.log(user1[0])
        const patient = await Patient.findOne({givenId:patientID})
        const phys = await Physician.findOne({User:id}).select("User patients")
        if(phys.patients.includes(patient._id)){
            return res.status(500).json({message:"patient already in list"})
        }
        //console.log(phys[patients])
        console.log(patient._id)
        const pat = patient._id
        const updatedPatients=phys.patients.push(pat)
        console.log("zzz")
        console.log(updatedPatients)
        console.log(phys.patients)

        const updatedPhysician = await Physician.findOneAndUpdate({User:id},{patients:phys.patients})
        console.log()

        return res.status(200).json(phys.patients)
    }
    catch(err){
        return res.status(500).json({message:err.message})
    }
}

const CreatePatientProfile = async (req,res) => {
    try{
        const {FullName,Email,Gender,PhoneNumber,DateOfBirth} = req.body
        const role = 'Patient'
        const id  = req.userId
        const Password = ""
        const age = calculateAge(DateOfBirth)
        const hashedPassword = await bcrypt.hash(Password, 10);
        console.log(req.body)
        console.log('test')
        const newUser = new User ({
            FullName: FullName,
            Email:Email,
            Password:hashedPassword,
            Role:role,
            Gender:Gender,
            PhoneNumber:PhoneNumber,
            Age:age,
            DateOfBirth:DateOfBirth
        })
        await newUser.save()
        const newPatient = new Patient({
            user:newUser.id
        })

        await newPatient.save()

        const phys = await Physician.findOne({User:id}).select("User patients")
        const updatedPatients=phys.patients.push(newPatient._id)
        const updatedPhysician = await Physician.findOneAndUpdate({User:id},{patients:phys.patients})

        res.status(200).json(updatedPhysician)
    }
    catch(err){
        res.status(500).json({message: err.message})
    }
}
const addDrug = async(req,res)=>{
    try{
    const drug = req.body.drug
    const id = req.params.id
    const doc = req.userId
    const physician = await Physician.findOne({User:doc})
    const patient = await Patient.findOne({user:id})
    console.log(patient)
    console.log(id)
    console.log(physician)
    if(physician.patients.includes(patient._id)){
    const checkDrug = await Drug.findOne({Medication:drug})
    console.log(checkDrug)
    if(!checkDrug){
        const newDrug = new Drug({
            Medication:drug,
            Comments:"Safe according to beers criteria",
            Drug_Class:'Unknown'
        })
        await newDrug.save()
        const Prescription = patient.Prescription.push(newDrug._id)
        console.log(patient.Prescription)
        console.log(newDrug._id)
        const updatedPatient = await Patient.findOneAndUpdate({user:id},{Prescription:patient.Prescription})
        return res.status(200).json(updatedPatient) 
    }
    if(patient.Prescription.includes(checkDrug._id)){
        return res
          .status(500)
          .json({ message: "drug already in the list" });
    }
    
    //const patient = await Patient.findOne({user:id})
    
    const Prescription = patient.Prescription.push(checkDrug._id)
    const updatedPatient = await Patient.findOneAndUpdate({user:id},{Prescription:patient.Prescription})
    return res.status(200).json(updatedPatient)    
    }
    return res.status(500).json({message:"not your patient cannot access"})
}
    catch(err){
        return res.status(500).json({message: err.message})
    }
}

const addCondition = async(req,res)=>{
    try{const condition = req.body.condition
    const id = req.params.id
    const doc = req.userId
    const physician = await Physician.findOne({User:doc})
    const patient = await Patient.findOne({user:id})
    if(physician.patients.includes(patient._id)){
    const checkCondition = await Condition.findById(condition)
    if(!checkCondition){
        return res
          .status(404)
          .json({ message: "No such condition exists in our system" });
    }
    //const patient = await Patient.findOne({user:id})
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
return res.status(500).json({message:"not your patient cannot access"})

}
    catch(err){
        return res.status(500).json({message: err.message})
    }
}

const getDrugList = async(req,res)=>{
    try{
        const id = req.params.id
        const doc = req.userId
        const physician = await Physician.findOne({User:doc})
        const patient = await Patient.findOne({user:id})
        console.log("patient drug list"+patient)
        if(physician.patients.includes(patient._id)){        
        //const patient = await Patient.findOne({user:id})
        console.log("test")
        const drugs = patient.Prescription
        const details = await Drug.find({_id:drugs})
        console.log("test"+details)

        return res.status(200).json(details)
        }
        return res.status(500).json({message:"not your patient cannot access"})

        }
    catch(err){
        return res.status(500).json({message: err.message})
    }
}

const getConditions = async(req, res)=>{
    try{
        const id = req.params.id
        const doc = req.userId
        const physician = await Physician.findOne({User:doc})
        const patient = await Patient.findOne({user:id})
        if(physician.patients.includes(patient._id)){        
            //const patient = await Patient.findOne({user:id})
        const conditions = patient.Conditions
        const details = await Condition.find({_id:conditions})
        return res.status(200).json(details)
    }
    return res.status(500).json({message:"not your patient cannot access"})

}
    catch(err){
        return res.status(500).json({message: err.message})
    }
}

const removeDrug = async(req, res)=>{
    try{
        const drug = req.body.drug
        const id = req.params.id
        const doc = req.userId
        const physician = await Physician.findOne({User:doc})
        const patient = await Patient.findOne({user:id})
        if(physician.patients.includes(patient._id)){        
            //const patient = await Patient.findOne({user:id})
        const Prescription = patient.Prescription
        const updatedPrescription = patient.Prescription.filter((target)=> target != drug)
        const updatedPatient = await Patient.findOneAndUpdate({user:id},{Prescription:updatedPrescription})
        return res.status(200).json(updatedPatient)
    }
    return res.status(500).json({message:"not your patient cannot access"})

}
    catch(err){
        return res.status(500).json({message: err.message})

    }
}

const removeCondition = async(req, res)=>{
    try{
        const cond = req.body.cond
        const id = req.params.id
        const doc = req.userId
        const physician = await Physician.findOne({User:doc})
        const patient = await Patient.findOne({user:id})
        if(physician.patients.includes(patient._id)){        
            //const patient = await Patient.findOne({user:id})
        const Conditions = patient.Conditions
        const updatedConditions = patient.Conditions.filter((target)=> target != cond)
        const updatedPatient = await Patient.findOneAndUpdate({user:id},{Conditions:updatedConditions})
        return res.status(200).json(updatedPatient)
    }
    return res.status(500).json({message:"not your patient cannot access"})

}
    catch(err){
        return res.status(500).json({message: err.message})

    }
}

const getReccomendationsByPatient = async(req,res) =>{
    try{
        const id = req.params.id
        const doc = req.userId
        const physician = await Physician.findOne({User:doc})
        console.log(physician.patients)
        const patient = await Patient.findOne({user:id})
        if(physician.patients.includes(patient._id)){
        //const patient = await Patient.find({user:id})
        const recommendations = await recommendation.find({patient:patient._id})
        return res.status(200).json(recommendations)
    }
    return res.status(500).json({message:"not your patient cannot access"})

}
    catch(err){
        return res.status(500).json({message: err.message})
    }
}

const getReccomendationById = async(req,res) =>{
    try{
        const id = req.params.id
        const doc = req.userId
        const physician = await Physician.findOne({User:doc})
        const patient = await Patient.findOne({user:id})
        if(physician.patients.includes(patient._id)){
        const rec = await recommendation.findById(req.params.id2)
        //const patient = await Patient.findOne({user:id})
        
        if(rec.patient.equals(patient._id)){
             return res.status(200).json(rec)
        }
        return res.status(500).json({message:'not your recommendation cant access it'})

    }
    return res.status(500).json({message:"not your patient cannot access"})

}
    catch(err){
        return res.status(500).json({message: err.message})
    }
}

const getRenalFunction = async(req,res) =>{
    try{
        const id = req.params.id
        const doc = req.userId
        const physician = await Physician.findOne({User:doc})
        const patient = await Patient.findOne({user:id})
        if(physician.patients.includes(patient._id)){        
            //const patient = await patient.find({user:id})
        if(patient.renalFunction=== -1){
            return res.status(200).json({message:"unknown"})
        }
        return res.status(200).json(patient.renalFunction)
    }
    return res.status(500).json({message:"not your patient cannot access"})

}
    catch(e){
        return res.status(500).json({message:e.message})
    }
}

const updateRenalFunction = async(req,res) =>{
    try{
        const id = req.params.id
        const {ren} = req.body
        const doc = req.userId
        const physician = await Physician.findOne({User:doc})
        const patient = await Patient.findOne({user:id})
        if(physician.patients.includes(patient._id)){        
            //const patient = await patient.find({user:id})
        if(ren<=0){
            return res.status(500).json({message:"renal function cannot be less than 0"})
        }
        
        const updatedPatient = await Patient.findOneAndUpdate({user:id},{renalFunction:ren})
        return res.status(200).json(updatedPatient)
    }
    return res.status(500).json({message:"not your patient cannot access"})

}
    catch(e){
        return res.status(500).json({message:e.message})

    }
}

const generateRecommendation = async(req,res) =>{
    try{
        const id = req.params.id
        const doc = req.userId
        const physician = await Physician.findOne({User:doc})
        const patient = await Patient.findOne({user:id})
        if(physician.patients.includes(patient._id)){        
            //const patient = await Patient.findOne({user:id})
        const drugs = patient.Prescription
        const conds = patient.Conditions
        const ren = patient.renalFunction
        let patientRep = ["Based on the information you have entered here is your recommendation: "]
        let physRep = ["Based on the ags beers criteria here are the concerns: "]
        const details = await Drug.find({_id:drugs})
        console.log(details[0].Medication)
        console.log(details[1].Medication)
        console.log(details[1].Comments.toLowerCase())
        console.log(details[0].Comments.toLowerCase())
        console.log(details[2].Comments.toLowerCase())

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
                console.log('test')
                //if(details[i].Drug_Class){
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
                }//}
                //if(details[i].Drug_Class){
                if(interactionTable[j].Drug2.toLowerCase().includes(details[i].Medication.toLowerCase()) ||
                interactionTable[j].Drug2.toLowerCase().includes(details[i].Drug_Class.toLowerCase()) 
            ){
                for(var k = i; k<details.length;k++){
                    if(details[k].Drug_Class)
                    if(interactionTable[j].Drug1.toLowerCase().includes(details[k].Medication.toLowerCase()) ||
                interactionTable[j].Drug1.toLowerCase().includes(details[k].Drug_Class.toLowerCase()) 
            ){
                interactionTable[j].Drug2 = details[i].Medication
                interactionTable[j].Drug1 = details[k].Medication
                interactionList.push(interactionTable[j])
                meds.push(details[i].Medication)
                meds.push(details[k].Medication)
            }}
                }
                //}
                console.log("test 5"+interactionTable[j].Drug1.toLowerCase())
                console.log("test 5"+interactionTable[j].Drug2.toLowerCase())
                console.log("test 5"+details[i].Medication.toLowerCase())
                console.log(details[i].Drug_Class)
                console.log('test 5')
            }
            console.log('test 66')
            if(!meds.includes(details[i].Medication)){
                console.log('aham test')
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
        patientRep.push(`\n
        The following drugs contains some concern please contact your local pharmacist/ primary care physician(Doctor) before taking any action:`)
        
        for(var i =0; i<avoidList.length;i++){
        patientRep.push(`${avoidList[i].Medication},`)
        let physRep1 = `\n ${avoidList[i].Medication}: ${avoidList[i].Recommendation} \nRationale: ${avoidList[i].Rationale}`
        physRep.push(physRep1)
    }
    for(var i =0; i<cautionList.length;i++){
        patientRep.push(`${cautionList[i].Medication}: ${cautionList[i].Recommendation}`)
        physRep.push(`\n${cautionList[i].Medication}: ${cautionList[i].Recommendation} \nRationale: ${cautionList[i].Rationale}`)
    }
    physRep.push(` \nThe following are some interactions with some concern: `)
    for(var i =0; i<interactionList.length;i++){
        let physRep4 = `\n${interactionList[i].Drug1} + ${interactionList[i].Drug2}: ${interactionList[i].Recommendation} \nRationale: ${interactionList[i].PotentialOutcome}`;
        physRep.push(physRep4)
    }
    console.log("hello "+"\nworld")
        const medications = meds
        const ref = "\nReference: https://pubmed.ncbi.nlm.nih.gov/37139824/"
        physRep.push(ref)
        meds =[]
         for(let i =0;i<details.length;i++){
             meds.push(details[i].Medication)
         }  
        const rec = new recommendation({
            patient:patient,
            meds:details,
            ActiveDrug:meds,
            conditions:conds,
            conditionNames:condList,
            renalFunction:ren,
            patientReport:patientRep,
            physicianReport:physRep
        })        
        
        await rec.save()
        return res.status(200).json(rec)
    
    }
    return res.status(500).json({message:"not your patient cannot access"})

}
    catch(e){
        return res.status(500).json({message:e.message})
    }
}

const getPatients = async (req, res) => {
    try {
      const doc = req.userId;
      const physician = await Physician.findOne({ User: doc });
      
      if (!physician) {
        return res.status(404).json({ message: 'Physician not found' });
      }
  
      const list = physician.patients; // Array of patient IDs
      const details = await Patient.find({ _id: { $in: list } }); // Get all patients based on the IDs
  
      // Extract the 'user' property from each patient
      const userIds = details.map((patient) => patient.user); // Map over the 'details' array to get the user IDs
  
      // Fetch the user information for all the user IDs
      const users = await User.find({ _id: { $in: userIds } }); // Query the User collection with the list of user IDs
  
      return res.status(200).json(users); // Return the user details
    } catch (e) {
      return res.status(500).json({ message: e.message });
    }
  };
  
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

const removePatient = async (req,res) =>{
    try{
        const id = req.params.id
    const doc = req.userId
    const phys = await Physician.findOne({User:doc})
    const patient = await Patient.findOne({user:id})
    console.log(id)
    console.log(phys)
    console.log(!phys.patients.includes(id))
    if(!phys.patients.includes(patient._id)){
        return res.status(403).json({message:"not you patient"})
    }
    const updatedPatientList = phys.patients.remove(patient._id)
    console.log(phys.patients)
    const updatedPhysician = await Physician.findOneAndUpdate({User:doc},{patients:phys.patients})
    return res.status(200).json(updatedPhysician)
}
    catch(e){
        return res.status(500).json({message:e.message})
    }
}

const giveFeedback = async (req,res) =>{
    try{
        const id = req.params.id
        console.log("test1"+id)
        const rec = await recommendation.findOne({_id:id})
        console.log("test2"+rec)
        const conditions = rec.conditionNames
        console.log("test2")
        const {med, approval, comment,reason,other} = req.body
        const feedback = new Feedback({
            Medication:med,
            Approved:approval,
            Comment:comment,
            relatedConditions:conditions,
            ReasonOfDisapproval:reason,
            OtherReasons:other
        })
        console.log("test2")

        await feedback.save()
        console.log("test3")

        return res.status(200).json(feedback)
    }
    catch(e){
        return res.status(500).json({message:e.message})
    }
}
// const generateCondChart = async (req,res) =>{
//     try{
//         const users = await User.find({Role:'Patient'})
//         const groupedUsers = Object.groupBy(users,({Age})=>Age)
//         const condsList = await Condition.find()
//         const conds = condsList.Name
//         const condsID = condsList._id
//         let maxCondCount = -1
//         let maxCondCount2 = -1
//         let maxCond = ''
//         let maxCond2 = ''
//         let currentCond;
//         let count = 0;
//         let count2 = 0;
//         let conditions = []
//         let conditions2 = []
//         let CondCount = []
//         let CondCount2 = []
//         let age = []

//         for(var i = 0; i<groupedUsers.length;i++){
//             let currAge;
//             for(var k = 0; k<conds.length;k++){
//                 currentCond=conds[k]
//                 for(var j = 0;j<groupedUsers[i].length;j++){
//                 currAge = groupedUsers[i][j].Age
//                     let gender = groupedUsers[i][j].Gender
//                     let patient = await Patient.find({user:groupedUsers[i][j]._id})
//                     if(patient.Conditions.includes(condsID[k])){
//                         if(gender ==='male')
//                         count++
//                         else
//                         count2++
//                     }
                    
//                 }
//                 if(count>maxCondCount){
//                         maxCondCount = count
//                         maxCond = currentCond
//                     }
//                     if(count2>maxCondCount2){
//                         maxCondCount2 = count2
//                         maxCond2 = currentCond
//                     }
//             }
//             conditions.push(maxCond)
//             conditions2.push(maxCond2)
//             CondCount.push(count)
//             CondCount2.push(count2)
//             age.push(currAge)
//         }
//         const newChart = new Chart({
//             Data:({
//                 Condition:conditions,
//                 Condition2:conditions2,
//                 CondCount:CondCount,
//                 CondCount2:CondCount2,
//                 age:age
//             }),
//             Chart:'1'
//         })
//         return res.status(200).json(newChart)
//     }
//     catch(e){
//         return res.status(500).json({message:e.message})
//     }
// }
// const generateMedChart = async (req,res) => {
//     try{
//         const users = await User.find({Role:'Patient'})
//         const groupedUsers = Object.groupBy(users,({Age})=>Age)
//         const medsList = await Drug.find()
//         const meds = medsList.Medication
//         const medsID = medsList._id
//         let maxMedCount = -1
//         let maxMedCount2 = -1
//         let maxMed = ''
//         let maxMed2 = ''
//         let currentMed;
//         let count = 0;
//         let count2 = 0;
//         let medications = []
//         let medications2 = []
//         let MedCount = []
//         let MedCount2 = []
//         let age = []

//         for(var i = 0; i<groupedUsers.length;i++){
//             let currAge; 
//             for(var k = 0; k<meds.length;k++){
//             currentMed=meds[k] 
//             for(var j = 0;j<groupedUsers[i].length;j++){
//                 currAge = groupedUsers[i][j].Age        
//                     let gender = groupedUsers[i][j].Gender
//                     let patient = await Patient.find({user:groupedUsers[i][j]._id})
//                     if(patient.Prescription.includes(medsID[k])){
//                         if(gender ==='male')
//                         count++
//                         else
//                         count2++
//                     }
                    
//                 }
//                 if(count>maxMedCount){
//                         maxMedCount = count
//                         maxMed = currentMed
//                     }
//                     if(count2>maxMedCount2){
//                         maxMedCount2 = count2
//                         maxMed2 = currentMed
//                     }
//             }
//             medications.push(maxMed)
//             medications2.push(maxMed2)
//             MedCount.push(count)
//             MedCount2.push(count2)
//             age.push(currAge)
//         }
//         const newChart = new Chart({
//             Data:({
//                 Medication:medications,
//                 Medication2:medications2,
//                 MedCount:MedCount,
//                 MedCount2:MedCount2,
//                 age:age
//             }),
//             Chart:'2'
//         })
//         return res.status(200).json(newChart)
//     }
//     catch(e){
//         return res.status(500).json({message:e.message})
//     }
// }
// const generateRenChart = async(req,res) =>{
//     try{
//         const users = await User.find({Role:'Patient'})
//         const groupedUsers = Object.groupBy(users,({Age})=>Age)
//         let AverageRen = []
//         let AverageRen2 = []
//         let age = []
//         for(var i = 0; i<groupedUsers.length;i++){
//             let currAge;
//             let renSum = 0;
//             let renSum2 = 0;
//             let count = 0;
//             let count2 = 0
//             for(var j = 0;j<groupedUsers[i].length;j++){
//                 currAge = groupedUsers[i][j].Age
//                     let gender = groupedUsers[i][j].Gender
//                     let patient = await Patient.find({user:groupedUsers[i][j]._id})
//                     if(patient.renalFunction!==-1){
//                         if(gender ==='male'){
//                         count++
//                         renSum+=patient.renalFunction    
//                     }
//                         else{
//                         count2++
//                         renSum2+=patient.renalFunction    
//                     }
//                 }
//             }
//             let renAvg = renSum/count
//             let renAvg2 = renSum/count2

//             AverageRen.push(renAvg)
//             AverageRen2.push(renAvg2)
//             age.push(currAge)
//         }
//         const newChart = new Chart({
//             Data:({
//                 AverageRen:AverageRen,
//                 AverageRen2:AverageRen2,
//                 age:age
//             }),
//             Chart:'3'
//         })
//         return res.status(200).json(newChart)
//     }
//     catch(e){
//         return res.status(500).json({message:e.message})
//     }
// }
// const generateRenMedChart = async(req,res) => {
//     const patients = await Patient.find()
//     const renals = patients.renalFunction
//     const prescriptions = patients.Prescription
//     const medsList = await Drug.find()
//     const meds = medsList.Medication
//     const medsID = medsList._id
//     let maxMed = '';let maxMed2 = '';let maxMed3 = '';let maxMed4 = '';
//     let maxCount = 0;let maxCount2 = 0;let maxCount3 = 0;let maxCount4 = 0;
//     let Count = 0;let Count2 = 0;let Count3 = 0;let Count4 = 0;
//     let maxID = '';let maxID2 = '';let maxID3 = '';let maxID4 = '';
//     let sum = 0; let sum2 = 0; let sum3 = 0; let sum4 = 0;
//     for(var j = 0; j<meds.length;j++){
//     for(var i = 0;i<renals.length;i++){
//             if(renals[i]<=25&&renals[i]>=0){
//                 if(prescriptions[i].includes(medsID[j])){Count++}
//             }
//             if(renals[i]<=50&&renals[i]>25){
//                 if(prescriptions[i].includes(medsID[j])){Count2++}
//             }
//             if(renals[i]<=75&&renals[i]>50){
//                 if(prescriptions[i].includes(medsID[j])){Count3++}
//             }
//             if(renals[i]>75){
//                 if(prescriptions[i].includes(medsID[j])){Count4++}
//             }
        
        
//         }
//         if(Count>maxCount){
//             maxCount = Count
//             maxMed = meds[j]
//             maxID = medsID[j]
//         }
//         if(Count2>maxCount2){
//             maxCount2 = Count2
//             maxMed2 = meds[j]
//             maxID2 = medsID[j]
//         }
//         if(Count3>maxCount3){
//             maxCount3 = Count3
//             maxMed3 = meds[j]
//             maxID3 = medsID[j]
//         }
//         if(Count4>maxCount4){
//             maxCount4 = Count4
//             maxMed4 = meds[j]
//             maxID4 = medsID[j]
//         }
//     }
//     Count = 0;    Count2 = 0;     Count3 = 0;     Count4 = 0;
//     for(var i = 0;i<renals.length;i++){
//         if(renals[i]<=25&&renals[i]>=0){
//             if(prescriptions[i].includes(maxID)){Count++;sum+=renals[i]}
//             if(prescriptions[i].includes(maxID2)){Count2++;sum2+=renals[i]}
//             if(prescriptions[i].includes(maxID3)){Count3++;sum3+=renals[i]}
//             if(prescriptions[i].includes(maxID4)){Count4++;sum4+=renals[i]}

//         }
//         if(renals[i]<=50&&renals[i]>25){
//             if(prescriptions[i].includes(maxID)){Count++;sum+=renals[i]}
//             if(prescriptions[i].includes(maxID2)){Count2++;sum2+=renals[i]}
//             if(prescriptions[i].includes(maxID3)){Count3++;sum3+=renals[i]}
//             if(prescriptions[i].includes(maxID4)){Count4++;sum4+=renals[i]}

//         }
//         if(renals[i]<=75&&renals[i]>50){
//             if(prescriptions[i].includes(maxID)){Count++;sum+=renals[i]}
//             if(prescriptions[i].includes(maxID2)){Count2++;sum2+=renals[i]}
//             if(prescriptions[i].includes(maxID3)){Count3++;sum3+=renals[i]}
//             if(prescriptions[i].includes(maxID4)){Count4++;sum4+=renals[i]}

//         }
//         if(renals[i]>75){
//             if(prescriptions[i].includes(maxID)){Count++;sum+=renals[i]}
//             if(prescriptions[i].includes(maxID2)){Count2++;sum2+=renals[i]}
//             if(prescriptions[i].includes(maxID3)){Count3++;sum3+=renals[i]}
//             if(prescriptions[i].includes(maxID4)){Count4++;sum4+=renals[i]}

//         }
//     }
//     let avg = sum/Count
//     let avg2 = sum2/Count2
//     let avg3 = sum3/Count3
//     let avg4 = sum4/Count4

// }
const generateApprovalGeneral = async (req,res) =>{
    try{
        console.log('test')
        const {drug} = req.body
        let feedbacks;
        let approvals=0;
        let disapprovals=0;

        if(!drug)
        feedbacks = await Feedback.find({})
        else
        feedbacks = await Feedback.find({Medication:drug})
        for(var i =0;i<feedbacks.length;i++){
            if(feedbacks[i].Approved===true)
                approvals= approvals+1
            else
                disapprovals= disapprovals+1
        }
        const data = {
            approvals:approvals,
            disapprovals:disapprovals
        }
        console.log(data)
        return res.status(200).json(data)
    }
    catch(e){
        return res.status(500).json({message:e.message})
    }
}
const generateDisapprovalStats = async (req,res) => {
    try{
        const {drug} = req.body
        let feedbacks;
        let o1 =0;let o2 =0; let o3 =0; let o4=0; let o5=0; let o6=0
        if(drug)
        feedbacks = await Feedback.find({Medication:drug,Approved:false})
        else
        feedbacks = await Feedback.find({Approved:false})

        for(var i =0; i<feedbacks.length;i++){
            if(feedbacks[i].ReasonOfDisapproval==='Expert opinion')
                o1++
            if(feedbacks[i].ReasonOfDisapproval==='Randomized Clinical trial (RCT)')
                o3++
            if(feedbacks[i].ReasonOfDisapproval==='Observational Study')
                o2++
            if(feedbacks[i].ReasonOfDisapproval==='Systematic review and meta analysis')
                o4++
            if(feedbacks[i].ReasonOfDisapproval==='Guidelines')
                o5++
            if(feedbacks[i].ReasonOfDisapproval==='Other')
                o6++

        }
        const data = {
            ExpertOpinion:o1,
            ObservationalStudy:o2,
            RCT:o3,
            SystemicReview:o4,
            Guidelines:o5,
            Other:o6
        }
        return res.status(200).json(data)
    }
    catch(e){
        return res.status(500).json({message:e.message})
    }
}
const getNoPatients = async (req,res) => {
    try{
        const id = req.userId
        const phys = await Physician.findOne({User:id})
        const noPatients = phys.patients.length
        return res.status(200).json(noPatients)
    }
    catch(e){
        return res.status(500).json({message:e.message})
    }
}
const getPatientDemographics = async (req,res) => {
    try{
        const phys = await Physician.findOne({User:req.userId})
        const Patients = phys.patients
        let males =0;
        let females =0;
        let ages=[];
        const patient = await Patient.findOne({_id:Patients[0]})
            const user = await User.findOne({_id:patient.user})
            let age =calculateAge(user.DateOfBirth)
        if(user.Gender==='male'){
            let data = {
                age:age,
                count:1,
                males:1,
                females:0
            }
            ages.push(data)
        }
        else{
            let data = {
                age:age,
                count:1,
                males:0,
                females:1
            }
            ages.push(data)
        }
        for(var i=1;i<Patients.length;i++){
            const patient = await Patient.findOne({_id:Patients[i]})
            const user = await User.findOne({_id:patient.user})
            let age =calculateAge(user.DateOfBirth)
            console.log(ages.length+'new')
            let data;
            let flag = false;
            for(let j =0;j<ages.length;j++){
                console.log(j)
                if(ages[j].age===age){
                    flag = true
                    if(user.Gender=== 'male'){
                        ages[j].count= ages[j].count + 1
                        ages[j].males= ages[j].males + 1
                        ages[j].females = ages[j].females
                    }
                    else{
                        ages[j].count= ages[j].count + 1
                        ages[j].females= ages[j].females + 1
                        ages[j].males = ages[j].males
                    }
                }
           
            
            }
            if(!flag){
                    data = {
                        age:age,
                        count:1,
                        males:0,
                        females:1
                    }
                    ages.push(data)

                }
            
        }
        ages.sort((a, b) => a.age - b.age);
        return res.status(200).json(ages)
    }
    catch(e){
    return res.status(500).json({message:e.message})
    }
}
const addSymptom = async (req,res) =>{
    try{
    const id = req.params.id
    const doc = req.userId
    const {symptom} = req.body
    const patient = await Patient.findOne({user:id})
    const phys = await Physician.findOne({User:doc})
    if(phys.patients.includes(patient._id)){
        console.log(id+'test')
        let symptoms;
        
        const flag = await Symptoms.findOne({Name:symptom})
        console.log(flag)
        console.log(Symptoms)
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
        console.log(symptoms)
        console.log(symptom)
        console.log(patient.Symptoms)
        const updatedPatient = await Patient.findOneAndUpdate({user:id},{Symptoms:patient.Symptoms})
        return res.status(200).json(updatedPatient)
        
    }
    return res.status(500).json({message:'Not your patient'})
}
    catch(e){
    return res.status(500).json({message:e.message})
    }
}
const removeSymptom = async (req,res) => {
    try{
        const id = req.params.id
        const doc = req.userId
        const {symptom} = req.body
        const patient = await Patient.findOne({user:id})
        const phys = await Physician.findOne({User:doc})
        if(phys.patients.includes(patient._id)){
            const symptoms = patient.Symptoms.filter((symp)=> symp!= symptom)
            console.log(patient.Symptoms)
            console.log(symptoms)
            const updatedPatient = await Patient.findOneAndUpdate({user:id},{Symptoms:symptoms})
            return res.status(200).json(updatedPatient)
            
        }
        return res.status(500).json({message:'Not your patient'})
    }
        catch(e){
        return res.status(500).json({message:e.message})
        }
}
const getSymptoms = async (req,res) => {
    try{
        const id = req.params.id
        const doc = req.userId
        const patient = await Patient.findOne({user:id})
        const phys = await Physician.findOne({User:doc})
        if(phys.patients.includes(patient._id)){
            const symptoms = await Symptoms.find({Name:patient.Symptoms})
            console.log(symptoms)
            console.log(patient.Symptoms)
            return res.status(200).json(symptoms)
            
        }
        return res.status(500).json({message:'Not your patient'})
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
const submitUpdate = async (req,res) => {
    try{
    const id = req.params.id 
    const doc = req.userId
    const {renalFunction,conditions,medications,symptoms} = req.body
    const patient = await Patient.findOne({user:id})
    const user = await User.findById(id)
    const age = calculateAge(user.DateOfBirth)
    const gender = user.Gender
    const physician = await Physician.findOne({User:doc})
    console.log(renalFunction)
    console.log(conditions)
    console.log(medications)
    console.log(symptoms)
    if(physician.patients.includes(patient._id)){
        console.log('trstts')
        const update = new updates({
            patient_id:patient._id,
            demographics:{
                age:age,
                gender:gender
            },
            renal_function:renalFunction,
            conditions:conditions,
            current_medications:medications,
            symptoms:symptoms
        })
        console.log(update)
        await update.save()
        return res.status(200).json(update)
    }
    return res.status(500).json({message:'not your patient'})
}
    catch(e){
        return res.status(500).json({message:e.message})
    }
}
const getUpdatesByPatient = async (req,res) => {
    try{
        const id = req.params.id
        const doc = req.userId
        const patient = await Patient.findOne({user:id})
        const phys = await Physician.findOne({User:doc})
        if(phys.patients.includes(patient._id)){
            const updatesss = await updates.find({patient_id:patient._id})
            return res.status(200).json(updatesss)
        }
        return res.status(500).json({message:'not your patient'})

    }
    catch(e){
        return res.status(500).json({message:e.message})
    }
}
const getUpdateByID = async (req,res) => {
    try{
    const id = req.params.id
    const id2 = req.params.id2
    const doc = req.userId
    const patient = await Patient.findOne({user:id})
    const phys = await Physician.findOne({User:doc})
    console.log("testttt")
    if(phys.patients.includes(patient._id)){
        const update = await updates.findOne({_id:id2})
            console.log(update+"test")
            return res.status(200).json(update)
        
    }
    return res.status(500).json({message:'not your patient'})
    }
    catch(e){
        return res.status(500).json({message:e.message})
    }
}
const generateRecommendationUsingAI =  async (req, res) => {
    const id = req.params.id
    const patient = await Patient.findOne({user:id})
    const Prescription = patient.Prescription
    const conditions = patient.Conditions
    const sypmtoms = patient.Symptoms
    const renFunction = patient.renalFunction
    const drugs = await Drug.find({_id:Prescription})
    const conds = await Condition.find({_id:conditions})
    const symp = await Symptoms.find({Name:sypmtoms})
    const  prompt=`What do you recommend for a patient with the following potentially inappropriate medications: ${drugs}, 
    and the following conditions: ${conds}, 
    and the following symptoms: ${symp}, and the following renal function: ${renFunction}. 
    Include your references and sources. Make the response short and to the point `;

    try {
        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: "gpt-4o-mini", // Specify the GPT model
                messages: [{ role: "user", content: prompt }],
            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        return res.json(response.data);
    } catch (error) {
        console.error(error);
        return res.status(500).json({message:'Error communicating with OpenAI API'});
    }
};

module.exports={
    addPatient,
    CreatePatientProfile,
    addDrug,
    addCondition,
    getDrugList,
    getConditions,
    removeDrug,
    removeCondition,
    getReccomendationsByPatient,
    getReccomendationById,
    getRenalFunction,
    updateRenalFunction,
    generateRecommendation,
    getPatients,
    meds,
    getAllConditions,
    removePatient,
    giveFeedback,
    generateApprovalGeneral,
    generateDisapprovalStats,
    getNoPatients,
    getPatientDemographics,
    addSymptom,
    removeSymptom,
    getSymptoms,
    getAllSymptoms,
    submitUpdate,
    getUpdateByID,
    getUpdatesByPatient,
    generateRecommendationUsingAI
}
