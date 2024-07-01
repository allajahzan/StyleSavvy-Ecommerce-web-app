const mongoose = require('mongoose');
const walletSchema = new mongoose.Schema({
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index:true,
    },
    transaction_history: [{
        amount:{
           type:Number,
           required:true,
        },
        type:{
            type:String,
            required:true,
        },
        dateTime:{
            type:Date,
            default:Date.now,
        },
        discription:{
            type:String,
            required:true,
        },
    }],
    balance:{
        type:Number,
        required:true,
        default : 0
    }
});

const Wallet = mongoose.model('Wallet', walletSchema);
module.exports = Wallet;
