import { apiFetch } from './api.js';
export const getSkills          = (token)        => apiFetch('/skills',               {}, token);
export const getSkillById       = (id, token)    => apiFetch(`/skills/${id}`,         {}, token);
export const getSkillsByUserId  = (userId, token)=> apiFetch(`/skills/user/${userId}`,{}, token);
export const createSkill        = (body, token)  => apiFetch('/skills',               { method: 'POST',   body: JSON.stringify(body) }, token);
export const updateSkill        = (body, token)  => apiFetch('/skills',               { method: 'PATCH',  body: JSON.stringify(body) }, token);
export const deleteSkill        = (token)        => apiFetch('/skills',               { method: 'DELETE' }, token);
