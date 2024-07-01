const express = require('express')
const router = express.Router()

const isAuth = require('../../middlewears/admin/auth')
const isAuthFetch = require('../../middlewears/admin/authFetch')
const controller = require('../../controller/admin/color')

// get listed Sizes page
router.get('/admin/listedColors', isAuth, controller.getListedColors)

// get unlisted colors page
router.get('/admin/unlistedColors', isAuth, controller.getUnListedSizes)

// add color
router.post('/admin/addColors', isAuthFetch, controller.addColors)

// edit color
router.patch('/admin/editColors', isAuthFetch, controller.editColors)

// unlist color
router.patch('/admin/color/unlist', isAuthFetch, controller.unlistColors)

// list color
router.patch('/admin/color/list', isAuthFetch, controller.listColors)

module.exports = router

