import { apiFetch } from './api.js';
export const getPosts    = (token)       => apiFetch('/posts',          {}, token);
export const getPostById = (id, token)   => apiFetch(`/posts/${id}`,   {}, token);
export const createPost  = (body, token) => apiFetch('/posts',          { method: 'POST',   body: JSON.stringify(body) }, token);
export const updatePost  = (body, token) => apiFetch('/posts',          { method: 'PATCH',  body: JSON.stringify(body) }, token);
export const deletePost  = (token)       => apiFetch('/posts',          { method: 'DELETE' }, token);
