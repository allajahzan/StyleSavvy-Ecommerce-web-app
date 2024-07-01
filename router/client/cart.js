const express = require('express')
const router = express.Router()
const isAuth = require('../../middlewears/user/authFetch')
const controller = require('../../controller/client/cart')

// get cart page
router.get('/cart',controller.getCartPage)

// add to cart
router.post('/cart/add',controller.addToCart)

// update cart
router.patch('/cart/update',isAuth,controller.updateCart)

// remove item
router.delete('/cart/remove',isAuth,controller.removeItem)

// get cart items
router.get('/cart/items',isAuth,controller.getCartItems)

// checkout from cart
router.get('/cart/checkout',isAuth,controller.checkoutAndAvailabilityInCart)

// store check and store cart token
router.get('/cart/storeToken', isAuth,controller.storeToken)



module.exports = router

