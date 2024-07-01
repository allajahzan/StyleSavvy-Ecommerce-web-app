const express = require('express')
const router = express.Router()
const controller = require('../../controller/client/profile')
const validate = require('../../middlewears/validation/profileValidatation')
const isAuth = require('../../middlewears/user/authFetch')
const isAuth2 = require('../../middlewears/user/auth')
const passwordValidate = require('../../middlewears/validation/passwordValidation')
const addressValidate = require('../../middlewears/validation/addressValidate')

// get profile page
router.get('/profile',controller.getProfile)

// update profile
router.put('/profile/update',isAuth,validate,controller.updateProfile)

// update profile
router.put('/profile/updategoogle', isAuth,validate, controller.updateProfileGoogle)

// verify email
router.post('/profile/verifyEmail',isAuth,controller.verifyEmail)

// delete otp
router.delete('/profile/deleteOTP', controller.deleteOTP)

// check OTP
router.get('/profile/checkOtp',isAuth,controller.checkOTP)

// change password
router.patch('/profile/changePassword', isAuth,passwordValidate,controller.changePassword)

// add address
router.post('/profile/address/add',isAuth,addressValidate,controller.addAddress)

// get address data
router.get('/profile/address',isAuth, controller.getAddress)

// edit address
router.put('/profile/address/edit',isAuth,addressValidate,controller.editAddress)

// delete address
router.delete('/profile/address/delete',isAuth,controller.deleteAddress)

// logout 
router.get('/user/logout',isAuth2,controller.logout)

module.exports = router