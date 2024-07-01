const express = require('express')
const router = express.Router()
const isAuth = require('../../middlewears/admin/auth')
const isAuthFetch = require('../../middlewears/admin/authFetch')
const controller = require('../../controller/admin/order')

// get order page
router.get('/admin/orders',isAuth,controller.getOrderPage)

// get orderDetails Page
router.get('/admin/orderDetails',isAuth,controller.orderDetails)

// change order status 
router.patch('/admin/orderStatus',isAuthFetch, controller.changeOrderStatus)

// return request accept or reject 
router.patch('/admin/requestStatus', isAuthFetch, controller.changeRequestStatus)

// recieve returned order
router.patch('/admin/recieveReturned', isAuthFetch, controller.recieveReturned)



module.exports = router