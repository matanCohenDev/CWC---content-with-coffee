import { useState, useEffect, useRef } from "react";
import styles from "./chat.module.css";
import { Send, X } from "lucide-react";
import { SendMessage, getUserIdFromToken, getMessagesBetweenUsers } from "../../../../../services/apiServices";

export interface Message {
  _id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: string;
}

interface ChatProps {
  _id: string;  // chat partner's user id
  name: string; // chat partner's name
  onclose: () => void;
}

export default function Chat(props: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const userId = getUserIdFromToken(localStorage.getItem("accessToken") || "");
  const messageContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const fetchedMessages = await getMessagesBetweenUsers(userId, props._id);
        setMessages(fetchedMessages);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };
    fetchMessages();
  }, [userId, props._id]);

  // Scroll to the bottom whenever the messages change
  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (input.trim()) {
      try {
        const response = await SendMessage(userId, props._id, input);
        const newMsg: Message = response.data;
        setMessages((prev) => [...prev, newMsg]);
        setInput("");
      } catch (error) {
        console.error("Error sending message:", error);
      }
    }
  };

  return (
    <div className={styles.chatContainer}>
      <button className={styles.closeButton} onClick={props.onclose}>
        <X size={24} />
      </button>
      <div className={styles.header}>
        <h2>{props.name}</h2>
      </div>
      <div className={styles.messageContainer} ref={messageContainerRef}>
        {messages.length > 0 ? (
          messages.map((msg) => (
            <div
              key={msg._id}
              className={`${styles.message} ${
                msg.senderId === userId ? styles.sent : styles.received
              }`}
            >
              {msg.content}
            </div>
          ))
        ) : (
          <div className={styles.noMessages}>No messages yet</div>
        )}
      </div>
      <div className={styles.inputContainer}>
        <input
          type="text"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className={styles.inputField}
        />
        <button onClick={handleSend} className={styles.sendButton}>
          <Send size={20} />
        </button>
      </div>
    </div>
  );
}
