import React, { useState } from 'react';
import '../assets/css/Input.css';

const Input = ({ onSend }) => {
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (input.trim()) {
      onSend(input);
      setInput("");
    }
  };

  return (
    <div className="input-container">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        placeholder="Type your message..."
      />
      <p className='footer'>
        Revizly can make mistakes so please verify the information before using it.
        &copy; 2024 Revizly. All rights reserved.
      </p>
    </div>
    
  );
};

export default Input;
