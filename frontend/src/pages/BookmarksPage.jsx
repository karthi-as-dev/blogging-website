import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { BookMarked } from 'lucide-react';
import { motion } from 'framer-motion';
import { blogService } from '../services/blogService';
import BlogCard from '../components/ui/BlogCard';
import SkeletonCard from '../components/ui/SkeletonCard';
import Pagination from '../components/ui/Pagination';

export default function BookmarksPage() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    setLoading(true);
    blogService.getBookmarks({ page })
      .then(res => { setBlogs(res.data.blogs); setPages(res.data.pages); setTotal(res.data.total); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <>
      <Helmet><title>Bookmarks – Inkwell</title></Helmet>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <BookMarked size={24} className="text-primary-600" /> Bookmarks
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{total} saved articles</p>
        </div>

        {loading ? (
          <div className="space-y-4">{[...Array(5)].map((_, i) => <SkeletonCard key={i} compact />)}</div>
        ) : blogs.length > 0 ? (
          <>
            <div className="space-y-4">
              {blogs.map((blog, i) => (
                <motion.div key={blog._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                  <BlogCard blog={blog} compact />
                </motion.div>
              ))}
            </div>
            <Pagination page={page} pages={pages} onPageChange={setPage} />
          </>
        ) : (
          <div className="text-center py-24 text-gray-400 dark:text-gray-500">
            <BookMarked size={48} className="mx-auto mb-4 opacity-30" />
            <p className="font-medium text-lg">No bookmarks yet</p>
            <p className="text-sm mt-1">Save articles to read them later</p>
          </div>
        )}
      </div>
    </>
  );
}
