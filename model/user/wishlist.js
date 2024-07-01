const mongoose = require('mongoose');
const wishlistSchema = new mongoose.Schema({
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
        size: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Size', // Reference to the Size model
            required: true,
            index:true
        },
    }]
});

const Wishlist = mongoose.model('Wishlist', wishlistSchema);
module.exports = Wishlist;
