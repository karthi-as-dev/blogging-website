import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Bell, Heart, MessageCircle, UserPlus, BookMarked, FileText, CheckCheck, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { notificationService } from '../services/notificationService';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

const NotifIcon = ({ type }) => {
  const icons = {
    follow: <UserPlus size={16} className="text-blue-500" />,
    like: <Heart size={16} className="text-red-500" />,
    comment: <MessageCircle size={16} className="text-green-500" />,
    reply: <MessageCircle size={16} className="text-teal-500" />,
    bookmark: <BookMarked size={16} className="text-yellow-500" />,
    new_post: <FileText size={16} className="text-purple-500" />,
  };
  return <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
    type === 'like' ? 'bg-red-50 dark:bg-red-900/20' : type === 'follow' ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-gray-100 dark:bg-gray-800'
  }`}>{icons[type]}</div>;
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    notificationService.getNotifications({ limit: 50 })
      .then(res => {
        setNotifications(res.data.notifications);
        setUnreadCount(res.data.unreadCount);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const markAllRead = async () => {
    try {
      await notificationService.markAllRead();
      setNotifications(p => p.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success('All marked as read');
    } catch { toast.error('Failed'); }
  };

  const deleteNotif = async (id) => {
    try {
      await notificationService.deleteNotification(id);
      setNotifications(p => p.filter(n => n._id !== id));
    } catch { toast.error('Failed to delete'); }
  };

  const markRead = async (id) => {
    const notif = notifications.find(n => n._id === id);
    if (notif?.isRead) return;
    try {
      await notificationService.markRead(id);
      setNotifications(p => p.map(n => n._id === id ? { ...n, isRead: true } : n));
      setUnreadCount(p => Math.max(0, p - 1));
    } catch {}
  };

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <>
      <Helmet><title>Notifications – Inkwell</title></Helmet>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Bell size={22} /> Notifications
              {unreadCount > 0 && (
                <span className="badge bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400">{unreadCount} new</span>
              )}
            </h1>
          </div>
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="btn-ghost text-sm flex items-center gap-1.5">
              <CheckCheck size={16} /> Mark all read
            </button>
          )}
        </div>

        {notifications.length > 0 ? (
          <div className="space-y-2">
            {notifications.map((notif, i) => (
              <motion.div key={notif._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                onClick={() => markRead(notif._id)}
                className={`card p-4 flex items-start gap-3 cursor-pointer group hover:border-primary-200 dark:hover:border-primary-800 transition-colors ${
                  !notif.isRead ? 'border-primary-200 dark:border-primary-800 bg-primary-50/30 dark:bg-primary-900/10' : ''
                }`}>
                {/* Sender avatar */}
                <Link to={`/profile/${notif.sender?.username}`} className="shrink-0" onClick={e => e.stopPropagation()}>
                  {notif.sender?.profilePicture
                    ? <img src={notif.sender.profilePicture} alt={notif.sender.name} className="w-10 h-10 rounded-full object-cover" />
                    : <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold">{notif.sender?.name?.[0]}</div>
                  }
                </Link>

                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-800 dark:text-gray-200">{notif.message}</p>
                  <p className="text-xs text-gray-400 mt-1">{formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}</p>

                  {notif.blog && (
                    <Link to={`/blog/${notif.blog.slug}`} onClick={e => e.stopPropagation()}
                      className="text-xs text-primary-600 dark:text-primary-400 hover:underline mt-1 block truncate">
                      {notif.blog.title}
                    </Link>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <NotifIcon type={notif.type} />
                  {!notif.isRead && <div className="w-2 h-2 rounded-full bg-primary-600 shrink-0" />}
                  <button onClick={(e) => { e.stopPropagation(); deleteNotif(notif._id); }}
                    className="p-1 rounded opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all">
                    <Trash2 size={14} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 text-gray-400 dark:text-gray-500">
            <Bell size={48} className="mx-auto mb-4 opacity-30" />
            <p className="font-medium">No notifications yet</p>
            <p className="text-sm mt-1">We'll notify you when something happens</p>
          </div>
        )}
      </div>
    </>
  );
}
