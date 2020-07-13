import mongoose from 'mongoose';

const matchSchema = mongoose.Schema({
    playerOne: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'user'
    },
    playerTwo: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'user'
    },
    started: {
        type: Date,
        required: true
    },
    resulted: {
        type: Date,
    },
    winner:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    }
});

var Match = mongoose.model('match', matchSchema);

export default Match;
