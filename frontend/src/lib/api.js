import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Contacts
export const getContacts = (params) => api.get('/contacts', { params });
export const getContact = (id) => api.get(`/contacts/${id}`);
export const createContact = (data) => api.post('/contacts', data);
export const updateContact = (id, data) => api.put(`/contacts/${id}`, data);
export const deleteContact = (id) => api.delete(`/contacts/${id}`);

// Interactions
export const getInteractions = (contactId) => api.get(`/contacts/${contactId}/interactions`);
export const createInteraction = (contactId, data) => api.post(`/contacts/${contactId}/interactions`, data);

// Follow-up rules
export const getFollowUpRules = () => api.get('/follow-up-rules');
export const createFollowUpRule = (data) => api.post('/follow-up-rules', data);
export const updateFollowUpRule = (id, data) => api.put(`/follow-up-rules/${id}`, data);
export const deleteFollowUpRule = (id) => api.delete(`/follow-up-rules/${id}`);

// Dashboard
export const getDashboard = () => api.get('/dashboard');

// Feedback
export const submitFeedback = (data) => api.post('/feedback', data);

// Import
export const previewImport = (formData) =>
  api.post('/import/preview', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const confirmImport = (rows) => api.post('/import/confirm', { rows });
