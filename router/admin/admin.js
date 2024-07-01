const express = require('express')
const router = express.Router()

const isAuth = require('../../middlewears/admin/auth')
const controller = require('../../controller/admin/admin')

// get signin page
router.get('/admin', controller.getAdminLoginPage)

// get signin page
router.get('/admin/signIn', controller.getLoginPage)

// admin signin
router.post('/admin/signIn', controller.adminLogin)

// get dasboard
router.get('/admin/dashboard', isAuth, controller.getDashBoard)

// to logout
router.get('/admin/logout',isAuth,controller.logout)

module.exports = router