const express = require("express");
const router = express.Router();
const patientController = require('../Controller/patientController')
const authorizationJWT = require("../Middleware/authorizeJWT");

router.put('/addDrug',authorizationJWT('Patient'),patientController.addDrug)
router.put('/addCond',authorizationJWT('Patient'),patientController.addCondition)
router.get('/getDrugs',authorizationJWT('Patient'),patientController.getDrugList)
router.put('/removeDrug',authorizationJWT('Patient'),patientController.removeDrug)
router.post('/generate',authorizationJWT('Patient'),patientController.generateRecommendation)
router.put('/removeCond',authorizationJWT('Patient'),patientController.removeCondition)
router.get('/getConds',authorizationJWT('Patient'),patientController.getConditions)
router.get('/getRec/:id',authorizationJWT('Patient'),patientController.getReccomendationById)
router.get('/getRec',authorizationJWT('Patient'),patientController.getReccomendationsByPatient)
router.get('/getRenal',authorizationJWT('Patient'),patientController.getRenalFunction)
router.put('/updateRenal',authorizationJWT('Patient'),patientController.updateRenalFunction)
router.get('/meds',authorizationJWT('Patient'),patientController.meds)
router.get('/conditions',authorizationJWT('Patient'),patientController.getAllConditions)
router.get('/givenID',authorizationJWT('Patient'),patientController.getGivenId)
router.put('/addSymp',authorizationJWT('Patient'),patientController.addSymptom)
router.get('/getSymptoms',authorizationJWT('Patient'),patientController.getSymptoms)
router.put('/removeSymptom',authorizationJWT('Patient'),patientController.removeSymptom)
router.get('/Symptoms',authorizationJWT('Patient'),patientController.getAllSymptoms)

module.exports = router;