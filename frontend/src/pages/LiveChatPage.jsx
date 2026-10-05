import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/layout/Navbar';
import { Sidebar } from '../components/layout/Sidebar';
import {
  MessageSquare,
  Send,
  Crown,
  ShieldCheck,
  Megaphone,
  User,
  Clock,
  Sparkles,
  Lock,
  CheckCircle,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import api from '../services/api';
import { formatMessageTime } from '../utils/dateFormatter';

export const LiveChatPage = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isNotice, setIsNotice] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

  const fetchMessages = async () => {
    try {
      const res = await api.get('/chat');
      setMessages(res.data.messages || []);
    } catch (err) {
      console.error('Fetch chat error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    // Live polling every 3 seconds for instant chat stream
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setSending(true);
    setError('');

    try {
      const res = await api.post('/chat', {
        message: newMessage,
        isNotice: isNotice || user?.role === 'Principal'
      });
      setMessages((prev) => [...prev, res.data.chatMessage]);
      setNewMessage('');
      setIsNotice(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send message.');
    } finally {
      setSending(false);
    }
  };

  const handleQuickTemplate = (templateText) => {
    setNewMessage(templateText);
    if (user?.role === 'Principal') setIsNotice(true);
  };

  const getRoleBadgeStyle = (role) => {
    switch (role) {
      case 'Principal':
        return 'bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 font-extrabold shadow-sm border border-yellow-300';
      case 'HOD':
        return 'bg-amber-950/80 text-amber-300 border border-amber-500/40 font-bold';
      case 'Teacher':
        return 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 font-bold';
      case 'Admin':
        return 'bg-purple-950/80 text-purple-300 border border-purple-500/40 font-bold';
      case 'Exam Controller':
        return 'bg-blue-950/80 text-blue-300 border border-blue-500/40 font-bold';
      case 'Auditor':
        return 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 font-bold';
      default:
        return 'bg-slate-800 text-slate-300 border border-slate-700';
    }
  };

  return (
    <div className="min-h-screen bg-cyber-dark text-slate-100 flex flex-col">
      <Navbar />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar />

        <main className="flex-1 p-4 sm:p-6 flex flex-col space-y-4 overflow-hidden max-h-[calc(100vh-4rem)]">
          
          {/* Header Banner */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-cyan-950/70 via-slate-900 to-slate-900 border border-cyan-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 flex-shrink-0 shadow-lg">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Megaphone className="w-3.5 h-3.5 text-cyan-400" />
                  Campus Live Broadcast & Communication Hub
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-white mt-1">Campus Staff & Principal Live Chat</h1>
              <p className="text-xs text-slate-300 mt-1">
                Real-time official broadcast channel for Principal announcements, HOD review updates, and faculty paper security coordination.
              </p>
            </div>

            <div className="flex items-center space-x-3 flex-shrink-0">
              <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-cyan-300 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Encryption Active</span>
              </div>
              <button
                onClick={fetchMessages}
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition"
                title="Refresh Chat Stream"
              >
                <RefreshCw className="w-4 h-4 text-cyan-400" />
              </button>
            </div>
          </div>

          {/* Quick Announcement Templates for Principal & HODs */}
          {(user?.role === 'Principal' || user?.role === 'HOD' || user?.role === 'Admin') && (
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-amber-500/30 flex flex-wrap items-center gap-2 text-xs flex-shrink-0">
              <span className="text-amber-400 font-bold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                {user?.role === 'Principal' ? 'Principal Quick Broadcasts:' : 'Leadership Templates:'}
              </span>
              <button
                onClick={() => handleQuickTemplate('📢 OFFICIAL ANNOUNCEMENT: All question papers for upcoming examination must be uploaded before 5:00 PM today.')}
                className="px-2.5 py-1 rounded-lg bg-amber-950/60 border border-amber-500/40 text-amber-300 hover:bg-amber-900 transition text-[11px] font-medium truncate"
              >
                📢 Upload Deadline Announcement
              </button>
              <button
                onClick={() => handleQuickTemplate('🔒 SECURITY ADVISORY: SHA-256 digital fingerprint integrity check completed. All papers are secured.')}
                className="px-2.5 py-1 rounded-lg bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-900 transition text-[11px] font-medium truncate"
              >
                🔒 Security Integrity Advisory
              </button>
              <button
                onClick={() => handleQuickTemplate('📋 DOWNLOAD PERMIT NOTICE: Download approval requests are under Principal review.')}
                className="px-2.5 py-1 rounded-lg bg-purple-950/60 border border-purple-500/40 text-purple-300 hover:bg-purple-900 transition text-[11px] font-medium truncate"
              >
                📋 Download Permit Notice
              </button>
            </div>
          )}

          {/* Main Chat Stream Container */}
          <div className="flex-1 bg-cyber-card border border-slate-800 rounded-2xl p-4 sm:p-6 overflow-y-auto space-y-4 shadow-inner flex flex-col">
            {loading && messages.length === 0 ? (
              <div className="py-16 flex flex-col items-center justify-center space-y-3 text-cyan-400">
                <div className="w-8 h-8 border-3 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-xs font-mono text-slate-400">Connecting to Live Campus Chat Stream...</span>
              </div>
            ) : messages.length === 0 ? (
              <div className="py-16 text-center space-y-2 text-slate-400">
                <MessageSquare className="w-10 h-10 text-cyan-500/40 mx-auto" />
                <p className="text-sm font-semibold text-white">No broadcast messages yet.</p>
                <p className="text-xs">Be the first to post an announcement or message to campus staff!</p>
              </div>
            ) : (
              messages.map((msg) => {
                const isSelf = msg.senderId === user?.userId;
                const isPrincipalMsg = msg.senderRole === 'Principal' || msg.isNotice;

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col space-y-1 ${isSelf ? 'items-end' : 'items-start'}`}
                  >
                    {/* Header Sender Badge */}
                    <div className="flex items-center space-x-2 text-[11px]">
                      <span className={`px-2 py-0.5 rounded-md uppercase text-[10px] tracking-wider flex items-center gap-1 ${getRoleBadgeStyle(msg.senderRole)}`}>
                        {msg.senderRole === 'Principal' && <Crown className="w-3 h-3 text-yellow-950 fill-yellow-950" />}
                        {msg.senderRole}
                      </span>
                      <span className="font-bold text-slate-200">{msg.senderName}</span>
                      <span className="text-slate-500 font-mono text-[10px]">
                        ({msg.department}) • {formatMessageTime(msg.createdAt)}
                      </span>
                    </div>

                    {/* Message Content Bubble */}
                    <div
                      className={`max-w-2xl px-4 py-3 rounded-2xl text-xs leading-relaxed shadow-md ${
                        isPrincipalMsg
                          ? 'bg-gradient-to-r from-amber-950 via-slate-900 to-amber-950 border-2 border-amber-500/60 text-amber-100 font-medium'
                          : isSelf
                          ? 'bg-cyan-600 text-white rounded-tr-none font-medium'
                          : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'
                      }`}
                    >
                      {isPrincipalMsg && (
                        <div className="flex items-center space-x-1.5 text-amber-400 text-[10px] font-extrabold uppercase tracking-wider mb-1">
                          <Megaphone className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
                          <span>Official Principal Announcement</span>
                        </div>
                      )}
                      <p className="whitespace-pre-wrap text-xs sm:text-sm">{msg.message}</p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Bottom Composition Bar */}
          <form onSubmit={handleSendMessage} className="space-y-2 flex-shrink-0">
            {error && (
              <div className="p-2 px-3 rounded-xl bg-rose-950 border border-rose-500/40 text-rose-300 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={
                    user?.role === 'Principal'
                      ? 'Type official campus announcement or broadcast message...'
                      : 'Type a message to campus staff & leadership...'
                  }
                  className="w-full pl-4 pr-12 py-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-500 transition shadow-md"
                />

                {(user?.role === 'Principal' || user?.role === 'HOD') && (
                  <button
                    type="button"
                    onClick={() => setIsNotice(!isNotice)}
                    className={`absolute right-3 top-2.5 px-2 py-1 rounded text-[10px] font-bold transition ${
                      isNotice
                        ? 'bg-amber-500 text-slate-950 font-extrabold shadow'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                    title="Toggle Official Principal Notice Badge"
                  >
                    📢 Notice
                  </button>
                )}
              </div>

              <button
                type="submit"
                disabled={sending || !newMessage.trim()}
                className="px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-md flex items-center justify-center space-x-2 transition disabled:opacity-50 flex-shrink-0"
              >
                {sending ? (
                  <span className="animate-pulse">Sending...</span>
                ) : (
                  <>
                    <span>Send Message</span>
                    <Send className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </form>

        </main>
      </div>
    </div>
  );
};
