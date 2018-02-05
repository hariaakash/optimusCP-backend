var mongoose = require('mongoose');
var Schema = mongoose.Schema;


mongoose.Promise = global.Promise;


var paymentSchema = new Schema({
    handler: String,
    handlerId: String,
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    amount: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        default: 'Pending'
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    modified_at: {
        type: Date,
        default: Date.now
    }
});


module.exports = mongoose.model('Payment', paymentSchema);
