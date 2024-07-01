const express = require('express')
const router = express.Router()
const isAuth = require('../../middlewears/admin/auth')
const controller = require('../../controller/admin/salesReport')

// get order page
router.get('/admin/salesReports',isAuth,controller.getSalesReportPage)


module.exports = router