const express = require('express')
const router = express.Router()
const isAuth = require('../../middlewears/user/authFetch')
const isAuth2 = require('../../middlewears/user/auth')
const controller = require('../../controller/client/checkout')

// get checkout page
router.get('/checkout',controller.getCheckOutpage)

// checkout from checkout and check availability
router.post('/checkout/isAvailable',isAuth,controller.checkoutAndAvailabilityInCheckout)

// check items are available again
router.get('/checkout/check',isAuth,controller.lastCheckout)

// get cart items
router.post('/checkout/items',isAuth,controller.getCheckoutItems)

// get addresses
router.get('/checkout/addresses',isAuth,controller.getAddresses)

module.exports = router