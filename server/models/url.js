const mongoose = require('mongoose');
const urlSchema = new mongoose.Schema({
    shortId: {
        type: String,
        required: true,
        unique: true,
        index:true,             //for faster search
    },
    redirectUrl: {
        type: String,
        required: true,
        trim:true,
    },
    customAlias: {                  //was it user defined
        type: Boolean,
        default: false,
    },
    visitHistory: [{
        timeStamp: { type: Date, default: Date.now },
        ip: {type :string},
        userAgent: {type :string},
    }],
    isActive: {
        type: Boolean,
        default: true,              // can manually disable the URL if needed
    },
    expiresAt:{
        type: Date,
        default: null,
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
},
    { timestamps: true }
);

const URL = mongoose.model('URL', urlSchema);
module.exports = URL;