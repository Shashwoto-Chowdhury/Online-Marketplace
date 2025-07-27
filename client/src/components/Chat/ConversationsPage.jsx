import React, { useEffect } from 'react';
import { useChat } from '../../context/ChatContext';
import { useNavigate } from 'react-router-dom';
import { FaCommentDots, FaUserCircle } from 'react-icons/fa';
import './Chat.css';

export default function ConversationsPage() {
  const {
    conversations,
    loadConversations,
    currentConv,
    setCurrentConv,
    userId,
    unreadConvs
  } = useChat();
  const navigate = useNavigate();

  useEffect(() => {
    loadConversations();
  }, []);

  return (
    <div className="chat-page-container dark-theme">
      <div className="chat-list-wrapper">
        <div className="chat-list-header">
          <FaCommentDots className="chat-list-header-icon" />
          <h2>My Conversations</h2>
        </div>
        <ul className="chat-list">
          {conversations.map(conv => {
            const isActive = conv.conversation_id === currentConv?.conversation_id;
            // const isUnread = unreadConvs.has(conv.conversation_id);
            const otherName = conv.buyer_id === userId ? conv.seller_name : conv.buyer_name;
            return (
              <li
                key={conv.conversation_id}
                className={`chat-list-item ${isActive ? 'active' : ''} ${conv.unread_count > 0 ? 'unread' : ''}`}
                onClick={() => {
                  setCurrentConv(conv);
                  navigate(`/user/chat/${conv.conversation_id}`);
                }}
              >
                <FaUserCircle className="chat-avatar" />
                <div className="chat-info">
                  <span className="chat-name">{otherName}</span>
                  <span className="chat-time">
                    {new Date(conv.last_message).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                <span className={`chat-status ${conv.status}`}>{conv.status}</span>
                {conv.unread_count > 0 && <span className="chat-unread-dot" />}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}