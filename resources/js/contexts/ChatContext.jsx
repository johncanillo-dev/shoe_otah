import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
    const { user } = useAuth();
    const [conversations, setConversations] = useState([]);
    const [currentConversation, setCurrentConversation] = useState(null);
    const [unreadCount, setUnreadCount] = useState(0);

    // Initialize conversations from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('shoe_otah_chats');
        if (saved) {
            try {
                setConversations(JSON.parse(saved));
            } catch (err) {
                console.error('Failed to load chats:', err);
            }
        }
    }, []);

    // Save conversations to localStorage
    useEffect(() => {
        if (conversations.length > 0) {
            localStorage.setItem('shoe_otah_chats', JSON.stringify(conversations));
        }
    }, [conversations]);

    // Calculate unread count
    useEffect(() => {
        const count = conversations.reduce((sum, conv) => {
            return sum + (conv.messages ? conv.messages.filter(msg => !msg.read && msg.sender_id !== user?.id).length : 0);
        }, 0);
        setUnreadCount(count);
    }, [conversations, user?.id]);

    const sendMessage = (conversationId, text) => {
        const newConversations = conversations.map(conv => {
            if (conv.id === conversationId) {
                return {
                    ...conv,
                    messages: [
                        ...conv.messages,
                        {
                            id: Date.now(),
                            sender_id: user.id,
                            sender_name: user.name,
                            sender_role: user.role,
                            text,
                            timestamp: new Date().toISOString(),
                            read: false,
                        }
                    ],
                    updated_at: new Date().toISOString(),
                };
            }
            return conv;
        });
        setConversations(newConversations);
    };

    const createConversation = (participantId, participantName, participantRole) => {
        const existingConv = conversations.find(
            conv => (conv.customer_id === participantId || conv.customer_id === user.id) &&
                     (conv.admin_id === participantId || conv.admin_id === user.id)
        );

        if (existingConv) {
            setCurrentConversation(existingConv.id);
            return existingConv.id;
        }

        const newConv = {
            id: Date.now(),
            customer_id: user.role === 'user' ? user.id : participantId,
            customer_name: user.role === 'user' ? user.name : participantName,
            admin_id: user.role === 'admin' ? user.id : participantId,
            admin_name: user.role === 'admin' ? user.name : participantName,
            messages: [],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };

        setConversations([...conversations, newConv]);
        setCurrentConversation(newConv.id);
        return newConv.id;
    };

    const markAsRead = (conversationId) => {
        const newConversations = conversations.map(conv => {
            if (conv.id === conversationId) {
                return {
                    ...conv,
                    messages: conv.messages.map(msg => ({
                        ...msg,
                        read: true,
                    })),
                };
            }
            return conv;
        });
        setConversations(newConversations);
    };

    const deleteConversation = (conversationId) => {
        setConversations(conversations.filter(conv => conv.id !== conversationId));
        if (currentConversation === conversationId) {
            setCurrentConversation(null);
        }
    };

    return (
        <ChatContext.Provider
            value={{
                conversations,
                currentConversation,
                setCurrentConversation,
                sendMessage,
                createConversation,
                markAsRead,
                deleteConversation,
                unreadCount,
            }}
        >
            {children}
        </ChatContext.Provider>
    );
};

export const useChat = () => {
    const context = useContext(ChatContext);
    if (!context) {
        throw new Error('useChat must be used within ChatProvider');
    }
    return context;
};
