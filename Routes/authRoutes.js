const express = require('express')
const router = express.Router()
const authController = require('../Controller/authController')

router.route('/').post(authController.login)


router.route('/refresh').get(authController.refresh)

//router.route('/verify').get(authController.verify)
//router.route('/verifyotp/:id').post(authController.verifyOTP)

router.route('/logout').post(authController.logout)

router.route('/signup').post(authController.signup)

router.route('/Update').put(authController.newPassword)
router.route('/Generate').post(authController.generateOTPWithExpiry)
router.route('/Verify/:Email').post(authController.verifyOTP)



module.exports = router