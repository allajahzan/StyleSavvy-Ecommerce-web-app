const mongoose = require('mongoose')
const couponSchema = new mongoose.Schema({
    coupon_code:{
        type:String,
        required:true,
        index:true
    },
    discription:{
        type:String,
        required:false
    },
    discount:{
        type:Number,
        required:true
    },
    min_amount:{
        type:Number,
        required:true
    },
    redeem_amount:{
        type:Number,
        required:true
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
    expiryDate:{
        type:Date,
        required:true,
        index: { expires: 0 } 
    }
})

const Coupon = mongoose.model('Coupon',couponSchema)
module.exports = Coupon