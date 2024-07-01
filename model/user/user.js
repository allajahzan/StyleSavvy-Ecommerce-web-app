const mongoose = require('mongoose')
const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    phoneNo:{
        type:String,
        required:false
    },
    password:{
        type:String,
        required:false
    },
    isBlocked:{
        type:Boolean,
        default: false
    },
    referralCode:{
        type: String,
        default: function () {
            // Generate a unique order ID starting from 1000
            return 'SS' + 1 + Math.floor(Math.random() * 90000) + 'FS';
        },
        unique: true 
    },
    isGoogleAuthenticated:{
        type:Boolean,
        default:false
    },
   
},{ timestamps: true })

const User = mongoose.model('User',userSchema)
module.exports = User