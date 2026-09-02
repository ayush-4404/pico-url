import api from './axios';

export const createUrl     = (data)     => api.post('/url', data);
export const getMyUrls     = ()          => api.get('/url/my-urls');
export const deleteUrl     = (shortId)   => api.delete(`/url/${shortId}`);
export const toggleActive  = (shortId, isActive) => api.patch(`/url/${shortId}`, { isActive });
export const getAnalytics  = (shortId)   => api.get(`/url/${shortId}/analytics`);
