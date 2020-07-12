import mongoose from 'mongoose';
import emailType from 'mongoose-type-email';
const userSchema = mongoose.Schema({
    email: {
        type: emailType,
        required: true,
        validate:{
            validator: async (value) => {
                const emailCount = await mongoose.models.user.countDocuments({email: value });
                return !emailCount

            },
            message: 'Email already exists'
        }
    },
    hash:{
        type: String,
        required: true
    },
    salt:{
        type: String,
        required: true
    },
    elo: {
        type: Number,
        default: 400
    }

});



var User = mongoose.model('user', userSchema);


export default User;