import React, {useState} from 'react';
import {Textarea} from 'flowbite-react';

const AIChatDialog = ({ onAIAction }) => {
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState('');


    const handleInputChange = (event) => {
        setMessage(event.target.value);
    };

    const handleUserMessage = async () => {
        if(message.trim() === '')
            return;
        
        const userMsg = message;
        setMessage('');
        
        setMessages((prevMessages) => [
            ...prevMessages,
            { text: userMsg, sender: 'user' },
            { text: 'Thinking...', sender: 'ai' },
        ]);
        
        const aiResponse = await simulateAIResponse(userMsg);

        setMessages((prevMessages) => {
            const newMessages = [...prevMessages];
            newMessages[newMessages.length - 1] = { ...aiResponse, sender: 'ai' }
            return newMessages;
        });
    };

    const simulateAIResponse = async (userMessage) => {
        try {
            const response = await fetch('http://localhost:8081/ai/generate?message=' + encodeURIComponent(userMessage), {
                method: 'GET',
            });

            if (response.ok) {
                const data = await response.json();
                try {
                    // Check if the response contains a JSON proposal
                    const parsed = JSON.parse(data.generation);
                    return { text: 'I have a proposal for you:', proposal: parsed };
                } catch {
                    return { text: data.generation };
                }
            } else {
                throw new Error('API failed');
            }
        } catch (e) {
            return { text: 'AI Service unavailable. Simulation active.' };
        }
    };

    const handleApproveProposal = (proposal) => {
        if (onAIAction) {
            onAIAction(proposal);
        }
        setMessages((prev) => prev.map(m => m.proposal === proposal ? { ...m, status: 'approved' } : m));
    };

    const handleRejectProposal = (proposal) => {
        setMessages((prev) => prev.map(m => m.proposal === proposal ? { ...m, status: 'rejected' } : m));
    };

    return (
        <div className="flex flex-col h-[500px]">
            <div className="flex-grow overflow-y-auto space-y-4 mb-6 pr-2 scrollbar-thin scrollbar-thumb-accent/20">
                {messages.length === 0 && (
                    <div className="text-center py-10">
                        <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-xl">🧠</span>
                        </div>
                        <p className="text-text-tertiary text-xs font-medium px-6">
                            I am your architecture assistant. Ask me to refine your models or generate code.
                        </p>
                    </div>
                )}
                {messages.map((msg, index) => (
                    <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] p-4 rounded-md text-sm ${
                            msg.sender === 'user' 
                            ? 'bg-accent text-background font-bold' 
                            : 'bg-surface-elevated border border-border-subtle text-text-primary font-medium'
                        }`}>
                            <div>{msg.text}</div>
                            {msg.proposal && !msg.status && (
                                <div className="mt-3 flex gap-2">
                                    <button onClick={() => handleApproveProposal(msg.proposal)} className="px-3 py-1 bg-green-600 text-white rounded">Approve</button>
                                    <button onClick={() => handleRejectProposal(msg.proposal)} className="px-3 py-1 bg-red-600 text-white rounded">Reject</button>
                                </div>
                            )}
                            {msg.status && (
                                <div className="mt-2 font-bold text-xs uppercase">{msg.status}</div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
            <div className="space-y-3">
                <Textarea
                    value={message}
                    placeholder="Refactor this aggregate..."
                    className="w-full bg-surface-elevated border-border-subtle text-text-primary focus:border-accent focus:ring-accent/20 placeholder-text-tertiary/50 rounded-md text-sm"
                    onChange={handleInputChange}
                    rows={3}
                />
                <button 
                    onClick={handleUserMessage}
                    className="w-full py-3 bg-accent hover:bg-accent-hover text-background font-bold rounded-sm transition-all uppercase tracking-widest text-xs"
                >
                    SEND PROMPT
                </button>
            </div>
        </div>
    );
};

export {AIChatDialog};