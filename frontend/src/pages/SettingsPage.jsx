import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { User, Lock, Trash2, Camera, X, Loader, Sun, Moon, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { userService } from '../services/userService';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const Section = ({ title, children }) => (
  <div className="card p-6">
    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 pb-3 border-b border-gray-100 dark:border-gray-800">{title}</h2>
    {children}
  </div>
);

export default function SettingsPage() {
  const { user, updateUser, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [picLoading, setPicLoading] = useState(false);
  const [coverLoading, setCoverLoading] = useState(false);
  const [skillInput, setSkillInput] = useState('');

  const [profile, setProfile] = useState({
    name: user?.name || '', bio: user?.bio || '', profession: user?.profession || '',
    location: user?.location || '', website: user?.website || '',
    skills: user?.skills || [],
    socialLinks: {
      twitter: user?.socialLinks?.twitter || '',
      github: user?.socialLinks?.github || '',
      linkedin: user?.socialLinks?.linkedin || '',
      instagram: user?.socialLinks?.instagram || '',
    },
  });

  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    try {
      const res = await userService.updateProfile(profile);
      updateUser(res.data.user);
      toast.success('Profile updated');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to update profile'); }
    finally { setProfileLoading(false); }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) { toast.error('Passwords do not match'); return; }
    if (passwords.newPassword.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setPasswordLoading(true);
    try {
      await userService.changePassword({ currentPassword: passwords.currentPassword, newPassword: passwords.newPassword });
      toast.success('Password changed successfully');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to change password'); }
    finally { setPasswordLoading(false); }
  };

  const handleProfilePicChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPicLoading(true);
    try {
      const res = await userService.uploadProfilePicture(file);
      updateUser({ profilePicture: res.data.profilePicture });
      toast.success('Profile picture updated');
    } catch { toast.error('Failed to upload'); }
    finally { setPicLoading(false); }
  };

  const handleCoverChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setCoverLoading(true);
    try {
      const res = await userService.uploadCoverImage(file);
      updateUser({ coverImage: res.data.coverImage });
      toast.success('Cover image updated');
    } catch { toast.error('Failed to upload'); }
    finally { setCoverLoading(false); }
  };

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This action is irreversible.')) return;
    if (!confirm('Last chance — this will permanently delete all your data.')) return;
    try {
      await userService.deleteAccount();
      logout();
      navigate('/');
      toast.success('Account deleted');
    } catch { toast.error('Failed to delete account'); }
  };

  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !profile.skills.includes(s) && profile.skills.length < 20) {
      setProfile(p => ({ ...p, skills: [...p.skills, s] }));
      setSkillInput('');
    }
  };

  const removeSkill = (skill) => setProfile(p => ({ ...p, skills: p.skills.filter(s => s !== skill) }));

  return (
    <>
      <Helmet><title>Settings – Inkwell</title></Helmet>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>

        {/* Profile picture & cover */}
        <Section title="Profile Images">
          <div className="space-y-4">
            {/* Profile pic */}
            <div className="flex items-center gap-4">
              <div className="relative">
                {user?.profilePicture
                  ? <img src={user.profilePicture} alt={user.name} className="w-20 h-20 rounded-full object-cover" />
                  : <div className="w-20 h-20 rounded-full bg-primary-600 flex items-center justify-center text-white text-2xl font-bold">{user?.name?.[0]}</div>
                }
                {picLoading && (
                  <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
                    <Loader size={20} className="animate-spin text-white" />
                  </div>
                )}
              </div>
              <div>
                <p className="font-medium text-sm text-gray-900 dark:text-white mb-1">Profile Picture</p>
                <label className="btn-outline text-xs py-2 cursor-pointer">
                  <Camera size={14} /> Change Photo
                  <input type="file" accept="image/*" onChange={handleProfilePicChange} className="hidden" />
                </label>
              </div>
            </div>

            {/* Cover image */}
            <div>
              <p className="font-medium text-sm text-gray-900 dark:text-white mb-2">Cover Image</p>
              {user?.coverImage ? (
                <div className="relative h-24 rounded-xl overflow-hidden group">
                  <img src={user.coverImage} alt="Cover" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <label className="btn-primary text-xs cursor-pointer">
                      <Camera size={14} />Change
                      <input type="file" accept="image/*" onChange={handleCoverChange} className="hidden" />
                    </label>
                  </div>
                </div>
              ) : (
                <label className="flex items-center justify-center border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl h-24 cursor-pointer hover:border-primary-400 transition-colors">
                  <div className="text-center">
                    <Camera size={20} className="mx-auto text-gray-400 mb-1" />
                    <span className="text-xs text-gray-400">Upload cover image</span>
                  </div>
                  <input type="file" accept="image/*" onChange={handleCoverChange} className="hidden" />
                </label>
              )}
            </div>
          </div>
        </Section>

        {/* Profile info */}
        <Section title="Profile Information">
          <form onSubmit={handleProfileSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Full Name</label>
                <input value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Profession</label>
                <input value={profile.profession} onChange={e => setProfile(p => ({ ...p, profession: e.target.value }))} placeholder="e.g. Full Stack Developer" className="input-field" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Bio</label>
              <textarea value={profile.bio} onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))}
                placeholder="Tell us about yourself..." rows={3} className="input-field resize-none" maxLength={500} />
              <p className="text-xs text-gray-400 mt-1 text-right">{profile.bio.length}/500</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Location</label>
                <input value={profile.location} onChange={e => setProfile(p => ({ ...p, location: e.target.value }))} placeholder="City, Country" className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Website</label>
                <input value={profile.website} onChange={e => setProfile(p => ({ ...p, website: e.target.value }))} placeholder="https://..." className="input-field" />
              </div>
            </div>

            {/* Skills */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Skills</label>
              <div className="flex flex-wrap gap-2 p-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 min-h-[44px]">
                {profile.skills.map(skill => (
                  <span key={skill} className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-lg text-xs font-medium">
                    {skill}<button type="button" onClick={() => removeSkill(skill)} className="hover:text-red-500"><X size={10} /></button>
                  </span>
                ))}
                <input value={skillInput} onChange={e => setSkillInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                  placeholder="Add skill..." className="flex-1 min-w-[80px] bg-transparent outline-none text-xs text-gray-700 dark:text-gray-300 placeholder-gray-400" />
              </div>
              <button type="button" onClick={addSkill}
                className="mt-2 inline-flex items-center gap-1 text-xs text-primary-600 dark:text-primary-400 hover:underline font-medium">
                <Plus size={12} /> Add skill
              </button>
            </div>

            {/* Social links */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Social Links</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {['twitter', 'github', 'linkedin', 'instagram'].map(key => (
                  <div key={key}>
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1 capitalize">{key}</label>
                    <input value={profile.socialLinks[key]} onChange={e => setProfile(p => ({ ...p, socialLinks: { ...p.socialLinks, [key]: e.target.value } }))}
                      placeholder={`${key} username`} className="input-field text-sm py-2" />
                  </div>
                ))}
              </div>
            </div>

            <button type="submit" disabled={profileLoading} className="btn-primary w-full justify-center">
              {profileLoading ? <><Loader size={16} className="animate-spin" />Saving...</> : 'Save Changes'}
            </button>
          </form>
        </Section>

        {/* Appearance */}
        <Section title="Appearance">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm text-gray-900 dark:text-white">Theme</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Switch between light and dark mode</p>
            </div>
            <button onClick={toggleTheme} className={`relative w-14 h-7 rounded-full transition-colors ${isDark ? 'bg-primary-600' : 'bg-gray-200'}`}>
              <span className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow-sm flex items-center justify-center transition-transform ${isDark ? 'translate-x-7' : ''}`}>
                {isDark ? <Moon size={12} className="text-primary-600" /> : <Sun size={12} className="text-yellow-500" />}
              </span>
            </button>
          </div>
        </Section>

        {/* Change password */}
        {user?.authProvider !== 'google' && (
          <Section title="Change Password">
            <form onSubmit={handlePasswordChange} className="space-y-4">
              {[
                { key: 'currentPassword', label: 'Current Password' },
                { key: 'newPassword', label: 'New Password' },
                { key: 'confirmPassword', label: 'Confirm New Password' },
              ].map(field => (
                <div key={field.key}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{field.label}</label>
                  <input type="password" value={passwords[field.key]}
                    onChange={e => setPasswords(p => ({ ...p, [field.key]: e.target.value }))}
                    className="input-field" required />
                </div>
              ))}
              <button type="submit" disabled={passwordLoading} className="btn-primary justify-center">
                {passwordLoading ? <><Loader size={16} className="animate-spin" />Changing...</> : 'Change Password'}
              </button>
            </form>
          </Section>
        )}

        {/* Danger zone */}
        <Section title="Danger Zone">
          <div className="flex items-center justify-between p-4 border border-red-200 dark:border-red-800 rounded-xl bg-red-50/50 dark:bg-red-900/10">
            <div>
              <p className="font-medium text-sm text-red-700 dark:text-red-400">Delete Account</p>
              <p className="text-xs text-red-500 dark:text-red-500 mt-0.5">Permanently delete your account and all data</p>
            </div>
            <button onClick={handleDeleteAccount} className="btn-danger text-sm py-2 flex items-center gap-1.5">
              <Trash2 size={14} /> Delete
            </button>
          </div>
        </Section>
      </div>
    </>
  );
}
