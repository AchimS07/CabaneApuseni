'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import {
  type Conversation,
  type Message,
  type Booking,
  type Review,
  type UserProfile,
  type FirebaseTimestamp,
  subscribeToConversation,
  subscribeToMessages,
  sendMessage,
  acceptProposal,
  declineProposal,
  getBookingByConversation,
  getBookingReview,
  getUserProfile,
} from '@/lib/firestore';
import { useAuth } from '@/lib/hooks/useAuth';
import ReportButton from './ReportButton';

interface Props { conversationId: string }

function fmtTime(ts: FirebaseTimestamp | undefined): string {
  if (!ts) return '';
  try { return ts.toDate().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }); }
  catch { return ''; }
}

function fmtDate(ts: FirebaseTimestamp | undefined): string {
  if (!ts) return '';
  try { return ts.toDate().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }); }
  catch { return ''; }
}

export default function ConversationThread({ conversationId }: Props) {
  const { user, profile } = useAuth();
  const [conversation,  setConversation]  = useState<Conversation | null>(null);
  const [messages,      setMessages]      = useState<Message[]>([]);
  const [booking,       setBooking]       = useState<Booking | null>(null);
  const [review,        setReview]        = useState<Review | null>(null);
  const [otherUser,     setOtherUser]     = useState<UserProfile | null>(null);
  const [text,          setText]          = useState('');
  const [proposalPrice, setProposalPrice] = useState('');
  const [showProposal,  setShowProposal]  = useState(false);
  const [sending,       setSending]       = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error,         setError]         = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => subscribeToConversation(conversationId, setConversation), [conversationId]);
  useEffect(() => subscribeToMessages(conversationId, setMessages), [conversationId]);

  useEffect(() => {
    if (conversation?.status === 'accepted') {
      getBookingByConversation(conversationId).then(setBooking).catch(() => {});
    }
  }, [conversation?.status, conversationId]);

  useEffect(() => {
    if (booking?.id) getBookingReview(booking.id).then(setReview).catch(() => {});
  }, [booking?.id]);

  useEffect(() => {
    if (!conversation || !profile) return;
    const otherId = profile.role === 'guest' ? conversation.ownerId : conversation.guestId;
    getUserProfile(otherId).then(setOtherUser).catch(() => {});
  }, [conversation, profile]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendText = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !user) return;
    setSending(true); setError('');
    try {
      await sendMessage(conversationId, { senderId: user.uid, text: text.trim(), type: 'message' });
      setText('');
    } catch { setError('Failed to send message.'); }
    finally   { setSending(false); }
  }, [conversationId, text, user]);

  const sendProposal = useCallback(async () => {
    const price = parseFloat(proposalPrice);
    if (!price || price <= 0 || !user) { setError('Enter a valid price greater than 0.'); return; }
    setSending(true); setError('');
    try {
      await sendMessage(conversationId, {
        senderId: user.uid,
        text: 'Price proposal: €' + price,
        proposedPrice: price,
        type: 'proposal',
      });
      setProposalPrice(''); setShowProposal(false);
    } catch { setError('Failed to send proposal.'); }
    finally   { setSending(false); }
  }, [conversationId, proposalPrice, user]);

  const handleAccept = useCallback(async (msg: Message) => {
    if (!conversation || !msg.proposedPrice) return;
    setActionLoading(msg.id); setError('');
    try {
      await acceptProposal(
        conversationId, msg.proposedPrice,
        conversation.cabinId, conversation.guestId, conversation.ownerId,
      );
    } catch { setError('Failed to accept proposal.'); }
    finally   { setActionLoading(null); }
  }, [conversation, conversationId]);

  const handleDecline = useCallback(async () => {
    setActionLoading('decline'); setError('');
    try   { await declineProposal(conversationId); }
    catch { setError('Failed to decline.'); }
    finally { setActionLoading(null); }
  }, [conversationId]);

  if (!profile) return null;

  const isOwner = profile.role === 'owner';
  const isGuest = profile.role === 'guest';
  const isOpen  = conversation?.status === 'open';
  const statusCls =
    conversation?.status === 'accepted' ? 'badge-accepted' :
    conversation?.status === 'declined' ? 'badge-declined' : 'badge-open';

  return (
    <div className="card flex flex-col" style={{ height: '72vh', minHeight: '420px' }}>

      {/* Header */}
      <div className="p-4 border-b border-stone-200 flex items-center justify-between gap-3 shrink-0">
        <div className="min-w-0">
          <h1 className="font-semibold text-stone-800 truncate">
            {conversation?.cabinTitle ?? 'Conversation'}
          </h1>
          {otherUser && (
            <p className="text-stone-500 text-sm">
              {(isOwner ? 'Guest: ' : 'Owner: ') + otherUser.displayName}
            </p>
          )}
        </div>
        {conversation && <span className={statusCls}>{conversation.status}</span>}
      </div>

      {/* Status banners */}
      {conversation?.status === 'accepted' && (
        <div className="px-4 py-2 bg-green-50 border-b border-green-200 text-green-800 text-sm shrink-0">
          {'Booking confirmed' + (booking ? ' — €' + booking.proposedPrice : '')}
        </div>
      )}
      {conversation?.status === 'declined' && (
        <div className="px-4 py-2 bg-red-50 border-b border-red-200 text-red-800 text-sm shrink-0">
          This proposal was declined.
        </div>
      )}

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto p-4 space-y-3"
        aria-live="polite"
        aria-label="Messages"
      >
        {messages.length === 0 && (
          <p className="text-center text-stone-400 text-sm py-8">
            No messages yet. Start the conversation!
          </p>
        )}

        {messages.map((msg) => {
          const isMine = msg.senderId === user?.uid;
          return (
            <div key={msg.id} className={'flex ' + (isMine ? 'justify-end' : 'justify-start')}>
              {msg.type === 'proposal' ? (
                <div className="card p-4 border-earth-200 bg-earth-50 w-full max-w-xs">
                  <p className="text-xs font-semibold text-earth-700 mb-1 uppercase tracking-wide">
                    Price Proposal
                  </p>
                  <p className="text-2xl font-bold text-earth-800">{'€' + msg.proposedPrice}</p>
                  <p className="text-xs text-stone-400 mt-1">
                    {fmtDate(msg.createdAt) + ' ' + fmtTime(msg.createdAt)}
                  </p>
                  {isOwner && isOpen && (
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => handleAccept(msg)}
                        disabled={actionLoading === msg.id}
                        className="btn-primary text-xs py-1.5 flex-1"
                      >
                        {actionLoading === msg.id ? '…' : '✓ Accept'}
                      </button>
                      <button
                        onClick={handleDecline}
                        disabled={actionLoading !== null}
                        className="btn-danger text-xs py-1.5 flex-1"
                      >
                        {actionLoading === 'decline' ? '…' : '✗ Decline'}
                      </button>
                    </div>
                  )}
                  {!isMine && user && (
                    <div className="mt-2">
                      <ReportButton contentType="message" contentId={conversationId + '/' + msg.id} />
                    </div>
                  )}
                </div>
              ) : (
                <div className={
                  'max-w-[75%] rounded-2xl px-3 py-2 ' +
                  (isMine
                    ? 'bg-pine-700 text-white rounded-br-none'
                    : 'bg-stone-100 text-stone-800 rounded-bl-none')
                }>
                  <p className="text-sm leading-relaxed">{msg.text}</p>
                  <div className={'flex items-center gap-1 mt-0.5 ' + (isMine ? 'justify-end' : 'justify-start')}>
                    <span className={'text-xs ' + (isMine ? 'text-pine-200' : 'text-stone-400')}>
                      {fmtTime(msg.createdAt)}
                    </span>
                    {!isMine && user && (
                      <ReportButton contentType="message" contentId={conversationId + '/' + msg.id} />
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {error && <p className="px-4 py-1 text-red-600 text-sm shrink-0" role="alert">{error}</p>}

      {/* Leave review CTA */}
      {isGuest && booking && !review && (
        <div className="px-4 py-2 bg-earth-50 border-t border-earth-200 flex items-center justify-between shrink-0">
          <p className="text-earth-800 text-sm font-medium">Enjoyed your stay?</p>
          <Link href={'/reviews/new?bookingId=' + booking.id} className="btn-primary text-sm py-1.5">
            Leave a Review
          </Link>
        </div>
      )}

      {/* Input area */}
      {(isOpen || !conversation) && (
        <div className="p-4 border-t border-stone-200 shrink-0 space-y-2">
          {showProposal ? (
            <div className="flex gap-2">
              <label htmlFor="proposal-input" className="sr-only">Proposed price in euros</label>
              <input
                id="proposal-input"
                type="number"
                min="1"
                step="1"
                className="input-field"
                placeholder="Price in € (e.g. 150)"
                value={proposalPrice}
                onChange={(e) => setProposalPrice(e.target.value)}
              />
              <button onClick={sendProposal} disabled={sending} className="btn-primary shrink-0">
                {sending ? '…' : 'Send'}
              </button>
              <button onClick={() => setShowProposal(false)} className="btn-secondary shrink-0">Cancel</button>
            </div>
          ) : (
            <form onSubmit={sendText} className="flex gap-2">
              <label htmlFor="msg-input" className="sr-only">Type a message</label>
              <input
                id="msg-input"
                type="text"
                className="input-field"
                placeholder="Type a message…"
                value={text}
                onChange={(e) => setText(e.target.value)}
                disabled={sending}
              />
              <button type="submit" disabled={sending || !text.trim()} className="btn-primary shrink-0">
                {sending ? '…' : 'Send'}
              </button>
              {isGuest && (
                <button
                  type="button"
                  onClick={() => setShowProposal(true)}
                  className="btn-secondary shrink-0 whitespace-nowrap"
                >
                  Propose Price
                </button>
              )}
            </form>
          )}
        </div>
      )}
    </div>
  );
}
