const express = require('express')
const router = express.Router()

const isAuth = require('../../middlewears/admin/auth')
const isAuthFetch = require('../../middlewears/admin/authFetch')
const controller = require('../../controller/admin/coupon')

// get add coupons page
router.get('/admin/addCoupons', isAuth, controller.getAddCouponPage)

// add coupons
router.post('/admin/addCoupons', isAuthFetch, controller.addCoupons)

// edit coupons
router.patch('/admin/editCoupons', isAuthFetch, controller.editCoupons)

// get listed coupons page
router.get('/admin/listsCoupons', isAuth, controller.listsCoupons)

// activation of coupon
router.get('/admin/activationCoupon', isAuthFetch, controller.activateCoupon)

// remove a coupon
router.delete('/admin/removeCoupon', isAuthFetch, controller.removeCoupon)

module.exports = router

