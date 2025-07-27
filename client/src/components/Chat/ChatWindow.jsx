import React, { useEffect, useRef, useState } from 'react';
import { useChat } from '../../context/ChatContext';
import { FiTag, FiSend, FiShoppingCart, FiStar } from 'react-icons/fi';
import { FaTrash, FaFlag } from 'react-icons/fa';
import './Chat.css';
import { useParams } from 'react-router-dom';

export default function ChatWindow() {
  const { id } = useParams();
  const {
    currentConv, messages, sendMessage,
    markSold, markReceived, userId,
    deleteMessage, reportMessage
  } = useChat();
  const { conversations, loadConversations, setCurrentConv } = useChat();
  const [draft, setDraft] = useState('');
  const bottomRef = useRef();

  // modal states
  const [showSoldModal, setShowSoldModal] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [sellingPrice, setSellingPrice] = useState('');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportTargetId, setReportTargetId] = useState(null);
  const [reportReason, setReportReason] = useState('');
  const [reportDetails, setReportDetails] = useState('');

  // if we landed here fresh (e.g. F5), pick up conv from URL
  useEffect(() => {
    if (!currentConv && id) {
      const conv = conversations.find(c => String(c.conversation_id) === id);
      if (conv) {
        setCurrentConv(conv);
      } else {
        // if your list is empty, load & then it will auto‐hydrate above
        loadConversations();
      }
    }
  }, [id, currentConv, conversations]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!currentConv) {
    return <p className="chat-placeholder">Select a conversation first.</p>;
  }

  const handleSend = async () => {
    if (!draft.trim()) return;
    await sendMessage(draft);
    setDraft('');
  };

  const openReportModal = msgId => {
    setReportTargetId(msgId);
    setReportReason('');
    setReportDetails('');
    setShowReportModal(true);
  };

  return (
    <div className="chat-page-container dark-theme">
      <div className="chat-window">
        <header className="chat-header">
          <h3>
            <FiTag size={22} className="chat-header-icon"/>
            <span className="chat-header-title">
              Chat about {currentConv.product_title || currentConv.request_title}
            </span>
          </h3>
          {currentConv.sold_button_clicked ? (
            currentConv.buyer_id === userId && currentConv.status !== 'closed' && (
              <button
                className="btn-receive"
                onClick={() => setShowReviewModal(true)}
              >
                <FiStar size={18} /> Mark Received
              </button>
            )
          ) : (
            currentConv.seller_id === userId && (
              <button
                className="btn-sell"
                onClick={() => setShowSoldModal(true)}
              >
                <FiShoppingCart size={18} /> Mark Sold
              </button>
            )
          )}
        </header>

        <div className="chat-messages">
          {messages.map(m => (
            <div
              key={m.message_id}
              className={`chat-msg ${m.sender_id === userId ? 'outgoing' : 'incoming'}`}
            >
              <p>{m.content}</p>
              <time>
                {new Date(m.timestamp)
                  .toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })}
              </time>
              <div className="msg-actions">
                {m.sender_id === userId ? (
                  <FaTrash
                    className="delete-icon"
                    onClick={() => deleteMessage(m.message_id)}
                  />
                ) : (
                  <FaFlag
                    className="report-icon"
                    onClick={() => openReportModal(m.message_id)}
                  />
                )}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {currentConv.status !== 'closed' && (
          <div className="chat-input-wrapper">
            <input
              className="chat-input-field"
              value={draft}
              onChange={e => setDraft(e.target.value)}
              placeholder="Type a message…"
            />
            <button className="chat-send-btn" onClick={handleSend}>
              <FiSend size={20}/>
            </button>
          </div>
        )}
      </div>

      {/* Sold Modal */}
      {showSoldModal && (
        <div className="chat-modal-overlay" onClick={() => setShowSoldModal(false)}>
          <div className="chat-modal" onClick={e => e.stopPropagation()}>
            <h4>Enter quantity sold</h4>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={e => setQuantity(Number(e.target.value))}
            />
            {currentConv.request_id && (
              <>
                <h4>Set Selling Price</h4>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={sellingPrice}
                  onChange={e => setSellingPrice(e.target.value)}
                />
              </>
            )}
            <div className="modal-actions">
              <button onClick={() => setShowSoldModal(false)}>Cancel</button>
              <button
                onClick={async () => {
                  await markSold({ quantity, selling_price: sellingPrice });
                  setShowSoldModal(false);
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && (
        <div className="chat-modal-overlay" onClick={() => setShowReviewModal(false)}>
          <div className="chat-modal" onClick={e => e.stopPropagation()}>
            <h4>Review Seller</h4>
            <label>
              Rating:
              <select value={rating} onChange={e => setRating(e.target.value)}>
                {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} ★</option>)}
              </select>
            </label>
            <label>
              Comment:
              <textarea
                rows="3"
                value={comment}
                onChange={e => setComment(e.target.value)}
              />
            </label>
            <div className="modal-actions">
              <button onClick={() => setShowReviewModal(false)}>Cancel</button>
              <button
                onClick={async () => {
                  await markReceived({ rating, comment });
                  setShowReviewModal(false);
                }}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && (
        <div
          className="chat-modal-overlay"
          onClick={() => setShowReportModal(false)}
        >
          <div className="chat-modal" onClick={e => e.stopPropagation()}>
            <h4>Report Message</h4>
            <label>
              Reason:
              <select
                value={reportReason}
                onChange={e => setReportReason(e.target.value)}
              >
                <option value="">Select a reason…</option>
                <option>Harassment or bullying</option>
                <option>Hate speech</option>
                <option>Spam or unsolicited content</option>
                <option>Threats or violence</option>
                <option>Scam or fraud attempt</option>
                <option>Impersonation</option>
                <option>False information or misinformation</option>
                <option>Offensive or inappropriate language</option>
                <option>Sharing personal or sensitive information</option>
                <option>Self-harm or suicide concern</option>
                <option>Child exploitation or abuse</option>
                <option>Terrorism or violent extremism</option>
                <option>Promoting illegal activities</option>
                <option>Message not related to the topic / off-topic</option>
                <option>Other</option>
              </select>
            </label>
            <label>
              Details (optional):
              <textarea
                rows="3"
                value={reportDetails}
                onChange={e => setReportDetails(e.target.value)}
              />
            </label>
            <div className="modal-actions">
              <button onClick={() => setShowReportModal(false)}>
                Cancel
              </button>
              <button
                disabled={!reportReason}
                onClick={async () => {
                  await reportMessage(
                    reportTargetId,
                    reportReason,
                    reportDetails
                  );
                  setShowReportModal(false);
                }}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}