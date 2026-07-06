import api from './api';

export const createDocument = async (title) => {
  const response = await api.post('/documents', { title });
  return response.data.document;
};

export const listDocuments = async () => {
  const response = await api.get('/documents');
  return response.data.documents;
};

export const getDocument = async (id) => {
  const response = await api.get(`/documents/${id}`);
  return response.data.document;
};

export const updateDocument = async (id, data) => {
  const response = await api.patch(`/documents/${id}`, data);
  return response.data.document;
};

export const deleteDocument = async (id) => {
  await api.delete(`/documents/${id}`);
};

export const importDocument = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post('/documents/import', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data.document;
};

export const shareDocument = async (id, email, permission) => {
  const response = await api.post(`/documents/${id}/share`, { email, permission });
  return response.data.share;
};

export const revokeShare = async (id, userId) => {
  await api.delete(`/documents/${id}/share/${userId}`);
};

export const listSharedWithMe = async () => {
  const response = await api.get('/documents/shared-with-me');
  return response.data.documents;
};

export const listShares = async (id) => {
  const response = await api.get(`/documents/${id}/shares`);
  return response.data.shares;
};
