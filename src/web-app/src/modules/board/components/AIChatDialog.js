import React, {useState} from 'react';
import {Button, Card, Textarea} from 'flowbite-react';

const AIChatDialog = () => {
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState([]);
    const placeholderResponse = 'AI: Thinking...';

    const handleInputChange = (event) => {
        setMessage(event.target.value);
    };

    const handleUserMessage = async (message) => {
        if(message === '')
            return;
        setMessages((prevMessages) => [
            ...prevMessages,
            { text: message, sender: 'user' },
        ]);
        setMessages((prevMessages) => [
            ...prevMessages,
            { text: placeholderResponse, sender: 'ai' },
        ]);
        const aiResponse = await simulateAIResponse(message);

        setMessages((prevMessages) => {
            const newMessages = [...prevMessages];
            newMessages[newMessages.length - 1] = { text: aiResponse, sender: 'ai' }
            return newMessages;
        });
        setMessage('');
    };

    const simulateAIResponse = async (userMessage) => {
        const response = await fetch('http://localhost:8081/ai/generate?message=' + userMessage, {
            method: 'GET',
        });

        if (response.ok) {
            const data = await response.json();
            return data.generation;
        } else {
            console.error('Error fetching AI response:', response.status);
            return 'AI: An error occurred. Please try again later.';
        }
    };

    return (
        <div className="ai-chat-dialog h-screen">
            <div className="ai-chat-messages overflow-y-auto h-4/6">
                {messages.map((message, index) => (
                    <Card key={index} className={`ai-chat-message bg-gray-${message.sender === 'user' ? '400' : '100'} m-2`}>
                        <div className={` text-gray-700 dark:text-gray-50 text-${message.sender === 'user' ? 'left' : 'right'}`}>
                            {message.text}
                        </div>
                    </Card>
                ))}
            </div>
            <div className="ai-chat-input flex items-center gap-2 h-1/6">
                <Textarea
                    type="text"
                    value={message}
                    placeholder="Type your message..."
                    className="flex-grow rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                    onChange={handleInputChange}
                    rows={3}
                />
                <Button onClick={() => handleUserMessage(document.querySelector('.ai-chat-input textarea').value)}>
                    >
                </Button>
            </div>
        </div>
    );
};

export {AIChatDialog};