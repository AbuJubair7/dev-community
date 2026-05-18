import { apiFetch } from './api.js';
export const getExperiences          = (token)        => apiFetch('/experiences',               {}, token);
export const getExperienceById       = (id, token)    => apiFetch(`/experiences/${id}`,         {}, token);
export const getExperiencesByUserId  = (userId, token)=> apiFetch(`/experiences/user/${userId}`,{}, token);
export const createExperience        = (body, token)  => apiFetch('/experiences',               { method: 'POST',   body: JSON.stringify(body) }, token);
export const updateExperience        = (body, token)  => apiFetch('/experiences',               { method: 'PATCH',  body: JSON.stringify(body) }, token);
export const deleteExperience        = (token)        => apiFetch('/experiences',               { method: 'DELETE' }, token);
