import React, { useState } from 'react';
import '../assets/css/Input.css';

const Input = ({ onSend, onFileUpload }) => {
  const [input, setInput] = useState("");  // For text input
  const [file, setFile] = useState(null);  // For the uploaded file

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const preSend = (input, file) => {
    if (input.trim() || file) {
      onSend(input, file);
      setInput("");
      setFile(null);
    }
  };

  return (
    <div className="input-container">
      {/* Text input */}
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && preSend(input, file)} // Pass text and file to onSend
        placeholder="Type your message..."
      />

      {/* File input with SVG icon */}
      <label className="file-label" htmlFor="file-upload">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path fill-rule="evenodd" clip-rule="evenodd" d="M9 7C9 4.23858 11.2386 2 14 2C16.7614 2 19 4.23858 19 7V15C19 18.866 15.866 22 12 22C8.13401 22 5 18.866 5 15V9C5 8.44772 5.44772 8 6 8C6.55228 8 7 8.44772 7 9V15C7 17.7614 9.23858 20 12 20C14.7614 20 17 17.7614 17 15V7C17 5.34315 15.6569 4 14 4C12.3431 4 11 5.34315 11 7V15C11 15.5523 11.4477 16 12 16C12.5523 16 13 15.5523 13 15V9C13 8.44772 13.4477 8 14 8C14.5523 8 15 8.44772 15 9V15C15 16.6569 13.6569 18 12 18C10.3431 18 9 16.6569 9 15V7Z" fill="currentColor"></path>
        </svg>
      </label>
      <input
        id="file-upload"
        type="file"
        onChange={handleFileChange}
        accept=".txt"
      />

      {/* Send button */}
      <button onClick={() => preSend(input, file)}>Send</button>
    </div>
  );
};

export default Input;
