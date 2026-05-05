import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Plus, Search, Trash2, Users } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useChat } from '../contexts/ChatContext';

const ChatModal = ({ isOpen, onClose }) => {
    const { user, isAdmin } = useAuth();
    const {
        conversations,
        currentConversation,
        setCurrentConversation,
        sendMessage,
        createConversation,
        markAsRead,
        deleteConversation,
        unreadCount,
    } = useChat();

    const [messageText, setMessageText] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [showNewConv, setShowNewConv] = useState(false);
    const [newParticipant, setNewParticipant] = useState('');
    const messagesEndRef = useRef(null);

    const activeConv = conversations.find(c => c.id === currentConversation);

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [activeConv?.messages]);

    // Mark as read when conversation is opened
    useEffect(() => {
        if (currentConversation) {
            markAsRead(currentConversation);
        }
    }, [currentConversation]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!messageText.trim() || !currentConversation) return;
        sendMessage(currentConversation, messageText);
        setMessageText('');
    };

    const handleStartConversation = (participantId, participantName, participantRole) => {
        createConversation(participantId, participantName, participantRole);
        setShowNewConv(false);
        setNewParticipant('');
    };

    const filteredConversations = conversations.filter(conv => {
        const otherName = isAdmin() ? conv.customer_name : conv.admin_name;
        return otherName.toLowerCase().includes(searchTerm.toLowerCase());
    });

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl h-[80vh] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-4 flex items-center justify-between border-b border-indigo-100">
                    <div className="flex items-center gap-3">
                        <Users size={24} className="text-white" />
                        <h2 className="text-2xl font-bold text-white">Messages</h2>
                        {unreadCount > 0 && (
                            <span className="ml-2 px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                                {unreadCount}
                            </span>
                        )}
                    </div>
                    <button onClick={onClose} className="text-white hover:bg-indigo-600 p-1 rounded-lg transition">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex flex-1 overflow-hidden">
                    {/* Conversations List */}
                    <div className="w-1/3 border-r border-gray-200 flex flex-col bg-gray-50">
                        {/* Search and New Conversation */}
                        <div className="p-4 space-y-3 border-b border-gray-200">
                            <div className="relative">
                                <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search conversations..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm"
                                />
                            </div>
                            <button
                                onClick={() => setShowNewConv(!showNewConv)}
                                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                            >
                                <Plus size={16} /> New Chat
                            </button>

                            {/* New Conversation Form */}
                            {showNewConv && (
                                <div className="p-3 bg-white rounded-lg border border-indigo-200 space-y-2">
                                    <input
                                        type="text"
                                        placeholder={isAdmin() ? 'Customer name or email...' : 'Contact admin'}
                                        value={newParticipant}
                                        onChange={(e) => setNewParticipant(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm"
                                    />
                                    <button
                                        onClick={() => handleStartConversation(Date.now(), newParticipant || 'User', isAdmin() ? 'user' : 'admin')}
                                        className="w-full px-3 py-1.5 bg-indigo-600 text-white rounded text-sm font-medium hover:bg-indigo-700 transition-colors"
                                    >
                                        Start
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Conversations */}
                        <div className="flex-1 overflow-y-auto">
                            {filteredConversations.length === 0 ? (
                                <div className="p-6 text-center text-gray-500">
                                    <p className="text-sm">No conversations yet</p>
                                </div>
                            ) : (
                                filteredConversations.map(conv => {
                                    const otherName = isAdmin() ? conv.customer_name : conv.admin_name;
                                    const unreadMessages = conv.messages.filter(msg => !msg.read && msg.sender_id !== user.id).length;
                                    const isActive = conv.id === currentConversation;

                                    return (
                                        <button
                                            key={conv.id}
                                            onClick={() => setCurrentConversation(conv.id)}
                                            className={`w-full px-4 py-3 border-b border-gray-200 text-left hover:bg-gray-100 transition-colors flex items-center justify-between ${
                                                isActive ? 'bg-indigo-100 border-l-4 border-l-indigo-600' : ''
                                            }`}
                                        >
                                            <div className="flex-1 min-w-0">
                                                <p className={`font-medium truncate ${isActive ? 'text-indigo-700' : 'text-gray-900'}`}>
                                                    {otherName}
                                                </p>
                                                <p className="text-xs text-gray-500 truncate">
                                                    {conv.messages.length === 0
                                                        ? 'No messages'
                                                        : conv.messages[conv.messages.length - 1].text.substring(0, 40) + (conv.messages[conv.messages.length - 1].text.length > 40 ? '...' : '')}
                                                </p>
                                            </div>
                                            {unreadMessages > 0 && (
                                                <span className="ml-2 px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full flex-shrink-0">
                                                    {unreadMessages}
                                                </span>
                                            )}
                                        </button>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* Messages Area */}
                    <div className="w-2/3 flex flex-col">
                        {currentConversation && activeConv ? (
                            <>
                                {/* Messages */}
                                <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-white">
                                    {activeConv.messages.length === 0 ? (
                                        <div className="h-full flex items-center justify-center text-gray-500">
                                            <p className="text-center">
                                                <p className="text-4xl mb-2">💬</p>
                                                No messages yet. Say hello!
                                            </p>
                                        </div>
                                    ) : (
                                        activeConv.messages.map((msg) => {
                                            const isOwn = msg.sender_id === user.id;
                                            return (
                                                <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                                                    <div
                                                        className={`max-w-xs px-4 py-2.5 rounded-lg ${
                                                            isOwn
                                                                ? 'bg-indigo-600 text-white rounded-br-none'
                                                                : 'bg-gray-100 text-gray-900 rounded-bl-none'
                                                        }`}
                                                    >
                                                        <p className="text-xs font-semibold opacity-75 mb-1">
                                                            {msg.sender_name} {msg.sender_role === 'admin' ? '(Admin)' : ''}
                                                        </p>
                                                        <p className="break-words text-sm">{msg.text}</p>
                                                        <p className={`text-xs mt-1 opacity-60`}>
                                                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Input */}
                                <div className="border-t border-gray-200 p-4 bg-gray-50">
                                    <form onSubmit={handleSendMessage} className="flex gap-2">
                                        <input
                                            type="text"
                                            value={messageText}
                                            onChange={(e) => setMessageText(e.target.value)}
                                            placeholder="Type your message..."
                                            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                                        />
                                        <button
                                            type="submit"
                                            className="px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 font-medium"
                                        >
                                            <Send size={18} />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => deleteConversation(currentConversation)}
                                            className="px-3 py-2.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors border border-red-200"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </form>
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-500">
                                <div className="text-center">
                                    <p className="text-4xl mb-2">👥</p>
                                    <p>Select a conversation to start chatting</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatModal;
