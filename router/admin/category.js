const express = require('express')
const router = express.Router()

const isAuth = require('../../middlewears/admin/auth')
const isAuthFetch = require('../../middlewears/admin/authFetch')
const controller = require('../../controller/admin/category')

// get listed categories page
router.get('/admin/listedCategories', isAuth, controller.getListedCategories)

// get unlisted categories page
router.get('/admin/unlistedCategories', isAuth, controller.getUnListedCategories)

// add category
router.post('/admin/addCategories', isAuthFetch, controller.addCategories)

// edit category
router.patch('/admin/editCategories', isAuthFetch, controller.editCategories)

// unlist category
router.patch('/admin/category/unlist', isAuthFetch, controller.unlistCategories)

// list category
router.patch('/admin/category/list', isAuthFetch, controller.listCategories)

module.exports = router

