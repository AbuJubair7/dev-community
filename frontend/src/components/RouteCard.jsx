import { useState } from 'react';
import { METHOD_COLORS } from '../data/routes.js';
import RequestForm from './RequestForm.jsx';

export default function RouteCard({ route, isActive, onClick, baseUrl, token, onSend, loading, onSetToken }) {
  const mc = METHOD_COLORS[route.method] || { color: '#94a3b8', bg: 'rgba(148,163,184,0.1)' };

  return (
    <div className={`route-card ${isActive ? 'active' : ''}`}>
      <div className="route-card-header" onClick={onClick}>
        <span
          className="method-badge"
          style={{ color: mc.color, background: mc.bg }}
        >
          {route.method}
        </span>
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <div className="route-path">{route.path}</div>
          <div className="route-desc">{route.description}</div>
        </div>
        {route.requiresAuth && <span className="lock-icon" title="JWT required">🔒</span>}
      </div>

      {isActive && (
        <RequestForm
          route={route}
          baseUrl={baseUrl}
          token={token}
          onSend={onSend}
          loading={loading}
          onSetToken={onSetToken}
        />
      )}
    </div>
  );
}
