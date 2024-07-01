const mongoose = require('mongoose')
const typeSchema = new mongoose.Schema({
    type_name:{
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

const Type = mongoose.model('Type',typeSchema)
module.exports = Type