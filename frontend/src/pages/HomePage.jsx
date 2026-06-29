import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { PenLine, TrendingUp, Sparkles, ArrowRight, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { blogService } from '../services/blogService';
import BlogCard from '../components/ui/BlogCard';
import SkeletonCard from '../components/ui/SkeletonCard';
import UserCard from '../components/ui/UserCard';
import { userService } from '../services/userService';
import api from '../services/api';

const CATEGORIES_COLORS = ['#6366f1','#ec4899','#f59e0b','#10b981','#3b82f6','#ef4444','#a855f7','#06b6d4'];

export default function HomePage() {
  const { isAuthenticated, user } = useAuth();
  const [featuredBlogs, setFeaturedBlogs] = useState([]);
  const [latestBlogs, setLatestBlogs] = useState([]);
  const [trendingBlogs, setTrendingBlogs] = useState([]);
  const [feedBlogs, setFeedBlogs] = useState([]);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(isAuthenticated ? 'feed' : 'latest');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [featuredRes, latestRes, trendingRes, catsRes] = await Promise.all([
          blogService.getFeaturedBlogs(),
          blogService.getBlogs({ limit: 8, sort: 'latest' }),
          blogService.getTrendingBlogs(),
          api.get('/categories'),
        ]);
        setFeaturedBlogs(featuredRes.data.blogs);
        setLatestBlogs(latestRes.data.blogs);
        setTrendingBlogs(trendingRes.data.blogs);
        setCategories(catsRes.data.categories?.slice(0, 8) || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      blogService.getFeed({ limit: 8 })
        .then(res => setFeedBlogs(res.data.blogs))
        .catch(() => {});
      userService.getSuggestedUsers()
        .then(res => setSuggestedUsers(res.data.users))
        .catch(() => {});
    }
  }, [isAuthenticated]);

  const tabs = isAuthenticated
    ? [{ id: 'feed', label: 'Your Feed', icon: Sparkles }, { id: 'latest', label: 'Latest', icon: Zap }, { id: 'trending', label: 'Trending', icon: TrendingUp }]
    : [{ id: 'latest', label: 'Latest', icon: Zap }, { id: 'trending', label: 'Trending', icon: TrendingUp }];

  const displayBlogs = activeTab === 'feed' ? feedBlogs : activeTab === 'trending' ? trendingBlogs : latestBlogs;

  return (
    <>
      <Helmet>
        <title>Inkwell – Modern Blogging Platform</title>
        <meta name="description" content="Discover stories, ideas, and expertise from writers on any topic." />
      </Helmet>

      {/* Hero Section */}
      {!isAuthenticated && (
        <section className="bg-gradient-to-br from-primary-600 via-primary-700 to-purple-700 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
              className="text-center max-w-3xl mx-auto">
              <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2 rounded-full text-sm mb-6 font-medium">
                <Sparkles size={14} /> A new home for your ideas
              </span>
              <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight">
                Write. Share.<br />
                <span className="text-yellow-300">Inspire the World.</span>
              </h1>
              <p className="text-lg text-primary-100 mb-8 leading-relaxed">
                Join thousands of writers and readers on Inkwell — your modern platform for blogging, storytelling, and knowledge sharing.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/register" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-primary-700 rounded-xl font-bold text-base hover:bg-primary-50 transition-colors">
                  Start writing for free <ArrowRight size={18} />
                </Link>
                <Link to="/explore" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 backdrop-blur text-white rounded-xl font-medium text-base hover:bg-white/20 transition-colors border border-white/20">
                  Explore blogs
                </Link>
              </div>
              <p className="text-primary-200 text-sm mt-6">No credit card required · Free forever</p>
            </motion.div>
          </div>
        </section>
      )}

      {/* Welcome back banner */}
      {isAuthenticated && (
        <section className="bg-gradient-to-r from-primary-600 to-purple-600 text-white py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
            <div>
              <p className="text-primary-100 text-sm">Welcome back 👋</p>
              <h1 className="text-xl font-bold">{user?.name}</h1>
            </div>
            <Link to="/write" className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur px-4 py-2.5 rounded-xl text-sm font-medium transition-colors">
              <PenLine size={16} /> New post
            </Link>
          </div>
        </section>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Main content */}
          <div className="lg:col-span-2">
            {/* Tab navigation */}
            <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1 mb-6">
              {tabs.map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                    activeTab === tab.id ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}>
                  <tab.icon size={14} />{tab.label}
                </button>
              ))}
            </div>

            {/* Blog grid */}
            {loading ? (
              <div className="grid gap-6">
                {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : displayBlogs.length > 0 ? (
              <div className="grid gap-6">
                {displayBlogs.map((blog, i) => (
                  <motion.div key={blog._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                    <BlogCard blog={blog} />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 text-gray-500 dark:text-gray-400">
                <Sparkles size={48} className="mx-auto mb-4 opacity-30" />
                <p className="font-medium">No posts here yet</p>
                {activeTab === 'feed' && <p className="text-sm mt-1">Follow some authors to see their posts</p>}
              </div>
            )}

            {/* View more */}
            <div className="text-center mt-8">
              <Link to="/explore" className="btn-outline">
                View more posts <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Categories */}
            <div className="card p-5">
              <h2 className="section-heading text-base mb-4">Explore Topics</h2>
              <div className="flex flex-wrap gap-2">
                {loading ? [...Array(8)].map((_, i) => <div key={i} className="skeleton h-8 w-20 rounded-full" />) :
                  categories.map(cat => (
                    <Link key={cat._id} to={`/explore?category=${cat._id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all hover:scale-105"
                      style={{ backgroundColor: `${cat.color}15`, color: cat.color, border: `1px solid ${cat.color}30` }}>
                      {cat.icon} {cat.name}
                    </Link>
                  ))
                }
              </div>
            </div>

            {/* Trending */}
            {!loading && trendingBlogs.length > 0 && (
              <div className="card p-5">
                <h2 className="section-heading text-base mb-4 flex items-center gap-2">
                  <TrendingUp size={18} className="text-primary-600" /> Trending
                </h2>
                <div className="space-y-4">
                  {trendingBlogs.slice(0, 4).map((blog, i) => (
                    <Link key={blog._id} to={`/blog/${blog.slug}`} className="flex gap-3 group">
                      <span className="text-2xl font-black text-gray-100 dark:text-gray-800 shrink-0 w-6 text-center">{i + 1}</span>
                      <div className="min-w-0">
                        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{blog.title}</h3>
                        <p className="text-xs text-gray-400 mt-1">{blog.author?.name}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Suggested users */}
            {isAuthenticated && suggestedUsers.length > 0 && (
              <div className="card p-5">
                <h2 className="section-heading text-base mb-4">Who to follow</h2>
                <div className="space-y-3">
                  {suggestedUsers.map(u => <UserCard key={u._id} user={u} />)}
                </div>
              </div>
            )}

            {/* CTA for guests */}
            {!isAuthenticated && (
              <div className="card p-5 bg-gradient-to-br from-primary-50 to-purple-50 dark:from-primary-900/20 dark:to-purple-900/20 border-primary-100 dark:border-primary-800/30">
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">Start your story today</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Join thousands of writers sharing their ideas on Inkwell.</p>
                <Link to="/register" className="btn-primary w-full justify-center text-sm">Create free account</Link>
              </div>
            )}
          </aside>
        </div>
      </div>
    </>
  );
}
