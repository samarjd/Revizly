import React, { useState, useEffect } from 'react';
import ChatBox from '../components/ChatBox';
import Input from '../components/Input';
import SideMenu from '../components/SideMenu';
import UserMenu from '../components/UserMenu';

const Home = () => {
    const [messages, setMessages] = useState([]);
    const [currentConversationId, setCurrentConversationId] = useState(null);
    const [titles, setTitles] = useState([]);
    const [isConnected, setIsConnected] = useState(true); // Assuming the user is connected initially
    const [authToken, setAuthToken] = useState(localStorage.getItem('authToken')); // Get token from localStorage
    const [isLoading, setIsLoading] = useState(false); // New state for loader

    // Fetch messages and conversation titles when the component is mounted
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch conversation titles
                const titleResponse = await fetch('http://localhost:8000/conversations', {
                    headers: {
                        'Authorization': `Bearer ${authToken}`, // Add token in headers for authentication
                    },
                });
                const titleData = await titleResponse.json();
                setTitles(titleData.conversations);

                // Fetch messages for the first conversation if available
                if (titleData.conversations.length > 0) {
                    const firstConversation = titleData.conversations[0]; // Assuming you want to load the first conversation
                    setCurrentConversationId(firstConversation._id);

                    const messageResponse = await fetch(`http://localhost:8000/conversations/${firstConversation._id}/messages`, {
                        headers: {
                            'Authorization': `Bearer ${authToken}`,
                        },
                    });
                    const messageData = await messageResponse.json();
                    setMessages(messageData.messages);

                    //set the li with the convo id as active
                    const items = document.querySelectorAll('.title-item');
                    items.forEach(item => {
                        if (item.id === firstConversation._id) {
                            item.classList.add('active');
                        } else {
                            item.classList.remove('active');
                        }
                    });
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        if (authToken) {
            fetchData();
        }
    }, [authToken]);

    useEffect(() => {
        const chatBox = document.querySelector('.chat-box');
        if (chatBox) {
            chatBox.scrollTop = chatBox.scrollHeight;
        }
    }, [messages]);

    const handleSend = async (message, file) => {
        setIsLoading(true); // Show loader

        // Determine the payload to send (either file or text)
        const formData = new FormData();

        // Append text or file to FormData
        if (file) {
            formData.append("file", file);
        }
        if (message.trim()) {
            formData.append("text", message);  // 'text' is sent as a key with message content
        }

        // Send the user's message to the state (UI update)
        setMessages([...messages, { message: message.trim(), sender: "user" }] );

        try {
            let botResponse = null;
            let conversationId = currentConversationId;

            // Check if a current conversation is selected
            if (!currentConversationId) {
                // Create a new conversation on the backend
                const newConversationResponse = await fetch('http://localhost:8000/conversations', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        conversationTitle: message.substring(0, 20),
                    }),
                });

                const newConversation = await newConversationResponse.json();
                conversationId = newConversation._id; // Get the newly created conversation ID
                setCurrentConversationId(conversationId);

                // Add the new conversation to the titles list
                setTitles((prevTitles) => [
                    { _id: conversationId, conversationTitle: message.substring(0, 20), timestamp: new Date() },
                    ...prevTitles,
                ]);
            }

            // Send message to the /generate endpoint on port 5000 for the bot's response
            const response = await fetch("http://localhost:5000/generate", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Failed to get a response from the bot');
            }

            botResponse = await response.json();

            // Save the user's message to the backend
            const newMessage = {
                sender: 'user',
                message: message,
                conversationId: conversationId,
            };

            const msgResponse = await fetch('http://localhost:8000/messages', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newMessage),
            });

            // Check if the response is successful
            if (!msgResponse.ok) {
                throw new Error('Failed to send the message');
            }

            // Save the bot's message to the backend
            const botMessage = {
                sender: 'bot',
                botResponse: botResponse[0], // Assuming bot response is text (adjust if necessary)
                conversationId: conversationId,
            };

            await fetch('http://localhost:8000/messages', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(botMessage),
            });

            // Update messages state with both user and bot messages
            setMessages((prevMessages) => [
                ...prevMessages,
                { botResponse: botResponse[0], sender: 'bot' }, // Adjust based on response structure
            ]);
        } catch (error) {
            console.error('Error sending message:', error);
            setIsLoading(false); // Hide loader

        } finally {
            setIsLoading(false); // Hide loader
        }
    };

    const handleConversationSelect = async (conversationId) => {
        const messageResponse = await fetch(`http://localhost:8000/conversations/${conversationId}/messages`, {
            headers: {
                'Authorization': `Bearer ${authToken}`,
            },
        });
        const messageData = await messageResponse.json();
        setMessages(messageData.messages || []);
        setCurrentConversationId(conversationId);
    };

    const handleNewConversation = async () => {
        try {
            const newConversationResponse = await fetch('http://localhost:8000/conversations', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    conversationTitle: 'New Conversation',
                }),
            });

            const newConversation = await newConversationResponse.json();
            setTitles([newConversation, ...titles]);
            setCurrentConversationId(newConversation._id);
            handleConversationSelect(newConversation._id);
        } catch (error) {
            console.error('Error creating new conversation:', error);
        }
    };

    const handleDeleteConversation = async (conversationId) => {
        try {
            // Step 1: Delete the messages associated with the conversation
            const messagesResponse = await fetch(`http://localhost:8000/conversations/${conversationId}/messages`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                },
            });

            if (!messagesResponse.ok) {
                throw new Error('Failed to delete messages');
            }

            // Step 2: Delete the conversation itself
            const conversationResponse = await fetch(`http://localhost:8000/conversations/${conversationId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                },
            });

            if (!conversationResponse.ok) {
                throw new Error('Failed to delete the conversation');
            }

            // Step 3: Remove the conversation from the frontend state
            setTitles((prevTitles) => prevTitles.filter((convo) => convo._id !== conversationId));
            setCurrentConversationId(null);
            handleConversationSelect(null);
        } catch (error) {
            console.error('Error deleting conversation and messages:', error);
        }
    };

    const onChangeTitle = async (id, newTitle) => {
        try {
          const response = await fetch(`http://localhost:8000/conversations/${id}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id: id, conversationTitle: newTitle }),
          });
          if (!response.ok) {
            throw new Error('Failed to update the title');
          }

          //update UI
            setTitles((prevTitles) => prevTitles.map((title) => {
                if (title._id === id) {
                return { ...title, conversationTitle: newTitle };
                }
                return title;
            }));
        } catch (error) {
          console.error('Error updating title:', error);
        }
    };
      


    // Handle logout
    const handleLogout = () => {
        localStorage.removeItem('authToken'); // Remove the auth token
        setIsConnected(false); // Update the connection state
        setAuthToken(null); // Clear the auth token
        window.location.reload(); // Refresh the page
    };

    return (
        <div className="app">
            <SideMenu
                titles={titles}
                onConversationSelect={handleConversationSelect}
                onNewConversation={handleNewConversation}
                onDeleteConversation={handleDeleteConversation}
                onChangeTitle={onChangeTitle}
            />
            <div className="main-container">
                <UserMenu onLogout={handleLogout} />
                <div className="chat-container">
                    <ChatBox messages={messages} />
                    {isLoading && <div className="loader">Loading...</div>} {/* Loader */}
                    <Input onSend={handleSend} />
                </div>
            </div>
        </div>
    );
};

export default Home;
