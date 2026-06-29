import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { TrendingUp, Compass, SlidersHorizontal } from 'lucide-react';
import { blogService } from '../services/blogService';
import BlogCard from '../components/ui/BlogCard';
import SkeletonCard from '../components/ui/SkeletonCard';
import Pagination from '../components/ui/Pagination';
import UserCard from '../components/ui/UserCard';
import api from '../services/api';
import { userService } from '../services/userService';

const SORT_OPTIONS = [
  { value: 'latest', label: 'Latest' },
  { value: 'popular', label: 'Most Viewed' },
  { value: 'trending', label: 'Trending' },
  { value: 'oldest', label: 'Oldest' },
];

export default function ExplorePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [categories, setCategories] = useState([]);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  const category = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || 'latest';
  const tag = searchParams.get('tag') || '';

  useEffect(() => {
    api.get('/categories').then(res => setCategories(res.data.categories || [])).catch(() => {});
    userService.getSuggestedUsers().then(res => setSuggestedUsers(res.data.users || [])).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = { page, limit: 9, sort };
    if (category) params.category = category;
    if (tag) params.tag = tag;

    blogService.getBlogs(params)
      .then(res => { setBlogs(res.data.blogs); setPages(res.data.pages); setTotal(res.data.total); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [category, sort, tag, page]);

  const updateParam = (key, value) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value); else params.delete(key);
    params.delete('page');
    setPage(1);
    setSearchParams(params);
  };

  return (
    <>
      <Helmet>
        <title>Explore – Inkwell</title>
        <meta name="description" content="Discover trending blogs, popular authors, and great content." />
      </Helmet>

      {/* Hero */}
      <section className="bg-gradient-to-r from-primary-600 to-purple-700 text-white py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Compass size={28} />
            <h1 className="text-3xl font-black">Explore</h1>
          </div>
          <p className="text-primary-100 text-sm">{total.toLocaleString()} articles to discover</p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Category filters */}
        <div className="flex flex-wrap gap-2 mb-6 items-center">
          <button onClick={() => updateParam('category', '')}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${!category ? 'bg-primary-600 text-white shadow-sm' : 'btn-outline'}`}>
            All
          </button>
          {categories.map(cat => (
            <button key={cat._id} onClick={() => updateParam('category', cat._id)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${category === cat._id ? 'text-white shadow-sm' : 'btn-outline'}`}
              style={category === cat._id ? { backgroundColor: cat.color, borderColor: cat.color } : {}}>
              {cat.icon} {cat.name}
            </button>
          ))}

          {/* Sort */}
          <div className="ml-auto flex items-center gap-2">
            <select value={sort} onChange={e => updateParam('sort', e.target.value)} className="input-field py-2 text-sm w-auto">
              {SORT_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Blog grid */}
          <div className="lg:col-span-2">
            {loading ? (
              <div className="grid gap-6">{[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}</div>
            ) : blogs.length > 0 ? (
              <>
                <div className="grid gap-6">
                  {blogs.map((blog, i) => (
                    <motion.div key={blog._id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                      <BlogCard blog={blog} />
                    </motion.div>
                  ))}
                </div>
                <Pagination page={page} pages={pages} onPageChange={(p) => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }} />
              </>
            ) : (
              <div className="text-center py-24 text-gray-400 dark:text-gray-500">
                <Compass size={48} className="mx-auto mb-4 opacity-30" />
                <p className="font-medium text-lg">No blogs found</p>
                <p className="text-sm mt-1">Try different filters</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Popular authors */}
            {suggestedUsers.length > 0 && (
              <div className="card p-5">
                <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <TrendingUp size={16} className="text-primary-600" /> Popular Authors
                </h2>
                <div className="space-y-3">
                  {suggestedUsers.slice(0, 4).map(u => <UserCard key={u._id} user={u} />)}
                </div>
              </div>
            )}

            {/* Tags cloud */}
            {tag && (
              <div className="card p-5">
                <h2 className="font-semibold text-gray-900 dark:text-white mb-3">Filtered by tag</h2>
                <div className="flex items-center gap-2">
                  <span className="badge bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300">#{tag}</span>
                  <button onClick={() => updateParam('tag', '')} className="text-xs text-gray-400 hover:text-red-500 transition-colors">✕ Clear</button>
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </>
  );
}
