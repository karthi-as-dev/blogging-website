import api from './api';

export const blogService = {
  getBlogs: (params) => api.get('/blogs', { params }),
  getFeed: (params) => api.get('/blogs/feed', { params }),
  getBlogBySlug: (slug) => api.get(`/blogs/${slug}`),
  getBlogById: (id) => api.get(`/blogs/edit/${id}`),
  getTrendingBlogs: () => api.get('/blogs/trending'),
  getFeaturedBlogs: () => api.get('/blogs/featured'),
  getDashboardStats: () => api.get('/blogs/dashboard'),

  createBlog: (data) => {
    const form = new FormData();
    Object.entries(data).forEach(([k, v]) => {
      if (v !== undefined && v !== null) {
        if (k === 'tags' && Array.isArray(v)) form.append(k, v.join(','));
        else form.append(k, v);
      }
    });
    return api.post('/blogs', form, { headers: { 'Content-Type': 'multipart/form-data' } });
  },

  updateBlog: (id, data) => {
    const form = new FormData();
    Object.entries(data).forEach(([k, v]) => {
      if (v !== undefined && v !== null) {
        if (k === 'tags' && Array.isArray(v)) form.append(k, v.join(','));
        else form.append(k, v);
      }
    });
    return api.put(`/blogs/${id}`, form, { headers: { 'Content-Type': 'multipart/form-data' } });
  },

  deleteBlog: (id) => api.delete(`/blogs/${id}`),
  toggleLike: (blogId) => api.post(`/likes/${blogId}`),
  toggleBookmark: (blogId) => api.post(`/bookmarks/${blogId}`),
  getBookmarks: (params) => api.get('/bookmarks', { params }),

  getComments: (blogId, params) => api.get(`/comments/blog/${blogId}`, { params }),
  addComment: (blogId, data) => api.post(`/comments/blog/${blogId}`, data),
  editComment: (id, data) => api.put(`/comments/${id}`, data),
  deleteComment: (id) => api.delete(`/comments/${id}`),

  uploadImage: (file) => {
    const form = new FormData();
    form.append('image', file);
    return api.post('/upload/image', form, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
};
