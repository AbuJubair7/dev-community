import { useState, useEffect } from 'react';

const HAS_BODY = ['POST', 'PATCH', 'PUT'];

export default function RequestForm({ route, baseUrl, token, onSend, loading, onSetToken }) {
  const [urlParams, setUrlParams] = useState({});
  const [body, setBody] = useState('');

  // Reset when route changes
  useEffect(() => {
    const initial = {};
    route.urlParams.forEach((p) => (initial[p] = ''));
    setUrlParams(initial);
    setBody(route.body ? JSON.stringify(route.body, null, 2) : '');
  }, [route]);

  const resolvedPath = route.path.replace(/:(\w+)/g, (_, key) =>
    urlParams[key] || `:${key}`
  );
  const resolvedUrl = `${baseUrl}${resolvedPath}`;

  const handleSend = async () => {
    // Validate URL params
    for (const p of route.urlParams) {
      if (!urlParams[p]) {
        onSend({ error: true, message: `URL parameter "${p}" is required.` });
        return;
      }
    }

    const headers = { 'Content-Type': 'application/json' };
    if (route.requiresAuth && token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const start = performance.now();
    try {
      const res = await fetch(resolvedUrl, {
        method: route.method,
        headers,
        body: HAS_BODY.includes(route.method) && body ? body : undefined,
      });

      const elapsed = Math.round(performance.now() - start);
      const text = await res.text();
      let data;
      try { data = JSON.parse(text); } catch { data = text; }

      // Auto-fill token from response
      if (data && typeof data === 'object') {
        const t = data.access_token || data.token;
        if (t) onSetToken(t);
      }

      onSend({ ok: res.ok, status: res.status, headers: [...res.headers.entries()], data, elapsed });
    } catch {
      onSend({ error: true, message: "Could not reach the server. Make sure the backend is running." });
    }
  };

  return (
    <div className="request-form">
      <div className="divider" />

      {/* Resolved URL */}
      <div className="form-section">
        <span className="form-label">Request URL</span>
        <div className="resolved-url">{resolvedUrl}</div>
      </div>

      {/* URL Params */}
      {route.urlParams.length > 0 && (
        <div className="form-section">
          <span className="form-label">URL Parameters</span>
          {route.urlParams.map((p) => (
            <div key={p} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="mono" style={{ fontSize: 12, color: 'var(--text-muted)', minWidth: 60 }}>:{p}</span>
              <input
                className="form-input"
                placeholder={`Enter ${p}...`}
                value={urlParams[p] || ''}
                onChange={(e) => setUrlParams((prev) => ({ ...prev, [p]: e.target.value }))}
              />
            </div>
          ))}
        </div>
      )}

      {/* Body */}
      {HAS_BODY.includes(route.method) && (
        <div className="form-section">
          <span className="form-label">Request Body (JSON)</span>
          <textarea
            className="form-textarea"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            spellCheck={false}
          />
        </div>
      )}

      {/* Headers Preview */}
      <div className="form-section">
        <span className="form-label">Headers</span>
        <div className="headers-preview">
          <div className="header-row">
            <span className="header-key">Content-Type</span>
            <span className="header-val">application/json</span>
          </div>
          {route.requiresAuth && (
            <div className="header-row">
              <span className="header-key">Authorization</span>
              <span className="header-val" style={{ color: token ? 'var(--success)' : 'var(--danger)' }}>
                {token ? 'Bearer •••••••' : '(no token set)'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Send */}
      <button className="btn-send" onClick={handleSend} disabled={loading}>
        {loading ? <span className="spinner" /> : '⚡'}
        {loading ? 'Sending…' : 'Send Request'}
      </button>
    </div>
  );
}
