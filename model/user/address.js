const mongoose = require('mongoose');
const addressSchema = new mongoose.Schema({
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index:true
    },
    addresses: [{
        name: {
            type: String,
            required: true
        },
        streetAddress: {
            type: String,
            required: true
        },
        city:{
            type:String,
            required:true
        },
        district: {
            type: String,
            required: true
        },
        pincode: {
            type: Number,
            required: true
        },
        phoneNo: {
            type: String,
            required: true
        },
    }]
});

const Address = mongoose.model('Address', addressSchema);
module.exports = Address;
