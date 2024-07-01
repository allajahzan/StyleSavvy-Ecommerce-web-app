const mongoose = require('mongoose')
const colorSchema = new mongoose.Schema({
    color_name:{
        type:String,
        required:true,
        index:true
    },
    color_code:{
        type:String,
        required:false
    },
    isListed:{
        type:Boolean,
        require:true,
        default:true
    }
})

const Color = mongoose.model('Color',colorSchema)
module.exports = Color