const express = require('express')
const router = express.Router()

const isAuth = require('../../middlewears/admin/auth')
const isAuthFetch = require('../../middlewears/admin/authFetch')
const controller = require('../../controller/admin/size')

// get listed Sizes page
router.get('/admin/listedSizes', isAuth, controller.getListedSizes)

// get unlisted Sizes page
router.get('/admin/unlistedSizes', isAuth, controller.getUnListedSizes)

// add sizes
router.post('/admin/addSizes', isAuthFetch, controller.addSizes)

// edit size
router.patch('/admin/editSizes', isAuthFetch, controller.editSizes)

// unlist size
router.patch('/admin/size/unlist', isAuthFetch, controller.unlistSizes)

// list size
router.patch('/admin/size/list', isAuthFetch, controller.listSizes)

module.exports = router

