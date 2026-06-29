import { Link } from 'react-router-dom';
import { Heart, MessageCircle, BookMarked, Clock, Eye } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function BlogCard({ blog, compact = false }) {
  if (!blog) return null;

  return (
    <article className={`card-hover overflow-hidden group ${compact ? '' : ''}`}>
      {/* Cover image */}
      {blog.coverImage && !compact && (
        <Link to={`/blog/${blog.slug}`}>
          <div className="aspect-video overflow-hidden">
            <img src={blog.coverImage} alt={blog.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
          </div>
        </Link>
      )}

      <div className={`p-5 ${compact ? 'flex gap-4' : ''}`}>
        {compact && blog.coverImage && (
          <Link to={`/blog/${blog.slug}`} className="shrink-0">
            <img src={blog.coverImage} alt={blog.title} className="w-20 h-20 rounded-xl object-cover" loading="lazy" />
          </Link>
        )}

        <div className="flex-1 min-w-0">
          {/* Category */}
          {blog.category && (
            <span className="badge text-xs font-medium mb-2 inline-block"
              style={{ backgroundColor: `${blog.category.color}20`, color: blog.category.color }}>
              {blog.category.icon} {blog.category.name}
            </span>
          )}

          {/* Title */}
          <h2 className={`font-bold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-2 ${compact ? 'text-sm' : 'text-lg mb-2'}`}>
            <Link to={`/blog/${blog.slug}`}>{blog.title}</Link>
          </h2>

          {/* Subtitle */}
          {blog.subtitle && !compact && (
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-3 line-clamp-2">{blog.subtitle}</p>
          )}

          {/* Author & meta */}
          <div className="flex items-center justify-between mt-3">
            <Link to={`/profile/${blog.author?.username}`} className="flex items-center gap-2 group/author">
              {blog.author?.profilePicture
                ? <img src={blog.author.profilePicture} alt={blog.author.name} className="w-7 h-7 rounded-full object-cover" loading="lazy" />
                : <div className="w-7 h-7 rounded-full bg-primary-600 flex items-center justify-center text-white text-xs font-bold">{blog.author?.name?.[0]}</div>
              }
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300 group-hover/author:text-primary-600 dark:group-hover/author:text-primary-400 transition-colors">
                {blog.author?.name}
              </span>
            </Link>

            <div className="flex items-center gap-3 text-xs text-gray-400 dark:text-gray-500">
              <span className="flex items-center gap-1"><Clock size={12} />{blog.readTime}m</span>
              {!compact && (
                <>
                  <span className="flex items-center gap-1"><Heart size={12} />{blog.likesCount || 0}</span>
                  <span className="flex items-center gap-1"><MessageCircle size={12} />{blog.commentsCount || 0}</span>
                </>
              )}
            </div>
          </div>

          {/* Date */}
          {blog.publishedAt && (
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
              {formatDistanceToNow(new Date(blog.publishedAt), { addSuffix: true })}
            </p>
          )}
        </div>
      </div>
    </article>
  );
}
