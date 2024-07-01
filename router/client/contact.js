const express = require('express')
const router = express.Router()
const controller = require('../../controller/client/contact')

router.get('/contact', controller.getContactPage)

module.exports = router