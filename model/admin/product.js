const mongoose = require('mongoose')
const productSchema = new mongoose.Schema({
    product_name:{
        type:String,
        required:true,
        index:true,
    },
    discription:{
        type:String,
        required:true
    },
    type:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'Type',
        required:true,
        index:true
    },
    category:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'Category',
        required:true,
        index:true
    },
    title:{
        type:String,
        required:true,
        index:true
    },
    tags:{
        type:String,
        required:false,
        index:true
    },
    varients:{
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'Varient',
        index:true
    },
    productOffer:{
      type:Number,
      default:null
    },
    addedDateTime:{
        type: Date,
        required:true,
        default: Date.now
    },
    isListed:{
        type:Boolean,
        require:true,
        default:true,
        index:true
    },
    isVarientAvailable:{
        type:Boolean,
        required:false,
        default:false,
    }
})

const Product = mongoose.model('Product',productSchema)
module.exports = Product