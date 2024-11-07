import React, { useState, useEffect } from 'react';
import ChatBox from './components/ChatBox';
import Input from './components/Input';
import SideMenu from './components/SideMenu';
import UserMenu from './components/UserMenu';
import './App.css';

const App = () => {
  const [messages, setMessages] = useState([{ text: "Hi! How can I help you?", sender: "bot" }]);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  
  // Initialize with some example titles and dates
  const [titles, setTitles] = useState([
    { id: `1730646688646-1`, title: "Chat with Support", date: new Date(2024, 9, 10) },
    { id: `1730646688646-2`, title: "Project Updates", date: new Date(2024, 9, 25) },
    { id: `1730646688646-3`, title: "Testing Notes", date: new Date(2024, 8, 2) },
    { id: `1730646688646-4`, title: "Meeting Notes", date: new Date(2024, 8, 2) },
    { id: `1730646688646-5`, title: "Code Review", date: new Date(2024, 8, 2) },
    { id: `1730646688646-7`, title: "test", date: new Date(2024, 8, 2) },
    { id: `1730646688646-8`, title: "today's task", date: new Date(2024, 10, 3) },
  ]);

    // Inside your component
    useEffect(() => {
      const chatBox = document.querySelector('.chat-box');
      if (chatBox) {
        chatBox.scrollTop = chatBox.scrollHeight;
      }
    }, [messages]); // Run this effect when messages change

  const handleSend = (message) => {
    setMessages([...messages, { text: message, sender: "user" }]);
    getBotResponse(message);

    // Check if this is a new conversation
    if (!currentConversationId) {
      const uniqueId = `${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      setCurrentConversationId(uniqueId);

      // Check if a title with this ID already exists
      const titleExists = titles.some(title => title.id === uniqueId);

      // Add a new title only if it doesn't already exist
      if (!titleExists) {
        setTitles([{ id: uniqueId, title: message, date: new Date() }, ...titles]);
      }
    }
  };

  const getBotResponse = (message) => {
    setTimeout(() => {
      const botMessage = { text: `You said: ${message}`, sender: "bot" };
      setMessages((prevMessages) => [...prevMessages, botMessage]);
    }, 1000);
  };

  return (
    <div className="app">
      <SideMenu titles={titles} />
      <div className="main-container">
        <UserMenu />
        <div className="chat-container">
          <ChatBox messages={messages} />
          <Input onSend={handleSend} />
        </div>
      </div>
    </div>
  );
};

export default App;
