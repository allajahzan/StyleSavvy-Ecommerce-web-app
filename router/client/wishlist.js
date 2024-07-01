const express = require('express')
const router = express.Router()
const isAuth = require('../../middlewears/user/authFetch')
const isAuth1 = require('../../middlewears/user/auth')
const controller = require('../../controller/client/wishlist')

// add items to wishlist
router.post('/wishlist/add',isAuth,controller.addToWishlist)

// get wishlist page
router.get('/wishlist',controller.getWishlistPage)


module.exports = router