import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import {
  BookOpen, Users, Heart, Eye, MessageCircle, TrendingUp, PenLine,
  Edit, Trash2, Globe, FileText, BarChart2, Plus, Loader
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { blogService } from '../services/blogService';
import { useAuth } from '../context/AuthContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const StatCard = ({ icon: Icon, label, value, color, delay }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
    className="card p-5">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
        <p className="text-3xl font-black text-gray-900 dark:text-white mt-1">{value?.toLocaleString() || 0}</p>
      </div>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={22} className="text-white" />
      </div>
    </div>
  </motion.div>
);

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentBlogs, setRecentBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    blogService.getDashboardStats()
      .then(res => { setStats(res.data.stats); setRecentBlogs(res.data.recentBlogs); })
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this blog?')) return;
    setDeleting(id);
    try {
      await blogService.deleteBlog(id);
      setRecentBlogs(p => p.filter(b => b._id !== id));
      toast.success('Blog deleted');
    } catch { toast.error('Failed to delete'); }
    finally { setDeleting(null); }
  };

  if (loading) return <LoadingSpinner fullScreen />;

  const chartData = recentBlogs.map(b => ({
    name: b.title.length > 15 ? b.title.slice(0, 15) + '...' : b.title,
    views: b.views || 0,
    likes: b.likesCount || 0,
  }));

  return (
    <>
      <Helmet><title>Dashboard – Inkwell</title></Helmet>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Welcome back, {user?.name}</p>
          </div>
          <Link to="/write" className="btn-primary"><Plus size={16} /> New Post</Link>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard icon={BookOpen} label="Total Posts" value={stats?.totalBlogs} color="bg-primary-600" delay={0} />
          <StatCard icon={Globe} label="Published" value={stats?.published} color="bg-green-500" delay={0.05} />
          <StatCard icon={FileText} label="Drafts" value={stats?.drafts} color="bg-yellow-500" delay={0.1} />
          <StatCard icon={Users} label="Followers" value={stats?.followers} color="bg-purple-600" delay={0.15} />
          <StatCard icon={Heart} label="Total Likes" value={stats?.totalLikes} color="bg-pink-500" delay={0.2} />
          <StatCard icon={Eye} label="Total Views" value={stats?.totalViews} color="bg-cyan-600" delay={0.25} />
          <StatCard icon={MessageCircle} label="Comments" value={stats?.totalComments} color="bg-orange-500" delay={0.3} />
          <StatCard icon={TrendingUp} label="Following" value={stats?.following} color="bg-indigo-600" delay={0.35} />
        </div>

        {/* Chart */}
        {chartData.length > 0 && (
          <div className="card p-5 mb-8">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <BarChart2 size={18} className="text-primary-600" /> Blog Performance
            </h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="views" fill="#6366f1" radius={[4, 4, 0, 0]} name="Views" />
                <Bar dataKey="likes" fill="#ec4899" radius={[4, 4, 0, 0]} name="Likes" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Recent blogs table */}
        <div className="card overflow-hidden">
          <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900 dark:text-white">Recent Posts</h2>
            <Link to={`/profile/${user?.username}`} className="text-sm text-primary-600 dark:text-primary-400 hover:underline">View all</Link>
          </div>

          {recentBlogs.length > 0 ? (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {recentBlogs.map(blog => (
                <div key={blog._id} className="p-4 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  {blog.coverImage && (
                    <img src={blog.coverImage} alt={blog.title} className="w-14 h-14 rounded-xl object-cover shrink-0 hidden sm:block" />
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm text-gray-900 dark:text-white truncate">{blog.title}</h3>
                    <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                      <span className={`badge ${blog.status === 'published' ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400'}`}>
                        {blog.status}
                      </span>
                      <span className="flex items-center gap-1"><Eye size={11} />{blog.views || 0}</span>
                      <span className="flex items-center gap-1"><Heart size={11} />{blog.likesCount || 0}</span>
                      <span className="hidden sm:block">{formatDistanceToNow(new Date(blog.createdAt), { addSuffix: true })}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Link to={`/edit/${blog._id}`} className="btn-ghost p-2 text-primary-600 dark:text-primary-400" title="Edit">
                      <Edit size={15} />
                    </Link>
                    <button onClick={() => handleDelete(blog._id)} disabled={deleting === blog._id}
                      className="btn-ghost p-2 text-red-500 hover:text-red-600" title="Delete">
                      {deleting === blog._id ? <Loader size={15} className="animate-spin" /> : <Trash2 size={15} />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-gray-400 dark:text-gray-500">
              <PenLine size={40} className="mx-auto mb-4 opacity-30" />
              <p className="font-medium">No posts yet</p>
              <Link to="/write" className="btn-primary mt-4 inline-flex">Write your first post</Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
