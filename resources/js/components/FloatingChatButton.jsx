import React, { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useChat } from '../contexts/ChatContext';
import ChatModal from './ChatModal';

const FloatingChatButton = () => {
    const { user } = useAuth();
    const { unreadCount } = useChat();
    const [showChat, setShowChat] = useState(false);

    if (!user) return null;

    return (
        <>
            <button
                onClick={() => setShowChat(!showChat)}
                className="fixed bottom-6 right-6 w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center z-40 group"
                title="Open Chat"
            >
                <MessageCircle size={24} />
                {unreadCount > 0 && (
                    <span className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
                <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    Messages {unreadCount > 0 ? `(${unreadCount})` : ''}
                </div>
            </button>
            <ChatModal isOpen={showChat} onClose={() => setShowChat(false)} />
        </>
    );
};

export default FloatingChatButton;
