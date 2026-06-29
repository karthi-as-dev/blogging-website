import api from './api';

export const userService = {
  getUserProfile: (username) => api.get(`/users/${username}`),
  getUserBlogs: (username, params) => api.get(`/users/${username}/blogs`, { params }),
  getSuggestedUsers: () => api.get('/users/suggested'),

  updateProfile: (data) => api.put('/users/profile', data),

  uploadProfilePicture: (file) => {
    const form = new FormData();
    form.append('profilePicture', file);
    return api.put('/users/profile/picture', form, { headers: { 'Content-Type': 'multipart/form-data' } });
  },

  uploadCoverImage: (file) => {
    const form = new FormData();
    form.append('coverImage', file);
    return api.put('/users/profile/cover', form, { headers: { 'Content-Type': 'multipart/form-data' } });
  },

  changePassword: (data) => api.put('/users/change-password', data),
  deleteAccount: () => api.delete('/users/account'),

  toggleFollow: (userId) => api.post(`/follow/${userId}`),
  getFollowers: (username, params) => api.get(`/follow/${username}/followers`, { params }),
  getFollowing: (username, params) => api.get(`/follow/${username}/following`, { params }),
};
