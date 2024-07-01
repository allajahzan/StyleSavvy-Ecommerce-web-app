const express = require('express')
const router = express.Router()

// get 

router.get('/admin/500-Server-Error', (req,res)=>{
    res.render('500Admin')
})

module.exports = router