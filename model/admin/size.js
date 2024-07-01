const mongoose = require('mongoose')
const sizeSchema = new mongoose.Schema({
    size_name:{
        type:String,
        required:true,
        index:true
    },
    isListed:{
        type:Boolean,
        require:true,
        default:true
    }
})

const Size = mongoose.model('Size',sizeSchema)
module.exports = Size