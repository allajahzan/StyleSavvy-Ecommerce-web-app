const express = require('express')
const router = express.Router()
const isAuth = require('../../middlewears/user/authFetch')
const controller = require('../../controller/client/coupon')

// get cart page
router.get('/getCoupons',isAuth,controller.getCoupons)

// apply coupon
router.get('/applyCoupon', isAuth, controller.applyCoupon)

module.exports = router;