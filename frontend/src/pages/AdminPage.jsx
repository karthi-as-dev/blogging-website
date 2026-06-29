import { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import {
  Users, BookOpen, BarChart2, Shield, Trash2, Ban, CheckCircle,
  Star, StarOff, Loader, Search
} from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { formatDistanceToNow } from 'date-fns';

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="card p-4 flex items-center gap-3">
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
      <Icon size={18} className="text-white" />
    </div>
    <div>
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
      <p className="text-2xl font-black text-gray-900 dark:text-white">{value?.toLocaleString() || 0}</p>
    </div>
  </div>
);

export default function AdminPage() {
  const [tab, setTab] = useState('stats');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchStats = () => api.get('/admin/stats').then(res => setStats(res.data.stats)).catch(() => {});
  const fetchUsers = () => api.get(`/admin/users${search ? `?search=${search}` : ''}`).then(res => setUsers(res.data.users)).catch(() => {});
  const fetchBlogs = () => api.get('/admin/blogs').then(res => setBlogs(res.data.blogs)).catch(() => {});

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchStats(), fetchUsers(), fetchBlogs()]).finally(() => setLoading(false));
  }, []);

  // Re-fetch users whenever search changes (debounced)
  useEffect(() => {
    const timer = setTimeout(() => { fetchUsers(); }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const handleBlock = async (id) => {
    try {
      const res = await api.put(`/admin/users/${id}/block`);
      setUsers(p => p.map(u => u._id === id ? { ...u, isBlocked: res.data.isBlocked } : u));
      toast.success(res.data.message);
    } catch { toast.error('Failed'); }
  };

  const handleDeleteUser = async (id) => {
    if (!confirm('Delete this user?')) return;
    try {
      await api.delete(`/admin/users/${id}`);
      setUsers(p => p.filter(u => u._id !== id));
      toast.success('User deleted');
    } catch { toast.error('Failed'); }
  };

  const handleDeleteBlog = async (id) => {
    if (!confirm('Delete this blog?')) return;
    try {
      await api.delete(`/admin/blogs/${id}`);
      setBlogs(p => p.filter(b => b._id !== id));
      toast.success('Blog deleted');
    } catch { toast.error('Failed'); }
  };

  const handleFeature = async (id) => {
    try {
      const res = await api.put(`/admin/blogs/${id}/feature`);
      setBlogs(p => p.map(b => b._id === id ? { ...b, featured: res.data.featured } : b));
      toast.success(res.data.featured ? 'Blog featured' : 'Blog unfeatured');
    } catch { toast.error('Failed'); }
  };

  if (loading) return <LoadingSpinner fullScreen />;

  const tabs = [
    { id: 'stats', label: 'Overview', icon: BarChart2 },
    { id: 'users', label: `Users (${users.length})`, icon: Users },
    { id: 'blogs', label: `Blogs (${blogs.length})`, icon: BookOpen },
  ];

  return (
    <>
      <Helmet><title>Admin Panel – Inkwell</title></Helmet>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center">
            <Shield size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Panel</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Manage your blogging platform</p>
          </div>
        </div>

        {/* Tab nav */}
        <div className="flex gap-2 mb-6">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                tab === t.id ? 'bg-purple-600 text-white' : 'btn-ghost'
              }`}>
              <t.icon size={15} />{t.label}
            </button>
          ))}
        </div>

        {/* Stats tab */}
        {tab === 'stats' && stats && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <StatCard icon={Users} label="Total Users" value={stats.totalUsers} color="bg-blue-600" />
            <StatCard icon={BookOpen} label="Total Blogs" value={stats.totalBlogs} color="bg-primary-600" />
            <StatCard icon={CheckCircle} label="Published" value={stats.publishedBlogs} color="bg-green-500" />
            <StatCard icon={BarChart2} label="Drafts" value={stats.draftBlogs} color="bg-yellow-500" />
            <StatCard icon={BarChart2} label="Comments" value={stats.totalComments} color="bg-orange-500" />
          </div>
        )}

        {/* Users tab */}
        {tab === 'users' && (
          <div className="card overflow-hidden">
            <div className="p-4 border-b border-gray-100 dark:border-gray-800">
              <div className="flex gap-2">
                <input value={search} onChange={e => setSearch(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && fetchUsers()}
                  placeholder="Search users by name, email, username..." className="input-field" />
                <button onClick={fetchUsers}
                  className="btn-primary px-4 shrink-0 flex items-center gap-2">
                  <Search size={15} /> Search
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                    <th className="text-left p-3 font-medium text-gray-600 dark:text-gray-400">User</th>
                    <th className="text-left p-3 font-medium text-gray-600 dark:text-gray-400">Email</th>
                    <th className="text-left p-3 font-medium text-gray-600 dark:text-gray-400">Joined</th>
                    <th className="text-left p-3 font-medium text-gray-600 dark:text-gray-400">Status</th>
                    <th className="text-left p-3 font-medium text-gray-600 dark:text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {users.map(u => (
                    <tr key={u._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          {u.profilePicture ? <img src={u.profilePicture} alt={u.name} className="w-8 h-8 rounded-full object-cover" /> : <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-xs font-bold">{u.name?.[0]}</div>}
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{u.name}</p>
                            <p className="text-xs text-gray-400">@{u.username}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-gray-600 dark:text-gray-400 text-xs">{u.email}</td>
                      <td className="p-3 text-gray-400 text-xs">{formatDistanceToNow(new Date(u.createdAt), { addSuffix: true })}</td>
                      <td className="p-3">
                        <span className={`badge text-xs ${u.isBlocked ? 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400' : 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400'}`}>
                          {u.isBlocked ? 'Blocked' : 'Active'}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex gap-1">
                          <button onClick={() => handleBlock(u._id)} title={u.isBlocked ? 'Unblock' : 'Block'}
                            className={`p-1.5 rounded-lg transition-colors ${u.isBlocked ? 'text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20' : 'text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20'}`}>
                            {u.isBlocked ? <CheckCircle size={15} /> : <Ban size={15} />}
                          </button>
                          <button onClick={() => handleDeleteUser(u._id)}
                            className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Blogs tab */}
        {tab === 'blogs' && (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                    <th className="text-left p-3 font-medium text-gray-600 dark:text-gray-400">Blog</th>
                    <th className="text-left p-3 font-medium text-gray-600 dark:text-gray-400">Author</th>
                    <th className="text-left p-3 font-medium text-gray-600 dark:text-gray-400">Status</th>
                    <th className="text-left p-3 font-medium text-gray-600 dark:text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {blogs.map(b => (
                    <tr key={b._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="p-3 max-w-xs">
                        <p className="font-medium text-gray-900 dark:text-white truncate">{b.title}</p>
                        <p className="text-xs text-gray-400">{b.category?.name}</p>
                      </td>
                      <td className="p-3 text-xs text-gray-600 dark:text-gray-400">{b.author?.name}</td>
                      <td className="p-3">
                        <span className={`badge text-xs ${b.status === 'published' ? 'bg-green-100 dark:bg-green-900/20 text-green-600' : 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600'}`}>
                          {b.status}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex gap-1">
                          <button onClick={() => handleFeature(b._id)} title={b.featured ? 'Unfeature' : 'Feature'}
                            className={`p-1.5 rounded-lg transition-colors ${b.featured ? 'text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20' : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
                            {b.featured ? <Star size={15} className="fill-current" /> : <StarOff size={15} />}
                          </button>
                          <button onClick={() => handleDeleteBlog(b._id)}
                            className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
