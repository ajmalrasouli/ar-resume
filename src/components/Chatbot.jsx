import { useState, useRef } from 'react';

export default function Chatbot() {
  const [messages, setMessages] = useState([{
    role: "assistant",
    content: "Hi! I'm Ajmal's AI assistant. Ask me about his skills or experience 😊"
  }]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    setIsLoading(true);
    const newMessages = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    setInput('');

    try {
      const response = await fetch('/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!response.ok) throw new Error('API error');
      
      const data = await response.json();
      setMessages([...newMessages, { role: "assistant", content: data.text }]);
      
    } catch (error) {
      setMessages([...newMessages, { 
        role: "assistant", 
        content: "🚨 Sorry, I'm having trouble connecting. Please try again later!" 
      }]);
    }
    
    setIsLoading(false);
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // ... (same UI code as before)
}