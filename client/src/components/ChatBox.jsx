import React, { useState } from 'react';
import '../assets/css/ChatBox.css';

const ChatBox = ({ messages = [] }) => {
  // State to track visibility of the entire bot block
  const [visibleBlocks, setVisibleBlocks] = useState({});

  // Toggle visibility of the entire block (question + options + answer)
  const toggleBlock = (index) => {
    setVisibleBlocks((prev) => ({
      ...prev,
      [index]: !prev[index], // Toggle the visibility of the entire block
    }));
  };

  let countInd = 0;
  return (
    <div className="chat-box">
      {messages.map((msg, index) => (
        <div key={index} className={`message ${msg.sender}`}>
          {/* For user messages */}
          {msg.sender === 'user' && (
            <div className="user-message">
              {msg.message ? (
                <div
                  className="user-message-text"
                  dangerouslySetInnerHTML={{ __html: msg.message }}
                />
              ) : (
                msg.fileLocation && (
                  <a
                    href={msg.fileLocation}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View file
                  </a>
                )
              )}
            </div>
          )}

          {/* For bot messages */}
          {msg.sender === 'bot' && (
            <div className="bot-response">
              <div className="bot-question-container">
                {msg.botResponse && msg.botResponse.question && (
                  <div
                    className="bot-question"
                    onClick={() => toggleBlock(index)}
                  >
                    <strong>
                      {++countInd}. {msg.botResponse.question}
                    </strong>
                  </div>
                )}

                {/* Toggle the visibility of question, options, and answer together */}
                {visibleBlocks[index] && (
                  <div className="bot-options">
                    {msg.botResponse && msg.botResponse.options && (
                      <ul className="options">
                        {msg.botResponse.options.map((option, i) => (
                          <li key={i}>{option}</li>
                        ))}
                      </ul>
                    )}

                    {msg.botResponse && msg.botResponse.answer && (
                      <div className="bot-answer">
                        <div className="answer-content">
                          {msg.botResponse.answer}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ChatBox;
