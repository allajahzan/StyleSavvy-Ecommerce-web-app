const express = require('express')
const router = express.Router()
const isAuth = require('../../middlewears/user/auth')
const controller = require('../../controller/client/home')


// load the website
router.get('/', controller.pageLoad)

// get home page
router.get('/home',controller.getHomePage)

// get clothe with color
router.get('/home/product/varient',controller.getVarientWithColor)

module.exports = router