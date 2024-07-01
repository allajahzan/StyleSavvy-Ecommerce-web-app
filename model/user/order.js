const mongoose = require('mongoose')
const orderSchema = mongoose.Schema({
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    orderId: {
        type: String,
        default: function () {
            // Generate a unique order ID starting from 1000
            return 'OID' + 100000 + Math.floor(Math.random() * 900000) + 'SS';
        },
        unique: true // Ensure uniqueness of order IDs
    },
    orderedItems: [{
        varientId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Varient',
            required: true,
            index: true,
        },
        sizeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Size',
            required: true,
            index: true,
        },
        product_name: {
            type: String,
            required: true
        },
        quantity: {
            type: Number,
            required: true
        },
        realPrice: {
            type: Number,
            required: true
        },
        price: {
            type: Number,
            required: true
        },
        offer: {
            type: Number,
            default: 0
        },
        totalPrice: {
            type: Number,
            required: true
        },
        discountAmount: {
            type: Number,
            default: 0
        },
        totalAmount: {
            type: Number,
            default: 0
        },
        type: {
            type: String,
            required: true
        },
        category: {
            type: String,
            required: true
        },
        color: {
            type: String,
            required: true
        },
        size: {
            type: String,
            required: true
        },
        discription: {
            type: String,
            required: true
        },
        image: {
            type: String,
            required: true
        },
        paymentStatus: {
            type: String,
            default: 'Pending'
        },
        orderStatus: {
            type: String,
            default: 'Pending',
        },
        orderedDate: {
            type: Date,
            default: Date.now
        },
        shippedDate: {
            type: Date,
            required: false
        },
        deliveredDate: {
            type: Date,
            required: false
        },
        cancelledDate: {
            type: Date,
            required: false
        },
        requestedDate: {
            type: Date,
            required: false
        },
        requestAcceptedDate: {
            type: Date,
            required: false
        },
        requestRejectedDate: {
            type: Date,
            required: false
        },
        returnedDate: {
            type: Date,
            required: false
        },
        reasonForReturn: {
            type: String,
            required: false
        },
    }],
    address: {
        name: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        },
        phoneNo: {
            type: String,
            required: true
        },
        address: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        district: {
            type: String,
            required: true
        },
        pincode: {
            type: Number,
            required: true
        }
    },
    orderedDate: {
        type: Date,
        default: Date.now
    },
    totalPrice: {
        type: Number,
        default: 0
    },
    discount: {
        type: Number,
        default: 0
    },
    coupon_minAmount: {
        type: Number,
        default: 0
    },
    coupon_redeemAmount: {
        type: Number,
        default: 0
    },
    totalAmount: {
        type: Number,
        required: true
    },
    paymentMethod: {
        type: String,
        required: true
    },
    paymentStatus: {
        type: String,
        default: 'Pending'
    },
    orderStatus: {
        type: String,
        default: 'Pending',
    },

})
const Order = mongoose.model('Order', orderSchema)
module.exports = Order