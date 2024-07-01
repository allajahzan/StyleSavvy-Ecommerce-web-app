const mongoose = require('mongoose');
const cartSchema = new mongoose.Schema({
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index:true,
    },
    items: [{
        varient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Varient', // Reference to the Variant model
            required: true,
            index:true
        },
        quantity: {
            type: Number,
            required: true
        },
        price:{
            type:Number,
            required:true
        },
        offer:{
            type:Number,
            required:false
        },
        size: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Size', // Reference to the Size model
            required: true,
            index:true
        },
        isAvailable:{
            type:Boolean,
            default:true,
            index:true,
        }
    }]
});

const Cart = mongoose.model('Cart', cartSchema);
module.exports = Cart;
