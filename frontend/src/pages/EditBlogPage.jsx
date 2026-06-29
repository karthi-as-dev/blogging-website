import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Image, X, Loader, Eye, FileText } from 'lucide-react';
import BlogEditor from '../components/BlogEditor';
import { blogService } from '../services/blogService';
import api from '../services/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/ui/LoadingSpinner';

export default function EditBlogPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [coverPreview, setCoverPreview] = useState('');

  const [form, setForm] = useState({
    title: '', subtitle: '', content: '', category: '', tags: [],
    status: 'draft', coverImage: null,
  });
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    Promise.all([
      blogService.getBlogById(id),
      api.get('/categories'),
    ]).then(([blogRes, catRes]) => {
      const blog = blogRes.data.blog;
      setForm({
        title: blog.title || '',
        subtitle: blog.subtitle || '',
        content: blog.content || '',
        category: blog.category?._id || '',
        tags: blog.tags || [],
        status: blog.status,
        coverImage: null,
      });
      setCoverPreview(blog.coverImage || '');
      setCategories(catRes.data.categories || []);
    }).catch(() => {
      toast.error('Failed to load blog');
      navigate('/dashboard');
    }).finally(() => setLoading(false));
  }, [id]);

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setForm(p => ({ ...p, coverImage: file }));
    setCoverPreview(URL.createObjectURL(file));
  };

  const addTag = () => {
    const t = tagInput.trim().toLowerCase().replace(/\s+/g, '-');
    if (t && !form.tags.includes(t) && form.tags.length < 10) {
      setForm(p => ({ ...p, tags: [...p.tags, t] }));
      setTagInput('');
    }
  };

  const removeTag = (tag) => setForm(p => ({ ...p, tags: p.tags.filter(t => t !== tag) }));

  const handleSave = async (status) => {
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    if (!form.content || form.content === '<p></p>') { toast.error('Content is required'); return; }

    setSaving(true);
    try {
      const data = { ...form, status };
      const res = await blogService.updateBlog(id, data);
      toast.success(status === 'published' ? 'Blog published!' : 'Draft saved!');
      navigate(status === 'published' ? `/blog/${res.data.blog.slug}` : '/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update blog');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <>
      <Helmet><title>Edit Blog – Inkwell</title></Helmet>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Blog</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Make your changes and save</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => handleSave('draft')} disabled={saving} className="btn-outline flex items-center gap-2">
              {saving ? <Loader size={16} className="animate-spin" /> : <FileText size={16} />} Save Draft
            </button>
            <button onClick={() => handleSave('published')} disabled={saving} className="btn-primary flex items-center gap-2">
              {saving ? <Loader size={16} className="animate-spin" /> : <Eye size={16} />} Publish
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {/* Cover image */}
          <div>
            {coverPreview ? (
              <div className="relative aspect-video rounded-2xl overflow-hidden group">
                <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <label className="btn-primary cursor-pointer"><Image size={16} />Change cover
                    <input type="file" accept="image/*" onChange={handleCoverChange} className="hidden" />
                  </label>
                </div>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl py-12 cursor-pointer hover:border-primary-400 transition-colors group">
                <Image size={40} className="text-gray-300 dark:text-gray-600 mb-3 group-hover:text-primary-400 transition-colors" />
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Add a cover image</span>
                <input type="file" accept="image/*" onChange={handleCoverChange} className="hidden" />
              </label>
            )}
          </div>

          <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
            placeholder="Blog title..."
            className="w-full text-3xl md:text-4xl font-black bg-transparent border-none outline-none placeholder-gray-300 dark:placeholder-gray-700 text-gray-900 dark:text-white" />

          <input value={form.subtitle} onChange={e => setForm(p => ({ ...p, subtitle: e.target.value }))}
            placeholder="A brief subtitle (optional)..."
            className="w-full text-lg bg-transparent border-none outline-none placeholder-gray-300 dark:placeholder-gray-700 text-gray-600 dark:text-gray-400" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Category</label>
              <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} className="input-field">
                <option value="">Select a category</option>
                {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.icon} {cat.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Tags</label>
              <div className="flex flex-wrap gap-2 p-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 min-h-[44px]">
                {form.tags.map(tag => (
                  <span key={tag} className="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-lg text-xs font-medium">
                    #{tag}
                    <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-500"><X size={10} /></button>
                  </span>
                ))}
                <input value={tagInput} onChange={e => setTagInput(e.target.value)}
                  onKeyDown={e => (e.key === 'Enter' || e.key === ',') && (e.preventDefault(), addTag())}
                  placeholder="Add tag..." className="flex-1 min-w-[80px] bg-transparent outline-none text-xs text-gray-700 dark:text-gray-300 placeholder-gray-400" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Content</label>
            <BlogEditor content={form.content} onChange={v => setForm(p => ({ ...p, content: v }))} />
          </div>
        </div>
      </div>
    </>
  );
}
