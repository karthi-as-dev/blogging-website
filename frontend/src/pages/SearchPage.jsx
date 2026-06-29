import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Search, Users, BookOpen, Tag } from 'lucide-react';
import api from '../services/api';
import BlogCard from '../components/ui/BlogCard';
import SkeletonCard from '../components/ui/SkeletonCard';
import UserCard from '../components/ui/UserCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const q = searchParams.get('q') || '';
  const [results, setResults] = useState({ blogs: [], users: [], categories: [] });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    if (!q) return;
    setLoading(true);
    api.get(`/search?q=${encodeURIComponent(q)}`)
      .then(res => setResults(res.data.results))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [q]);

  const tabs = [
    { id: 'all', label: 'All' },
    { id: 'blogs', label: `Posts (${results.blogs?.length || 0})` },
    { id: 'users', label: `People (${results.users?.length || 0})` },
    { id: 'categories', label: `Topics (${results.categories?.length || 0})` },
  ];

  return (
    <>
      <Helmet><title>{q ? `Search: ${q}` : 'Search'} – Inkwell</title></Helmet>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400 mb-2">
            <Search size={18} />
            <span className="text-sm">Search results for</span>
          </div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white">"{q}"</h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1 mb-6">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400'
              }`}>{tab.label}</button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-4">{[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}</div>
        ) : (
          <div className="space-y-8">
            {/* Blogs */}
            {(activeTab === 'all' || activeTab === 'blogs') && results.blogs?.length > 0 && (
              <section>
                {activeTab === 'all' && <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><BookOpen size={16} />Posts</h2>}
                <div className="space-y-4">
                  {results.blogs.map(blog => <BlogCard key={blog._id} blog={blog} />)}
                </div>
              </section>
            )}

            {/* Users */}
            {(activeTab === 'all' || activeTab === 'users') && results.users?.length > 0 && (
              <section>
                {activeTab === 'all' && <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><Users size={16} />People</h2>}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {results.users.map(u => <UserCard key={u._id} user={u} />)}
                </div>
              </section>
            )}

            {/* Categories */}
            {(activeTab === 'all' || activeTab === 'categories') && results.categories?.length > 0 && (
              <section>
                {activeTab === 'all' && <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><Tag size={16} />Topics</h2>}
                <div className="flex flex-wrap gap-3">
                  {results.categories.map(cat => (
                    <Link key={cat._id} to={`/explore?category=${cat._id}`}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all hover:scale-105 card"
                      style={{ borderLeft: `4px solid ${cat.color}` }}>
                      <span className="text-lg">{cat.icon}</span>
                      <span className="text-gray-900 dark:text-white">{cat.name}</span>
                      <span className="text-xs text-gray-400">{cat.blogCount} posts</span>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* No results */}
            {!loading && !results.blogs?.length && !results.users?.length && !results.categories?.length && (
              <div className="text-center py-20 text-gray-400 dark:text-gray-500">
                <Search size={48} className="mx-auto mb-4 opacity-30" />
                <p className="font-medium text-lg">No results found</p>
                <p className="text-sm mt-1">Try different keywords</p>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
