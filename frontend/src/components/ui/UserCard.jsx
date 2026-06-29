import { Link } from 'react-router-dom';
import { Users } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/userService';
import toast from 'react-hot-toast';

export default function UserCard({ user, showFollowBtn = true }) {
  const { user: currentUser, isAuthenticated } = useAuth();
  const [isFollowing, setIsFollowing] = useState(user.isFollowing || false);
  const [followersCount, setFollowersCount] = useState(user.followersCount || 0);
  const [loading, setLoading] = useState(false);

  const handleFollow = async () => {
    if (!isAuthenticated) { toast.error('Please sign in to follow users'); return; }
    if (loading) return;
    setLoading(true);
    try {
      const res = await userService.toggleFollow(user._id);
      setIsFollowing(res.data.following);
      setFollowersCount(p => res.data.following ? p + 1 : p - 1);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to follow');
    } finally {
      setLoading(false);
    }
  };

  const isSelf = currentUser?._id === user._id;

  return (
    <div className="card p-4 flex items-center gap-3">
      <Link to={`/profile/${user.username}`} className="shrink-0">
        {user.profilePicture
          ? <img src={user.profilePicture} alt={user.name} className="w-12 h-12 rounded-full object-cover" />
          : <div className="w-12 h-12 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold">{user.name?.[0]}</div>
        }
      </Link>
      <div className="flex-1 min-w-0">
        <Link to={`/profile/${user.username}`} className="font-semibold text-sm text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 truncate block">
          {user.name}
        </Link>
        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">@{user.username}</p>
        {user.profession && <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{user.profession}</p>}
        <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5"><Users size={10} />{followersCount} followers</p>
      </div>
      {showFollowBtn && !isSelf && (
        <button onClick={handleFollow} disabled={loading}
          className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all shrink-0 ${
            isFollowing ? 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400' : 'btn-primary py-1.5 px-3'
          }`}>
          {loading ? '...' : isFollowing ? 'Following' : 'Follow'}
        </button>
      )}
    </div>
  );
}
