import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import {
  Heart, MessageCircle, BookMarked, Share2, Clock, Eye, ArrowLeft,
  Copy, Check, Trash2, Edit, UserPlus, UserMinus, Loader
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { blogService } from '../services/blogService';
import { userService } from '../services/userService';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

export default function BlogDetailPage() {
  const { slug } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [replyText, setReplyText] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [editingComment, setEditingComment] = useState(null);
  const [editText, setEditText] = useState('');
  const [likePending, setLikePending] = useState(false);
  const [bookmarkPending, setBookmarkPending] = useState(false);
  const [followPending, setFollowPending] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setLoading(true);
    blogService.getBlogBySlug(slug)
      .then(res => setBlog(res.data.blog))
      .catch(() => navigate('/404'))
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    if (!blog) return;
    setCommentsLoading(true);
    blogService.getComments(blog._id)
      .then(res => setComments(res.data.comments))
      .catch(() => {})
      .finally(() => setCommentsLoading(false));
  }, [blog?._id]);

  const handleLike = async () => {
    if (!isAuthenticated) { toast.error('Sign in to like posts'); return; }
    if (likePending) return;
    setLikePending(true);
    try {
      const res = await blogService.toggleLike(blog._id);
      setBlog(p => ({ ...p, isLiked: res.data.liked, likesCount: res.data.likesCount }));
    } catch (err) { toast.error('Failed to like'); }
    finally { setLikePending(false); }
  };

  const handleBookmark = async () => {
    if (!isAuthenticated) { toast.error('Sign in to bookmark'); return; }
    if (bookmarkPending) return;
    setBookmarkPending(true);
    try {
      const res = await blogService.toggleBookmark(blog._id);
      setBlog(p => ({ ...p, isBookmarked: res.data.bookmarked }));
      toast.success(res.data.bookmarked ? 'Bookmarked!' : 'Removed bookmark');
    } catch { toast.error('Failed'); }
    finally { setBookmarkPending(false); }
  };

  const handleFollow = async () => {
    if (!isAuthenticated) { toast.error('Sign in to follow'); return; }
    if (followPending) return;
    setFollowPending(true);
    try {
      const res = await userService.toggleFollow(blog.author._id);
      setBlog(p => ({ ...p, isFollowingAuthor: res.data.following }));
      toast.success(res.data.following ? `Following ${blog.author.name}` : 'Unfollowed');
    } catch { toast.error('Failed'); }
    finally { setFollowPending(false); }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    toast.success('Link copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    try {
      const res = await blogService.addComment(blog._id, { content: commentText });
      setComments(p => [{ ...res.data.comment, replies: [] }, ...p]);
      setCommentText('');
      setBlog(p => ({ ...p, commentsCount: (p.commentsCount || 0) + 1 }));
      toast.success('Comment added');
    } catch { toast.error('Failed to comment'); }
  };

  const handleReply = async (commentId) => {
    if (!replyText.trim()) return;
    try {
      const res = await blogService.addComment(blog._id, { content: replyText, parentComment: commentId });
      setComments(p => p.map(c => c._id === commentId ? { ...c, replies: [...(c.replies || []), res.data.comment] } : c));
      setReplyText('');
      setReplyingTo(null);
      toast.success('Reply added');
    } catch { toast.error('Failed to reply'); }
  };

  const handleEditComment = async (commentId) => {
    if (!editText.trim()) return;
    try {
      await blogService.editComment(commentId, { content: editText });
      setComments(p => p.map(c => c._id === commentId ? { ...c, content: editText, isEdited: true } : {
        ...c, replies: (c.replies || []).map(r => r._id === commentId ? { ...r, content: editText, isEdited: true } : r)
      }));
      setEditingComment(null);
      toast.success('Comment updated');
    } catch { toast.error('Failed to edit'); }
  };

  const handleDeleteComment = async (commentId) => {
    if (!confirm('Delete this comment?')) return;
    try {
      await blogService.deleteComment(commentId);
      setComments(p => p.filter(c => c._id !== commentId).map(c => ({
        ...c, replies: (c.replies || []).filter(r => r._id !== commentId)
      })));
      setBlog(p => ({ ...p, commentsCount: Math.max(0, (p.commentsCount || 0) - 1) }));
      toast.success('Comment deleted');
    } catch { toast.error('Failed to delete'); }
  };

  if (loading) return <LoadingSpinner fullScreen />;
  if (!blog) return null;

  const isAuthor = user?._id === blog.author?._id;

  return (
    <>
      <Helmet>
        <title>{blog.title} – Inkwell</title>
        <meta name="description" content={blog.subtitle || blog.title} />
        <meta property="og:title" content={blog.title} />
        <meta property="og:image" content={blog.coverImage} />
      </Helmet>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Back button */}
        <button onClick={() => navigate(-1)} className="btn-ghost mb-6 -ml-2">
          <ArrowLeft size={18} /> Back
        </button>

        <article>
          {/* Category & tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {blog.category && (
              <Link to={`/explore?category=${blog.category._id}`}
                className="badge text-xs font-medium"
                style={{ backgroundColor: `${blog.category.color}20`, color: blog.category.color }}>
                {blog.category.icon} {blog.category.name}
              </Link>
            )}
            {blog.tags?.map(tag => (
              <span key={tag} className="badge bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs">#{tag}</span>
            ))}
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white leading-tight mb-3">{blog.title}</h1>
          {blog.subtitle && <p className="text-xl text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">{blog.subtitle}</p>}

          {/* Author row */}
          <div className="flex items-center justify-between py-4 border-y border-gray-100 dark:border-gray-800 mb-6">
            <div className="flex items-center gap-3">
              <Link to={`/profile/${blog.author?.username}`}>
                {blog.author?.profilePicture
                  ? <img src={blog.author.profilePicture} alt={blog.author.name} className="w-12 h-12 rounded-full object-cover" />
                  : <div className="w-12 h-12 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold">{blog.author?.name?.[0]}</div>
                }
              </Link>
              <div>
                <Link to={`/profile/${blog.author?.username}`} className="font-semibold text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  {blog.author?.name}
                </Link>
                <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                  <span>{blog.publishedAt && format(new Date(blog.publishedAt), 'MMM d, yyyy')}</span>
                  <span className="flex items-center gap-1"><Clock size={11} />{blog.readTime} min read</span>
                  <span className="flex items-center gap-1"><Eye size={11} />{blog.views} views</span>
                </div>
              </div>
            </div>

            {/* Follow button */}
            {isAuthenticated && !isAuthor && (
              <button onClick={handleFollow} disabled={followPending}
                className={`flex items-center gap-1.5 text-sm px-4 py-2 rounded-xl font-medium transition-all ${
                  blog.isFollowingAuthor ? 'btn-outline' : 'btn-primary'
                }`}>
                {followPending ? <Loader size={14} className="animate-spin" /> : blog.isFollowingAuthor ? <><UserMinus size={14} />Following</> : <><UserPlus size={14} />Follow</>}
              </button>
            )}

            {/* Edit/Delete for author */}
            {isAuthor && (
              <div className="flex gap-2">
                <Link to={`/edit/${blog._id}`} className="btn-outline flex items-center gap-1.5 text-sm py-2"><Edit size={14} />Edit</Link>
              </div>
            )}
          </div>

          {/* Cover image */}
          {blog.coverImage && (
            <div className="rounded-2xl overflow-hidden mb-8 aspect-video">
              <img src={blog.coverImage} alt={blog.title} className="w-full h-full object-cover" />
            </div>
          )}

          {/* Content */}
          <div className="prose prose-lg dark:prose-dark max-w-none prose-headings:font-bold prose-a:text-primary-600"
            dangerouslySetInnerHTML={{ __html: blog.content }} />

          {/* Action bar */}
          <div className="flex items-center gap-4 py-6 mt-8 border-y border-gray-100 dark:border-gray-800">
            <button onClick={handleLike} disabled={likePending}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                blog.isLiked ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400' : 'btn-ghost'
              }`}>
              <Heart size={18} className={blog.isLiked ? 'fill-current' : ''} />
              {blog.likesCount || 0}
            </button>

            <button onClick={() => document.getElementById('comments').scrollIntoView({ behavior: 'smooth' })}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium btn-ghost">
              <MessageCircle size={18} />
              {blog.commentsCount || 0}
            </button>

            <button onClick={handleBookmark} disabled={bookmarkPending}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                blog.isBookmarked ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' : 'btn-ghost'
              }`}>
              <BookMarked size={18} className={blog.isBookmarked ? 'fill-current' : ''} />
              {blog.isBookmarked ? 'Saved' : 'Save'}
            </button>

            <button onClick={handleCopy} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium btn-ghost ml-auto">
              {copied ? <><Check size={18} className="text-green-500" />Copied!</> : <><Share2 size={18} />Share</>}
            </button>
          </div>
        </article>

        {/* Author bio card */}
        <div className="card p-6 mt-8">
          <div className="flex items-start gap-4">
            <Link to={`/profile/${blog.author?.username}`}>
              {blog.author?.profilePicture
                ? <img src={blog.author.profilePicture} alt={blog.author.name} className="w-16 h-16 rounded-full object-cover" />
                : <div className="w-16 h-16 rounded-full bg-primary-600 flex items-center justify-center text-white text-xl font-bold">{blog.author?.name?.[0]}</div>
              }
            </Link>
            <div className="flex-1">
              <Link to={`/profile/${blog.author?.username}`} className="font-bold text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                {blog.author?.name}
              </Link>
              {blog.author?.profession && <p className="text-sm text-primary-600 dark:text-primary-400">{blog.author.profession}</p>}
              {blog.author?.bio && <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 leading-relaxed">{blog.author.bio}</p>}
              <p className="text-xs text-gray-400 mt-2">{blog.author?.followersCount || 0} followers</p>
            </div>
          </div>
        </div>

        {/* Comments section */}
        <section id="comments" className="mt-10">
          <h2 className="section-heading mb-6">Comments ({blog.commentsCount || 0})</h2>

          {/* Add comment */}
          {isAuthenticated ? (
            <form onSubmit={handleComment} className="mb-8">
              <div className="flex gap-3">
                {user?.profilePicture
                  ? <img src={user.profilePicture} alt={user.name} className="w-10 h-10 rounded-full object-cover shrink-0" />
                  : <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold shrink-0">{user?.name?.[0]}</div>
                }
                <div className="flex-1">
                  <textarea value={commentText} onChange={e => setCommentText(e.target.value)}
                    placeholder="Share your thoughts..."
                    className="input-field resize-none" rows={3} />
                  <div className="flex justify-end mt-2">
                    <button type="submit" className="btn-primary text-sm py-2" disabled={!commentText.trim()}>Post Comment</button>
                  </div>
                </div>
              </div>
            </form>
          ) : (
            <div className="text-center py-8 card mb-8">
              <p className="text-gray-500 dark:text-gray-400 mb-3">Sign in to join the conversation</p>
              <Link to="/login" className="btn-primary">Sign In</Link>
            </div>
          )}

          {/* Comments list */}
          {commentsLoading ? <LoadingSpinner /> : (
            <div className="space-y-6">
              {comments.map(comment => (
                <motion.div key={comment._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className="flex gap-3">
                  <Link to={`/profile/${comment.author?.username}`} className="shrink-0">
                    {comment.author?.profilePicture
                      ? <img src={comment.author.profilePicture} alt={comment.author.name} className="w-9 h-9 rounded-full object-cover" />
                      : <div className="w-9 h-9 rounded-full bg-primary-600 flex items-center justify-center text-white text-sm font-bold">{comment.author?.name?.[0]}</div>
                    }
                  </Link>
                  <div className="flex-1">
                    <div className="card p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <Link to={`/profile/${comment.author?.username}`} className="font-semibold text-sm text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                            {comment.author?.name}
                          </Link>
                          <span className="text-xs text-gray-400 ml-2">
                            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                            {comment.isEdited && ' (edited)'}
                          </span>
                        </div>
                        {(user?._id === comment.author?._id || user?.role === 'admin') && (
                          <div className="flex gap-1">
                            {user?._id === comment.author?._id && (
                              <button onClick={() => { setEditingComment(comment._id); setEditText(comment.content); }}
                                className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-primary-600 transition-colors">
                                <Edit size={13} />
                              </button>
                            )}
                            <button onClick={() => handleDeleteComment(comment._id)}
                              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-red-600 transition-colors">
                              <Trash2 size={13} />
                            </button>
                          </div>
                        )}
                      </div>

                      {editingComment === comment._id ? (
                        <div>
                          <textarea value={editText} onChange={e => setEditText(e.target.value)} className="input-field resize-none text-sm" rows={3} />
                          <div className="flex gap-2 mt-2">
                            <button onClick={() => handleEditComment(comment._id)} className="btn-primary text-xs py-1.5">Save</button>
                            <button onClick={() => setEditingComment(null)} className="btn-ghost text-xs py-1.5">Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{comment.content}</p>
                      )}
                    </div>

                    {/* Reply button */}
                    {isAuthenticated && (
                      <button onClick={() => setReplyingTo(replyingTo === comment._id ? null : comment._id)}
                        className="text-xs text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 mt-2 ml-2 font-medium transition-colors">
                        Reply
                      </button>
                    )}

                    {/* Reply input */}
                    {replyingTo === comment._id && (
                      <div className="mt-3 flex gap-2">
                        <textarea value={replyText} onChange={e => setReplyText(e.target.value)}
                          placeholder={`Reply to ${comment.author?.name}...`}
                          className="input-field resize-none flex-1 text-sm" rows={2} />
                        <div className="flex flex-col gap-2">
                          <button onClick={() => handleReply(comment._id)} className="btn-primary text-xs py-2">Reply</button>
                          <button onClick={() => setReplyingTo(null)} className="btn-ghost text-xs py-2">Cancel</button>
                        </div>
                      </div>
                    )}

                    {/* Replies */}
                    {comment.replies?.length > 0 && (
                      <div className="mt-3 ml-4 space-y-3">
                        {comment.replies.map(reply => (
                          <div key={reply._id} className="flex gap-3">
                            <Link to={`/profile/${reply.author?.username}`} className="shrink-0">
                              {reply.author?.profilePicture
                                ? <img src={reply.author.profilePicture} alt={reply.author.name} className="w-7 h-7 rounded-full object-cover" />
                                : <div className="w-7 h-7 rounded-full bg-primary-600 flex items-center justify-center text-white text-xs font-bold">{reply.author?.name?.[0]}</div>
                              }
                            </Link>
                            <div className="flex-1 card p-3">
                              <div className="flex items-center justify-between mb-1">
                                <div>
                                  <Link to={`/profile/${reply.author?.username}`} className="font-semibold text-xs text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400">{reply.author?.name}</Link>
                                  <span className="text-xs text-gray-400 ml-2">{formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}{reply.isEdited && ' (edited)'}</span>
                                </div>
                                {(user?._id === reply.author?._id || user?.role === 'admin') && (
                                  <div className="flex gap-1">
                                    {user?._id === reply.author?._id && (
                                      <button onClick={() => { setEditingComment(reply._id); setEditText(reply.content); }}
                                        className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-primary-600 transition-colors">
                                        <Edit size={12} />
                                      </button>
                                    )}
                                    <button onClick={() => handleDeleteComment(reply._id)} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-red-500 transition-colors">
                                      <Trash2 size={12} />
                                    </button>
                                  </div>
                                )}
                              </div>
                              {editingComment === reply._id ? (
                                <div>
                                  <textarea value={editText} onChange={e => setEditText(e.target.value)} className="input-field resize-none text-xs" rows={2} />
                                  <div className="flex gap-2 mt-2">
                                    <button onClick={() => handleEditComment(reply._id)} className="btn-primary text-xs py-1">Save</button>
                                    <button onClick={() => setEditingComment(null)} className="btn-ghost text-xs py-1">Cancel</button>
                                  </div>
                                </div>
                              ) : (
                                <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">{reply.content}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}

              {comments.length === 0 && (
                <div className="text-center py-12 text-gray-400 dark:text-gray-500">
                  <MessageCircle size={40} className="mx-auto mb-3 opacity-30" />
                  <p className="font-medium">No comments yet</p>
                  <p className="text-sm">Be the first to share your thoughts</p>
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
