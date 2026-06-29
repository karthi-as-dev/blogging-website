import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import {
  MapPin, Globe, Twitter, Github, Linkedin, Instagram,
  UserPlus, UserMinus, Users, BookOpen, Heart, Calendar, Loader
} from 'lucide-react';
import { format } from 'date-fns';
import { userService } from '../services/userService';
import { useAuth } from '../context/AuthContext';
import BlogCard from '../components/ui/BlogCard';
import SkeletonCard from '../components/ui/SkeletonCard';
import Pagination from '../components/ui/Pagination';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { username } = useParams();
  const { user: currentUser, isAuthenticated } = useAuth();
  const [profile, setProfile] = useState(null);
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [blogsLoading, setBlogsLoading] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [tab, setTab] = useState('posts');

  useEffect(() => {
    setLoading(true);
    userService.getUserProfile(username)
      .then(res => setProfile(res.data.user))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [username]);

  useEffect(() => {
    if (!profile) return;
    setBlogsLoading(true);
    userService.getUserBlogs(username, { page })
      .then(res => { setBlogs(res.data.blogs); setPages(res.data.pages); })
      .catch(() => {})
      .finally(() => setBlogsLoading(false));
  }, [profile?._id, page]);

  const handleFollow = async () => {
    if (!isAuthenticated) { toast.error('Sign in to follow'); return; }
    setFollowLoading(true);
    try {
      const res = await userService.toggleFollow(profile._id);
      setProfile(p => ({
        ...p,
        isFollowing: res.data.following,
        followersCount: res.data.following ? p.followersCount + 1 : p.followersCount - 1,
      }));
      toast.success(res.data.following ? `Following ${profile.name}` : 'Unfollowed');
    } catch (err) { toast.error('Failed'); }
    finally { setFollowLoading(false); }
  };

  if (loading) return <LoadingSpinner fullScreen />;
  if (!profile) return (
    <div className="flex flex-col items-center justify-center py-24 text-gray-500 dark:text-gray-400">
      <Users size={60} className="mb-4 opacity-30" />
      <h2 className="text-xl font-bold mb-2">User not found</h2>
      <Link to="/" className="btn-primary mt-4">Go Home</Link>
    </div>
  );

  const isSelf = currentUser?._id === profile._id;

  return (
    <>
      <Helmet>
        <title>{profile.name} (@{profile.username}) – Inkwell</title>
        <meta name="description" content={profile.bio || `${profile.name}'s profile on Inkwell`} />
      </Helmet>

      {/* Cover Image */}
      <div className="h-48 md:h-64 bg-gradient-to-br from-primary-500 via-purple-600 to-pink-500 relative overflow-hidden">
        {profile.coverImage && (
          <img src={profile.coverImage} alt="Cover" className="w-full h-full object-cover" />
        )}
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile header */}
        <div className="relative pb-6 border-b border-gray-100 dark:border-gray-800">
          {/* Avatar */}
          <div className="absolute -top-16 left-0">
            {profile.profilePicture
              ? <img src={profile.profilePicture} alt={profile.name} className="w-28 h-28 rounded-2xl object-cover border-4 border-white dark:border-gray-900 shadow-lg" />
              : <div className="w-28 h-28 rounded-2xl bg-primary-600 flex items-center justify-center text-white text-4xl font-black border-4 border-white dark:border-gray-900 shadow-lg">{profile.name?.[0]}</div>
            }
          </div>

          {/* Actions */}
          <div className="flex justify-end pt-4 gap-3">
            {isSelf ? (
              <Link to="/settings" className="btn-outline">Edit Profile</Link>
            ) : (
              isAuthenticated && (
                <button onClick={handleFollow} disabled={followLoading}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    profile.isFollowing ? 'btn-outline' : 'btn-primary'
                  }`}>
                  {followLoading ? <Loader size={16} className="animate-spin" /> : profile.isFollowing ? <><UserMinus size={16} />Following</> : <><UserPlus size={16} />Follow</>}
                </button>
              )
            )}
          </div>

          {/* Name & info */}
          <div className="mt-16">
            <h1 className="text-2xl font-black text-gray-900 dark:text-white">{profile.name}</h1>
            <p className="text-gray-500 dark:text-gray-400">@{profile.username}</p>

            {profile.profession && (
              <p className="text-primary-600 dark:text-primary-400 font-medium mt-1">{profile.profession}</p>
            )}

            {profile.bio && (
              <p className="text-gray-600 dark:text-gray-400 mt-3 max-w-2xl leading-relaxed">{profile.bio}</p>
            )}

            {/* Skills */}
            {profile.skills?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {profile.skills.map(skill => (
                  <span key={skill} className="badge bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 text-xs">{skill}</span>
                ))}
              </div>
            )}

            {/* Meta info */}
            <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-500 dark:text-gray-400">
              {profile.location && <span className="flex items-center gap-1"><MapPin size={14} />{profile.location}</span>}
              {profile.website && (
                <a href={profile.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  <Globe size={14} />{profile.website.replace(/https?:\/\//, '')}
                </a>
              )}
              <span className="flex items-center gap-1">
                <Calendar size={14} />Joined {format(new Date(profile.createdAt), 'MMM yyyy')}
              </span>
            </div>

            {/* Social links */}
            <div className="flex gap-3 mt-3">
              {[
                { key: 'twitter', icon: Twitter, prefix: 'https://twitter.com/' },
                { key: 'github', icon: Github, prefix: 'https://github.com/' },
                { key: 'linkedin', icon: Linkedin, prefix: 'https://linkedin.com/in/' },
                { key: 'instagram', icon: Instagram, prefix: 'https://instagram.com/' },
              ].map(({ key, icon: Icon, prefix }) =>
                profile.socialLinks?.[key] ? (
                  <a key={key} href={`${prefix}${profile.socialLinks[key]}`} target="_blank" rel="noopener noreferrer"
                    className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-primary-100 dark:hover:bg-primary-900/30 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                    <Icon size={16} />
                  </a>
                ) : null
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-6 mt-5 text-center">
            {[
              { label: 'Posts', value: profile.totalPosts, icon: BookOpen },
              { label: 'Followers', value: profile.followersCount, icon: Users },
              { label: 'Following', value: profile.followingCount, icon: Users },
              { label: 'Likes', value: profile.totalLikesReceived, icon: Heart },
            ].map(stat => (
              <div key={stat.label}>
                <p className="text-xl font-black text-gray-900 dark:text-white">{stat.value || 0}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mt-6 mb-6">
          {['posts', 'about'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                tab === t ? 'bg-primary-600 text-white' : 'btn-ghost'
              }`}>{t}</button>
          ))}
        </div>

        {tab === 'posts' && (
          <div className="pb-12">
            {blogsLoading ? (
              <div className="grid gap-6">{[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}</div>
            ) : blogs.length > 0 ? (
              <>
                <div className="grid gap-6">
                  {blogs.map((blog, i) => (
                    <motion.div key={blog._id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                      <BlogCard blog={blog} />
                    </motion.div>
                  ))}
                </div>
                <Pagination page={page} pages={pages} onPageChange={setPage} />
              </>
            ) : (
              <div className="text-center py-20 text-gray-400 dark:text-gray-500">
                <BookOpen size={48} className="mx-auto mb-4 opacity-30" />
                <p className="font-medium">No posts yet</p>
                {isSelf && <Link to="/write" className="btn-primary mt-4 inline-flex">Write your first post</Link>}
              </div>
            )}
          </div>
        )}

        {tab === 'about' && (
          <div className="pb-12 max-w-2xl space-y-6">
            {profile.bio && (
              <div className="card p-5">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">About</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{profile.bio}</p>
              </div>
            )}
            {profile.skills?.length > 0 && (
              <div className="card p-5">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map(s => <span key={s} className="badge bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300">{s}</span>)}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
