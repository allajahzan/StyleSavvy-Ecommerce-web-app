const express = require('express')
const router = express.Router()

const isAuth = require('../../middlewears/admin/auth')
const isAuthFetch = require('../../middlewears/admin/authFetch')
const controller = require('../../controller/admin/type')

// get listed types page
router.get('/admin/listedTypes', isAuth, controller.getListedTypes)

// get unlisted types page
router.get('/admin/unlistedTypes', isAuth, controller.getUnListedTypes)

// add type
router.post('/admin/addTypes', isAuthFetch, controller.addTypes)

// edit type
router.patch('/admin/editTypes', isAuthFetch, controller.editTypes)

// unlist type
router.patch('/admin/type/unlist', isAuthFetch, controller.unlistType)

// list type
router.patch('/admin/type/list', isAuthFetch, controller.listType)

module.exports = router
