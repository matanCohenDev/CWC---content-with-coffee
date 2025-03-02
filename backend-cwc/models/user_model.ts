import mongoose from 'mongoose';

export interface UserInterface {
    _id?: string,
    name?: string,
    email: string,
    password: string,
    bio?: string,
    favorite_coffee?: string,
    location?: string,
    joined_date?: Date,
    followers_count?: number,
    following_count?: number,
    posts_count?: number,
    refreshToken?: string[]
}

const userSchema = new mongoose.Schema({
    name:{
        type: String,
    },
    email:{
        type: String,
        required: true
    },
    password:{
        type: String,
        required: true
    },
    bio:{
        type: String,
        default: ''
    },
    favorite_coffee:{
        type: String,
        default: ''
    },
    location:{
        type: String,
        default: ''
    },
    joined_date:{
        type: Date,
        default: Date.now
    },
    followers_count:{
        type: [String],
        default: []
    },
    following_count:{
        type: [String],
        default: []
    },
    posts_count:{
        type: Number,
        default: 0
    },
    refreshToken:{
        type: Array,
        default: []
    }
});

const User = mongoose.model('User', userSchema);
export default User;