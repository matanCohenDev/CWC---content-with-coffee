
import mongoose from "mongoose";

export interface MessageInterface{
    messageId?: string;
    senderId: string;
    receiverId: string;
    content: string;
    createdAt?: Date;
    messageRead: boolean;
}
const messageSchema = new mongoose.Schema({
  senderId: {
    type: String,
    required: true,
  },
    receiverId: {
        type: String,
        required: true,
    },
    content:{
        type: String,
        required: true,
    },
    messageRead:{
        type: Boolean,
        required: true,
        default: false,
    },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Message = mongoose.model("Message", messageSchema);
export default Message;

