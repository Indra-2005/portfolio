import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { contactApi } from '../../services/api';
import { SEO } from '../../components/SEO';
import { Button } from '../../components/Button';
import { LoadingState, TableRowSkeleton } from '../../components/LoadingState';
import { EmptyState } from '../../components/EmptyState';
import { ErrorState } from '../../components/ErrorState';
import {
  Mail,
  MailOpen,
  ArrowLeft,
  RefreshCw,
  Clock,
  User,
  CheckCircle2,
  X,
  Inbox,
  AlertCircle,
} from 'lucide-react';

export function AdminMessagesPage() {
  const [messages, setMessages] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [markingId, setMarkingId] = useState(null);

  const fetchMessages = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await contactApi.getAdminMessages({ page: 1, page_size: 100 });
      setMessages(res.items || []);
      setTotal(res.total || 0);
    } catch (err) {
      setError(err.message || 'Failed to load contact inquiries from database.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Handle escape key to close message detail modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setSelectedMessage(null);
      }
    };
    if (selectedMessage) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [selectedMessage]);

  const handleMarkAsRead = async (messageId, e) => {
    if (e) e.stopPropagation();
    try {
      setMarkingId(messageId);
      const updated = await contactApi.markMessageAsRead(messageId);
      setMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, is_read: true } : m))
      );
      if (selectedMessage && selectedMessage.id === messageId) {
        setSelectedMessage((prev) => ({ ...prev, is_read: true }));
      }
    } catch (err) {
      alert(err.message || 'Failed to update message status.');
    } finally {
      setMarkingId(null);
    }
  };

  const handleOpenMessage = (msg) => {
    setSelectedMessage(msg);
    // If unread, auto mark as read
    if (!msg.is_read) {
      handleMarkAsRead(msg.id);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      const date = new Date(dateStr);
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(date);
    } catch {
      return dateStr;
    }
  };

  return (
    <>
      <SEO
        title="Messages"
        description="Review visitor inquiries submitted through the contact form."
        noindex={true}
      />

      <div className="max-w-6xl mx-auto space-y-6 py-4">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="space-y-1">
            <Link
              to="/admin"
              className="inline-flex items-center text-xs text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 font-mono transition-colors mb-1"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1" />
              Back to Management Console
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <Mail className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              <span>Contact Messages</span>
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Inquiries received via the public contact form. Total records: <span className="font-mono font-semibold">{total}</span>
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={fetchMessages}
              disabled={loading}
              title="Refresh messages"
              aria-label="Refresh messages"
              className="inline-flex items-center space-x-2 px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium transition-colors shadow-xs cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Content Viewport */}
        {loading && messages.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-mono text-slate-500 dark:text-slate-400">Loading messages from PostgreSQL...</span>
            </div>
            <table className="w-full text-left">
              <tbody>
                <TableRowSkeleton cols={5} />
                <TableRowSkeleton cols={5} />
                <TableRowSkeleton cols={5} />
                <TableRowSkeleton cols={5} />
              </tbody>
            </table>
          </div>
        ) : error ? (
          <ErrorState
            title="Failed to Load Inquiries"
            error={error}
            onRetry={fetchMessages}
          />
        ) : messages.length === 0 ? (
          <EmptyState
            title="No Inquiries Received Yet"
            description="When visitors submit questions or project inquiries through your portfolio contact form, they will appear here in chronological order."
            icon={Inbox}
          />
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-850/50 text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <th scope="col" className="py-3.5 px-4 font-semibold">Status</th>
                    <th scope="col" className="py-3.5 px-4 font-semibold">Sender</th>
                    <th scope="col" className="py-3.5 px-4 font-semibold">Subject / Preview</th>
                    <th scope="col" className="py-3.5 px-4 font-semibold">Date</th>
                    <th scope="col" className="py-3.5 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  {messages.map((msg) => (
                    <tr
                      key={msg.id}
                      onClick={() => handleOpenMessage(msg)}
                      className={`hover:bg-blue-50/40 dark:hover:bg-blue-950/20 transition-colors cursor-pointer ${
                        !msg.is_read
                          ? 'bg-blue-50/20 dark:bg-blue-950/10 font-medium'
                          : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <td className="py-4 px-4 whitespace-nowrap">
                        {!msg.is_read ? (
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400" />
                            <span>Unread</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                            <CheckCircle2 className="w-3 h-3 text-slate-400" />
                            <span>Read</span>
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="font-semibold text-slate-900 dark:text-white">{msg.name}</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                          {msg.email}
                        </div>
                      </td>

                      <td className="py-4 px-4 max-w-xs sm:max-w-md">
                        <div className="font-semibold text-slate-900 dark:text-white truncate">
                          {msg.subject || 'No Subject'}
                        </div>
                        <div className="text-slate-500 dark:text-slate-400 truncate text-[11px]">
                          {msg.message}
                        </div>
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap font-mono text-[11px] text-slate-500 dark:text-slate-400">
                        {formatDate(msg.created_at)}
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap text-right space-x-2">
                        {!msg.is_read && (
                          <button
                            type="button"
                            onClick={(e) => handleMarkAsRead(msg.id, e)}
                            disabled={markingId === msg.id}
                            className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                          >
                            Mark Read
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleOpenMessage(msg)}
                          className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors cursor-pointer"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List View */}
            <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  onClick={() => handleOpenMessage(msg)}
                  className={`p-4 space-y-3 cursor-pointer transition-colors ${
                    !msg.is_read ? 'bg-blue-50/20 dark:bg-blue-950/10' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-slate-900 dark:text-white text-sm">
                      {msg.name}
                    </div>
                    {!msg.is_read ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                        Unread
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 font-mono">Read</span>
                    )}
                  </div>

                  <div className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                    {msg.subject || 'No Subject'}
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                    {msg.message}
                  </p>

                  <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400 font-mono">
                    <span>{formatDate(msg.created_at)}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenMessage(msg);
                      }}
                      className="text-blue-600 dark:text-blue-400 font-semibold"
                    >
                      View Details &rarr;
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Message Detail Modal */}
        {selectedMessage && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="message-modal-title"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs"
          >
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-xl w-full p-6 space-y-5 shadow-xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-start justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <h2
                      id="message-modal-title"
                      className="text-lg font-bold text-slate-900 dark:text-white"
                    >
                      {selectedMessage.subject || 'Inquiry Details'}
                    </h2>
                    {selectedMessage.is_read ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        Read
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                        Unread
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400 font-mono">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{formatDate(selectedMessage.created_at)}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedMessage(null)}
                  aria-label="Close message details modal"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Sender Details */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-slate-500 dark:text-slate-400 uppercase">From:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{selectedMessage.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-slate-500 dark:text-slate-400 uppercase">Email:</span>
                  <a
                    href={`mailto:${selectedMessage.email}`}
                    className="font-mono text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {selectedMessage.email}
                  </a>
                </div>
              </div>

              {/* Message Body */}
              <div className="space-y-2">
                <h3 className="text-xs font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">
                  Message Content
                </h3>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed font-normal">
                  {selectedMessage.message}
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                <a
                  href={`mailto:${selectedMessage.email}?subject=${encodeURIComponent(
                    `Re: ${selectedMessage.subject || 'Portfolio Inquiry'}`
                  )}`}
                  className="inline-flex items-center space-x-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Reply via Email Client</span>
                </a>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setSelectedMessage(null)}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default AdminMessagesPage;
