const express = require('express')
const router = express.Router()
const isAuth = require('../../middlewears/user/auth')
const controller = require('../../controller/client/product')
const jwt = require('jsonwebtoken')


// load the website
router.get('/shop',controller.getProductsPage)

// load the website
router.get('/product',controller.getProductsDetails)

// to get the varints stock details 
router.get('/product/varient',controller.getVarientData)

// get varients size data
router.get('/varients/sizes',controller.getVarientSizes)

// check stocks available
router.get('/check/stock',controller.checkStock)


module.exports = router