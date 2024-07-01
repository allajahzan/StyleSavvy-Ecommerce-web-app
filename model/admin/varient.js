const mongoose = require('mongoose')
const varientSchema = new mongoose.Schema({
    product:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'Product',
        required:true,
        index:true
    },
    images:{
        type:Array,
        required:true
    },
    size:{
        type: [mongoose.Schema.Types.ObjectId],
        ref:'Size',
        required:true,
        index:true
    },
    color:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'Color',
        required:true,
        index:true
    },
    colors : {
       type:[mongoose.Schema.Types.ObjectId],
       ref:'Color',
       required:false,
       index:true
    },
    stock:{
        type:[Number],
        required:true
    },
    actualPrice:{
        type :Number,
        required:true
    },
    price:{
        type:[Number],
        required:true
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
        index:true,
    },
    
})

const Varient = mongoose.model('Varient',varientSchema)
module.exports = Varient