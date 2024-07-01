const { ObjectId } = require('mongodb')
const mongoose = require('mongoose')
const catSchema = new mongoose.Schema({
    category_name:{
        type:String,
        required:true,
        index:true
    },
    type:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'Type',
        required:true,
        index:true
    },
    categoryOffer:{
        type:Number,
        default:null
    },
    isListed:{
        type:Boolean,
        require:true,
        default:true
    }
})

const Category = mongoose.model('Category',catSchema)
module.exports = Category