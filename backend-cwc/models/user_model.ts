import mongoose, { Document, Types } from 'mongoose';

export interface IUser extends Document {
  _id: Types.ObjectId; 
  name?: string;
  email: string;
  password: string;
  bio?: string;
  favorite_coffee?: string;
  location?: string;
  joined_date?: Date;
  followers_count?: number;
  following_count?: number;
  posts_count?: number;
  refreshToken?: string[];
  isGoogleUser?: boolean;
}

const userSchema = new mongoose.Schema<IUser>({
  name: {
    type: String,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: false,
    validate: {
      validator: function (this: IUser, value: string) {
        if (!this.isGoogleUser && (!value || value.length === 0)) {
          return false;
        }
        return true;
      },
      message: "Password is required for non-Google users",
    },
  },
  isGoogleUser: {
    type: Boolean,
    default: false,
  },
  bio: {
    type: String,
    default: ''
  },
  favorite_coffee: {
    type: String,
    default: ''
  },
  location: {
    type: String,
    default: ''
  },
  joined_date: {
    type: Date,
    default: Date.now
  },
  followers_count: {
    type: Number,
    default: 0
  },
  following_count: {
    type: Number,
    default: 0
  },
  posts_count: {
    type: Number,
    default: 0
  },
  refreshToken: {
    type: Array,
    default: []
  }
});

const User = mongoose.model<IUser>('User', userSchema);

export default User;
