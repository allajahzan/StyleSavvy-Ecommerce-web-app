const express = require('express')
const router = express.Router()
const isAuth = require('../../middlewears/user/authFetch')
const isAuth2 = require('../../middlewears/user/auth')
const controller = require('../../controller/client/order')


// order
router.post('/order',isAuth,controller.orderItems)

// get orders page
router.get('/orders', controller.getOrdersPage)

// get order details page
router.get('/orderDetails', controller.getOrderDetails)

// cancel the order
router.patch('/cancelOrder', isAuth, controller.cancelOrder)

// request to return 
router.patch('/requestReturn', isAuth, controller.requestReturn)

// request to create razorpay order Id 
router.get('/createOrderId', isAuth, controller.createOrderIdRazorPay)

// verify payment
router.post('/verifyPayment', isAuth, controller.verifyPayment)

// verify Re-Payment
router.post('/verifyRePayment', isAuth, controller.verifyRePayment)

// verify payment
router.post('/increaseQuantity', isAuth, controller.increaseQuantity)

// checking items availability in re payment
router.post('/check/repayment', isAuth, controller.checkItemsInRepayment)


module.exports = router