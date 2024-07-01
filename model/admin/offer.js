const mongoose = require('mongoose')
const offerSchema = new mongoose.Schema({
    offer_name:{
        type:String,
        required:true,
        index:true
    },
    offer:{
        type:String,
        required:false,
        index : true
    },
    redeem_amount:{
        type:Number,
        required:true
    },
    offerType:{
        type:String,
        required:true,
        index : true
    },
    typeName:{
        type:String,
        required:true
    },
    categoryId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'Category',
        required:false,
        index:true
    },
    productId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'Product',
        required:false,
        index:true
    },
    isActive:{
        type:Boolean,
        require:true,
        default:false
    },
    addedDateTime:{
        type:Date,
        default:Date.now
    },
})

const Offer = mongoose.model('Offer',offerSchema)
module.exports = Offer