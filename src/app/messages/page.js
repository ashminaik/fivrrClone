'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/app/components/AuthProvider';
import { useRouter } from 'next/navigation';

function getAvatarColor(name) {
    const colors = ['#3b82f6', '#d946ef', '#f59e0b', '#ef4444', '#06b6d4', '#8b5cf6', '#ec4899', '#14b8a6'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
}

function getStatusBadge(status) {
    const map = {
        pending: 'badge-warning',
        in_progress: 'badge-info',
        delivered: 'badge-info',
        completed: 'badge-success',
        cancelled: 'badge-neutral',
    };
    return map[status] || 'badge-neutral';
}

function formatTime(date) {
    const d = new Date(date);
    const now = new Date();
    const diff = now - d;
    if (diff < 86400000 && d.getDate() === now.getDate()) {
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    if (diff < 604800000) {
        return d.toLocaleDateString('en-US', { weekday: 'short' });
    }
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function MessagesPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [conversations, setConversations] = useState([]);
    const [dataLoading, setDataLoading] = useState(true);
    const [activeOrderId, setActiveOrderId] = useState(null);

    const [messages, setMessages] = useState([]);
    const [content, setContent] = useState('');
    const [sendLoading, setSendLoading] = useState(false);
    const [chatLoading, setChatLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const pollRef = useRef(null);

    useEffect(() => {
        if (!loading && !user) router.push('/login');
    }, [loading, user, router]);

    // Fetch all conversations — grouped by the other person
    useEffect(() => {
        if (!user) return;

        const fetchConversations = async () => {
            try {
                const [buyerRes, sellerRes] = await Promise.all([
                    fetch(`/api/orders?buyerId=${user.id}`),
                    fetch(`/api/orders?sellerId=${user.id}`),
                ]);
                const buyerOrders = await buyerRes.json();
                const sellerOrders = await sellerRes.json();
                const allOrders = [
                    ...(Array.isArray(buyerOrders) ? buyerOrders : []),
                    ...(Array.isArray(sellerOrders) ? sellerOrders : []),
                ];

                // Deduplicate orders by id
                const uniqueOrders = [];
                const seenIds = new Set();
                for (const o of allOrders) {
                    if (!seenIds.has(o.id)) {
                        seenIds.add(o.id);
                        uniqueOrders.push(o);
                    }
                }

                // Fetch messages and gig info for all orders
                const orderDetails = await Promise.all(
                    uniqueOrders.map(async (order) => {
                        const [msgsRes, gigRes] = await Promise.all([
                            fetch(`/api/messages?orderId=${order.id}`),
                            fetch(`/api/gigs/${order.gigId}`).catch(() => null),
                        ]);
                        const msgs = await msgsRes.json().catch(() => []);
                        const gig = gigRes ? await gigRes.json().catch(() => null) : null;
                        const messageList = Array.isArray(msgs) ? msgs : [];
                        const lastMsg = messageList.length > 0 ? messageList[messageList.length - 1] : null;

                        return {
                            order,
                            gig,
                            messageList,
                            lastMsg,
                        };
                    })
                );

                // Group by the other person's ID — pick the order with the most recent message
                const groupedByPerson = {};
                for (const detail of orderDetails) {
                    const { order, gig, messageList, lastMsg } = detail;
                    const otherId = order.buyerId === user.id ? order.sellerId : order.buyerId;
                    const lastTime = lastMsg?.createdAt || order.createdAt;

                    if (!groupedByPerson[otherId]) {
                        groupedByPerson[otherId] = { detail, lastTime, totalMessages: messageList.length, allOrderIds: [order.id] };
                    } else {
                        groupedByPerson[otherId].allOrderIds.push(order.id);
                        groupedByPerson[otherId].totalMessages += messageList.length;
                        // Keep the one with the most recent activity
                        if (new Date(lastTime) > new Date(groupedByPerson[otherId].lastTime)) {
                            groupedByPerson[otherId].detail = detail;
                            groupedByPerson[otherId].lastTime = lastTime;
                        }
                    }
                }

                // Fetch names for each unique person
                const personIds = Object.keys(groupedByPerson);
                const nameMap = {};
                await Promise.all(
                    personIds.map(async (id) => {
                        try {
                            const uRes = await fetch(`/api/users?id=${id}`);
                            const uData = await uRes.json();
                            if (uData?.name) nameMap[id] = uData.name;
                        } catch {}
                    })
                );

                // Build conversation list
                const convos = personIds.map(otherId => {
                    const { detail, lastTime, totalMessages, allOrderIds } = groupedByPerson[otherId];
                    const { order, gig, lastMsg } = detail;
                    return {
                        orderId: order.id,
                        allOrderIds,
                        orderStatus: order.status,
                        gigTitle: gig?.title || 'Unknown Service',
                        otherName: nameMap[otherId] || 'User',
                        otherId,
                        lastMessage: lastMsg?.content || null,
                        lastMessageTime: lastTime,
                        messageCount: totalMessages,
                        isBuyer: order.buyerId === user.id,
                        buyerId: order.buyerId,
                        sellerId: order.sellerId,
                    };
                });

                convos.sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime));
                setConversations(convos);

                // Auto-select from URL param or first conversation
                const orderParam = typeof window !== 'undefined'
                    ? new URLSearchParams(window.location.search).get('order')
                    : null;
                if (orderParam) {
                    // Find conversation that contains this order
                    const match = convos.find(c => c.allOrderIds.includes(orderParam));
                    if (match) {
                        setActiveOrderId(match.orderId);
                    } else if (convos.length > 0 && !activeOrderId) {
                        setActiveOrderId(convos[0].orderId);
                    }
                } else if (convos.length > 0 && !activeOrderId) {
                    setActiveOrderId(convos[0].orderId);
                }
            } catch (err) {
                console.error('Error fetching conversations:', err);
            } finally {
                setDataLoading(false);
            }
        };

        fetchConversations();
    }, [user]);

    // Fetch messages for active conversation
    const fetchMessages = useCallback(async () => {
        if (!activeOrderId) return;
        try {
            const res = await fetch(`/api/messages?orderId=${activeOrderId}`);
            const msgs = await res.json();
            if (Array.isArray(msgs)) {
                setMessages(prev => {
                    if (msgs.length !== prev.length) return msgs;
                    return prev;
                });
            }
        } catch {}
    }, [activeOrderId]);

    useEffect(() => {
        if (!activeOrderId) return;
        setChatLoading(true);
        fetchMessages().finally(() => setChatLoading(false));
    }, [activeOrderId, fetchMessages]);

    // Poll for new messages every 3 seconds
    useEffect(() => {
        if (!activeOrderId) return;
        pollRef.current = setInterval(fetchMessages, 3000);
        return () => clearInterval(pollRef.current);
    }, [activeOrderId, fetchMessages]);

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = async () => {
        if (!content.trim() || !activeOrderId || !user) return;
        const convo = conversations.find(c => c.orderId === activeOrderId);
        if (!convo) return;

        setSendLoading(true);
        try {
            const receiverId = convo.isBuyer ? convo.sellerId : convo.buyerId;
            const res = await fetch('/api/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    orderId: activeOrderId,
                    senderId: user.id,
                    receiverId,
                    content: content.trim(),
                }),
            });
            if (res.ok) {
                const msg = await res.json();
                setMessages(prev => [...prev, msg]);
                setContent('');
                setConversations(prev => prev.map(c =>
                    c.orderId === activeOrderId
                        ? { ...c, lastMessage: content.trim(), lastMessageTime: new Date().toISOString(), messageCount: c.messageCount + 1 }
                        : c
                ));
            }
        } catch (err) {
            console.error('Send failed', err);
        } finally {
            setSendLoading(false);
        }
    };

    const activeConvo = conversations.find(c => c.orderId === activeOrderId);

    if (loading || dataLoading) {
        return (
            <div className="section">
                <div className="container">
                    <div className="chat-layout">
                        <div className="chat-sidebar">
                            <div className="chat-sidebar-header">
                                <div className="skeleton" style={{ height: 24, width: 120 }}></div>
                            </div>
                            {[1, 2, 3].map(i => (
                                <div key={i} className="skeleton" style={{ height: 72, margin: '0.5rem 0.75rem', borderRadius: 10 }}></div>
                            ))}
                        </div>
                        <div className="chat-main">
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--color-text-muted)' }}>
                                Loading...
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="section" style={{ paddingTop: '1.5rem', paddingBottom: '1.5rem' }}>
            <div className="container">
                <div className="chat-layout">
                    {/* Left sidebar - Conversations list */}
                    <div className="chat-sidebar">
                        <div className="chat-sidebar-header">
                            <h2>Messages</h2>
                            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                                {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
                            </span>
                        </div>

                        {conversations.length === 0 ? (
                            <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💬</div>
                                <p style={{ fontSize: '0.85rem' }}>No conversations yet</p>
                            </div>
                        ) : (
                            <div className="chat-sidebar-list">
                                {conversations.map(convo => (
                                    <div
                                        key={convo.otherId}
                                        className={`chat-sidebar-item ${activeOrderId === convo.orderId ? 'active' : ''}`}
                                        onClick={() => setActiveOrderId(convo.orderId)}
                                    >
                                        <div
                                            className="avatar"
                                            style={{ background: getAvatarColor(convo.otherName), width: 42, height: 42, fontSize: '0.9rem', flexShrink: 0 }}
                                        >
                                            {convo.otherName[0]}
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{convo.otherName}</span>
                                                <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', flexShrink: 0 }}>
                                                    {formatTime(convo.lastMessageTime)}
                                                </span>
                                            </div>
                                            <div style={{
                                                fontSize: '0.8rem',
                                                color: 'var(--color-text-muted)',
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                marginTop: '0.15rem',
                                            }}>
                                                {convo.lastMessage || 'No messages yet'}
                                            </div>
                                            <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: '0.2rem' }}>
                                                {convo.gigTitle}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right panel - Active chat */}
                    <div className="chat-main">
                        {!activeConvo ? (
                            <div className="chat-empty-state">
                                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💬</div>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>Select a conversation</h3>
                                <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                                    Choose a conversation from the left to start chatting
                                </p>
                            </div>
                        ) : (
                            <>
                                {/* Chat header */}
                                <div className="chat-main-header">
                                    <div
                                        className="avatar"
                                        style={{ background: getAvatarColor(activeConvo.otherName), width: 36, height: 36, fontSize: '0.8rem' }}
                                    >
                                        {activeConvo.otherName[0]}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{activeConvo.otherName}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                                            {activeConvo.gigTitle} &middot;{' '}
                                            <span className={`badge ${getStatusBadge(activeConvo.orderStatus)}`} style={{ fontSize: '0.6rem', padding: '1px 6px' }}>
                                                {activeConvo.orderStatus.replace('_', ' ')}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Messages area */}
                                <div className="chat-messages">
                                    {chatLoading ? (
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--color-text-muted)' }}>
                                            Loading messages...
                                        </div>
                                    ) : messages.length === 0 ? (
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                                            No messages yet. Say hello!
                                        </div>
                                    ) : (
                                        messages.map(msg => {
                                            const isMe = msg.senderId === user.id;
                                            return (
                                                <div
                                                    key={msg.id}
                                                    style={{
                                                        alignSelf: isMe ? 'flex-end' : 'flex-start',
                                                        maxWidth: '70%',
                                                    }}
                                                >
                                                    <div
                                                        style={{
                                                            padding: '0.6rem 1rem',
                                                            borderRadius: isMe ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                                                            background: isMe ? 'var(--color-primary)' : 'white',
                                                            color: isMe ? 'white' : 'var(--color-text)',
                                                            fontSize: '0.9rem',
                                                            boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                                                            lineHeight: 1.5,
                                                        }}
                                                    >
                                                        {msg.content}
                                                    </div>
                                                    <div style={{
                                                        fontSize: '0.65rem',
                                                        color: 'var(--color-text-muted)',
                                                        marginTop: '0.2rem',
                                                        textAlign: isMe ? 'right' : 'left',
                                                    }}>
                                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Input area */}
                                <div className="chat-input-area">
                                    <form
                                        onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
                                        style={{ display: 'flex', gap: '0.5rem', width: '100%' }}
                                    >
                                        <input
                                            className="input"
                                            value={content}
                                            onChange={(e) => setContent(e.target.value)}
                                            placeholder="Type a message..."
                                            style={{ flex: 1 }}
                                            disabled={sendLoading}
                                        />
                                        <button type="submit" className="btn btn-primary" disabled={sendLoading || !content.trim()}>
                                            Send
                                        </button>
                                    </form>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
