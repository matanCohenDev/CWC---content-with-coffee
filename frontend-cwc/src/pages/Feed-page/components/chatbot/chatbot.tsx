import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send } from 'lucide-react';
import styles from './chatbot.module.css';
import { generateContent } from "../../../../services/apiServices";

export default function CoffeeSmartChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [userMessage, setUserMessage] = useState('');
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'שלום! אני צ׳אט בוט קפה חכם, איך אוכל לעזור?' },
  ]);

  // Create a ref for the messages container
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleSendMessage = async () => {
    if (!userMessage) return;
    
    setMessages((prevMessages) => [
      ...prevMessages,
      { sender: 'user', text: userMessage },
    ]);
    setUserMessage('');

    try {
      const response = await generateContent(userMessage);
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: 'bot', text: response.response },
      ]);
    } catch (error) {
      console.error(error);
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: 'bot', text: 'אופס, ישנה בעיה בטעינת התוכן' },
      ]);
    }
  };

  // Scroll to the bottom whenever messages change
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className={styles.chatContainer}>
      {!isOpen && (
        <button className={styles.chatBotToggleButton} onClick={handleToggle}>
          צ׳אט חכם
        </button>
      )}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          transition={{ duration: 0.3 }}
          className={styles.chatWindow}
        >
          <div className={styles.chatCard}>
            <div className={styles.chatCardContent}>
              <div className={styles.chatHeader}>
                <div className={styles.chatTitle}>צ׳אט קפה חכם</div>
                <button className={styles.closeButton} onClick={handleToggle}>
                  סגור
                </button>
              </div>
              <div className={styles.messagesContainer} ref={messagesContainerRef}>
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={
                      msg.sender === 'bot'
                        ? styles.botMessage
                        : styles.userMessage
                    }
                  >
                    {msg.text}
                  </div>
                ))}
              </div>
              <div className={styles.inputContainer}>
                <input
                  className={styles.inputField}
                  placeholder="הקלד הודעה..."
                  value={userMessage}
                  onChange={(e) => setUserMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSendMessage();
                    }
                  }}
                />
                <button className={styles.sendButton} onClick={handleSendMessage}>
                  <Send className="w-4 h-4 mr-1" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
