const express = require('express')
const router = express.Router()
const isAuth = require('../../middlewears/user/authFetch')
const isAuth1 = require('../../middlewears/user/auth')
const controller = require('../../controller/client/wallet')

// add create order id for wallet 
router.post('/wallet/createOrderId',isAuth,controller.createOrderId)

// verify payment
router.post('/wallet/verifyPayment',isAuth,controller.verifyPayment)

module.exports = router