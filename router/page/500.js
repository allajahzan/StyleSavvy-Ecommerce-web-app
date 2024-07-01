const express = require('express')
const router = express.Router()

// get 500 page

router.get('/500-Server-Error', (req,res)=>{
    res.render('500')
})


module.exports = router