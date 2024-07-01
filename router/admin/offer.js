const express = require('express')
const router = express.Router()

const isAuth = require('../../middlewears/admin/auth')
const isAuthFetch = require('../../middlewears/admin/authFetch')
const controller = require('../../controller/admin/offer')

// add offer  page 
router.get('/admin/addOffers', isAuth, controller.getAddOfferPage)

// add offer    
router.post('/admin/addOffers', isAuthFetch, controller.addOffers)

// get the perticular types
router.get('/admin/getTypes', isAuthFetch, controller.getTypes)

// get lists offers    
router.get('/admin/listsOffers', isAuth, controller.getListsOffers)

// edit offer
router.patch('/admin/editOffers', isAuthFetch, controller.editOffers)
           
// activateion of offer
router.get('/admin/activationOffer', isAuthFetch, controller.activationOffer)

// remove an offer
router.delete('/admin/removeOffer', isAuthFetch, controller.removeOffer)
           
module.exports = router
