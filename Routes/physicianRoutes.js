const express = require("express");
const router = express.Router();
const physicianController = require('../Controller/physicianController')
const authorizationJWT = require("../Middleware/authorizeJWT");
//const PhysicianController = require('../MachineLearningModel/PhysicianController')

router.put('/add',authorizationJWT('Physician'),physicianController.addPatient)
router.post('/create',authorizationJWT('Physician'),physicianController.CreatePatientProfile)
router.put('/addDrug/:id',authorizationJWT('Physician'),physicianController.addDrug)
router.put('/addCond/:id',authorizationJWT('Physician'),physicianController.addCondition)
router.get('/getDrugs/:id',authorizationJWT('Physician'),physicianController.getDrugList)
router.put('/removeDrug/:id',authorizationJWT('Physician'),physicianController.removeDrug)
router.post('/generate/:id',authorizationJWT('Physician'),physicianController.generateRecommendation)
router.put('/removeCond/:id',authorizationJWT('Physician'),physicianController.removeCondition)
router.get('/getConds/:id',authorizationJWT('Physician'),physicianController.getConditions)
router.get('/getRec/:id/:id2',authorizationJWT('Physician'),physicianController.getReccomendationById)
router.get('/getRec/:id',authorizationJWT('Physician'),physicianController.getReccomendationsByPatient)
router.get('/getRenal/:id',authorizationJWT('Physician'),physicianController.getRenalFunction)
router.put('/updateRenal/:id',authorizationJWT('Physician'),physicianController.updateRenalFunction)
router.get('/getPatients',authorizationJWT('Physician'),physicianController.getPatients)
router.get('/meds',authorizationJWT('Physician'),physicianController.meds)
router.get('/conditions',authorizationJWT('Physician'),physicianController.getAllConditions)
router.put('/removePatient/:id',authorizationJWT('Physician'),physicianController.removePatient)
router.post('/Feedback/:id',authorizationJWT('Physician'),physicianController.giveFeedback)
router.post('/approvals',authorizationJWT('Physician'),physicianController.generateApprovalGeneral)
router.post('/disapprovals',authorizationJWT('Physician'),physicianController.generateDisapprovalStats)
router.post('/demographics',authorizationJWT('Physician'),physicianController.getPatientDemographics)
router.get('/patients',authorizationJWT('Physician'),physicianController.getNoPatients)
router.put('/addSymp/:id',authorizationJWT('Physician'),physicianController.addSymptom)
router.get('/getSymptoms/:id',authorizationJWT('Physician'),physicianController.getSymptoms)
router.put('/removeSymptom/:id',authorizationJWT('Physician'),physicianController.removeSymptom)
router.get('/getSymptoms',authorizationJWT('Physician'),physicianController.getAllSymptoms)
router.post('/update/:id',authorizationJWT('Physician'),physicianController.submitUpdate)
router.get('/getUpdate/:id/:id2',authorizationJWT('Physician'),physicianController.getUpdateByID)
router.get('/getUpdate/:id',authorizationJWT('Physician'),physicianController.getUpdatesByPatient)
router.post('/generateUsingAI/:id',authorizationJWT('Physician'),physicianController.generateRecommendationUsingAI)


module.exports = router;
