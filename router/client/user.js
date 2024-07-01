const express = require('express')
const router = express.Router()
const controller = require('../../controller/client/user')
const validate = require('../../middlewears/validation/signupValidation')
const isAuth = require('../../middlewears/user/auth')
const passwordValidate = require('../../middlewears/validation/resetPasswordValidation')


// google login
router.post('/user/google', controller.gooleLogin)

// get signin page
router.get('/signIn',controller.getSignInPage)

// get signUp page
router.get('/signUp',controller.getSignUpPage)

// signUp user with otp sending to email
router.post('/signUp', validate, controller.signUp)

// verify email for signup
router.get('/verifyEmail', controller.getVerifyEmailPage)

// verify email for signup
router.post('/user/verify', controller.verifyEmail)

// delete otp
router.delete('/user/deleteOTP', controller.deleteOTP)

// resend otp
router.get('/user/resendOTP', controller.resendOTP)

// signIn user
router.post('/signIn', controller.signIn)

// get forgot password page
router.get('/forgotPassword?', controller.getForgotPasswordPage)

// forgot password send link to email
router.post('/forgotPassword?', controller.sendLinkToEmail)

// forgot password send link to email
router.get('/resetpassword', controller.resetPassword)

// forgot password send link to email
router.post('/resetpassword', passwordValidate,controller.changePassword)





module.exports = router;