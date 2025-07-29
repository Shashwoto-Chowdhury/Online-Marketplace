import React, { createContext, useContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { useNavigate, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { toast } from 'react-toastify';

const ChatContext = createContext();
export const useChat = () => useContext(ChatContext);

export function ChatProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [currentConv, setCurrentConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [userId, setUserId] = useState(null);           // track self id
  const [unreadConvs, setUnreadConvs] = useState(new Set());
  const navigate = useNavigate();
  const location = useLocation();
  const API = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem('token');

  // decode token once
  useEffect(() => {
    if (token) {
      const { user_id } = jwtDecode(token);
      setUserId(user_id);
    }
  }, [token]);
  
  useEffect(() => {
    const s = io(API, { auth: { token } });
    setSocket(s);
    return () => s.disconnect();
  }, [API, token]);
  
  // whenever the URL is NOT /user/messages or /user/chat, clear currentConv
  useEffect(() => {
    const p = location.pathname;
    if (!p.startsWith('/user/chat')) {
      setCurrentConv(null);
    }
  }, [location.pathname]);
  
  useEffect(() => {
    if (!socket) return;

    socket.onAny((event, ...args) => {
      console.log(`⚡️ socket event “${event}”`, args);
    });

    return () => {
      socket.offAny();
    };
  }, [socket]);
  // when changing conversation, fetch history & join room
  useEffect(() => {
    if (!currentConv || !socket) return;
    setMessages([]);
    socket.emit('join', { conversationId: currentConv.conversation_id });

    // load first page
    fetch(`${API}/users/conversations/${currentConv.conversation_id}/messages`, {
      headers: { token }
    })
      .then(r => r.json())
      .then(msgs => {
        setMessages(msgs);
        // now refresh unread counts
        loadConversations();
      });

    return () => {
      socket.emit('leave', { conversationId: currentConv.conversation_id });
    };
  }, [currentConv, socket]);

  // when we get a socket message
  useEffect(() => {
    if (!socket) return;
    socket.on('newMessage', msg => {
      if (msg.conversation_id === currentConv?.conversation_id) {
        setMessages(prev => [...prev, msg]);
        // also mark read on server
        fetch(`${API}/users/conversations/${msg.conversation_id}/messages`, {
          headers: { token }
        }).then(r => r.json())
          .then(() => loadConversations());
      } else {
        /* simply refresh counts */
        loadConversations();
      }
    });
    return () => socket.off('newMessage');
  }, [socket, currentConv]);

  // listen for sold/received only once socket is ready
  useEffect(() => {
    if (!socket) return;
    const handleSold = () => {
      if (currentConv) {
        setCurrentConv(c => ({ ...c, sold_button_clicked: true }));
      }
    };
    const handleReceived = () => {
      if (currentConv) {
        setCurrentConv(c => ({ ...c, status: 'closed' }));
      }
    };
    socket.on('sold', handleSold);
    socket.on('received', handleReceived);
    return () => {
      socket.off('sold', handleSold);
      socket.off('received', handleReceived);
    };
  }, [socket, currentConv]);

  // clear unread flag when opening a conv
  useEffect(() => {
    if (currentConv) {
      setUnreadConvs(u => {
        const copy = new Set(u);
        copy.delete(currentConv.conversation_id);
        return copy;
      });
    }
  }, [currentConv]);

  // expose a loader for conversations
  const loadConversations = async () => {
    const res = await fetch(`${API}/users/conversations`, { headers:{ token } });
    const data = await res.json();
    setConversations(data);
  };

  // start a conv…
  const startConversation = async ({ product_id, request_id, seller_id, buyer_id }) => {
    const res = await fetch(`${API}/users/conversations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', token },
      body: JSON.stringify({ product_id, request_id, seller_id, buyer_id })
    });
    const conv = await res.json();
    setCurrentConv(conv);
    navigate(`/user/chat/${conv.conversation_id}`);
    return conv;
  };

  const sendMessage = async content => {
    const m = await fetch(
      `${API}/users/conversations/${currentConv.conversation_id}/messages`,
      { method:'POST', headers:{'Content-Type':'application/json',token}, body: JSON.stringify({ content }) }
    ).then(r => r.json());
    return m;
  };

  // update markSold to send quantity + optional selling_price
  const markSold = async ({ quantity, selling_price }) => {
    const convId = currentConv.conversation_id;
    const body = { quantity };
    if (currentConv.request_id) {
      body.selling_price = selling_price;
    }
    try {
      const res = await fetch(`${API}/users/conversations/${convId}/sold`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', token },
        body: JSON.stringify(body)
      });
      if (res.ok) {
        socket.emit('markSold', { conversation_id: convId });
        toast.success('Marked as sold successfully');
      } else {
        const err = await res.json();
        toast.error(err.message || 'Failed to mark sold');
      }
    } catch(error) {
      toast.error('Error marking as sold');
    }
  };

  // update markReceived to accept review data + toast feedback
  const markReceived = async ({ rating, comment }) => {
    const convId = currentConv.conversation_id;
    try {
      // close conversation
      const res = await fetch(`${API}/users/conversations/${convId}/received`, {
        method: 'PUT', headers:{ token }
      });
      if (!res.ok) {
        const err = await res.json();
        toast.error(err.message || 'Failed to mark received');
        return;
      }
      socket.emit('markReceived', { conversation_id: convId });

      // post review
      const reviewRes = await fetch(`${API}/users/review/create`, {
        method: 'POST',
        headers: { 'Content-Type':'application/json', token },
        body: JSON.stringify({
          reviewed_person_id: currentConv.seller_id,
          review_type: 'seller',
          rating,
          comment
        })
      });
      if (reviewRes.ok) {
        toast.success('Marked received and review submitted');
      } else {
        const err = await reviewRes.json();
        toast.error(err.message || 'Received marked but review failed');
      }
    } catch (error) {
      toast.error('Error marking received');
    }
  };

  // delete a message
  const deleteMessage = async messageId => {
    try {
      const res = await fetch(
        `${API}/users/conversations/${currentConv.conversation_id}/messages/${messageId}`,
        { method: 'DELETE', headers: { token } }
      );
      if (res.ok) {
        toast.success('Message deleted');
      }
      else {
        const err = await res.json();
        toast.error(err.error || 'Failed to delete message');
      }
    } catch {
      toast.error('Failed to delete message');
    }
  };

  // report a message
  const reportMessage = async (messageId, reason, details) => {
    try {
      const res = await fetch(
        `${API}/users/messagereport/upload?message_id=${messageId}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', token },
          body: JSON.stringify({ reason, details })
        }
      );
      if (!res.ok) throw new Error();
      toast.success('Report submitted');
    } catch {
      toast.error('Failed to submit report');
    }
  };

  // listen for deletes and remove in real-time
  useEffect(() => {
    if (!socket) return;
    const handleDelete = payload => {
      // handle both snake_case and camelCase keys:
      const deletedId = payload.message_id ?? payload.messageId;
      if (!deletedId) return;
      setMessages(prev => {
        const filtered = prev.filter(m => Number(m.message_id) !== Number(deletedId));
        
        return filtered;
      });
    };

    socket.on('messageDeleted', handleDelete);
    return () => {
      socket.off('messageDeleted');
    };
  }, [socket]);

  // once socket+userId are set, register for notifications
  useEffect(() => {
    if (socket && userId) {
      socket.emit('register', { userId });
      console.log('Socket registered with userId:', userId);
    }
  }, [socket, userId]);

  // listen for real-time notifications (sold-out toasts)
  useEffect(() => {
    if (!socket) return;
    const handleNotification = ({ content }) => {
      console.log('Notification received:', content);
      toast.info(content);
    };
    socket.on('newNotification', handleNotification);
    return () => socket.off('newNotification', handleNotification);
  }, [socket]);

  return (
    <ChatContext.Provider value={{
      userId,
      conversations, loadConversations,
      currentConv, setCurrentConv, messages,
      startConversation, sendMessage, markSold, markReceived,
      unreadCount: unreadConvs.size,
      unreadConvs,
      deleteMessage,
      reportMessage
    }}>
      {children}
    </ChatContext.Provider>
  );
}