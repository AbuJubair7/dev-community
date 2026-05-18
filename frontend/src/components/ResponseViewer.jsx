import { useState } from 'react';

function highlightJSON(str) {
  if (typeof str !== 'string') str = JSON.stringify(str, null, 2);
  return str.replace(
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
    (match) => {
      if (/^"/.test(match)) {
        if (/:$/.test(match)) return `<span class="json-key">${match}</span>`;
        return `<span class="json-string">${match}</span>`;
      }
      if (/true|false/.test(match)) return `<span class="json-bool">${match}</span>`;
      if (/null/.test(match)) return `<span class="json-null">${match}</span>`;
      return `<span class="json-number">${match}</span>`;
    }
  );
}

function statusClass(code) {
  if (code >= 200 && code < 300) return 'status-2xx';
  if (code >= 300 && code < 400) return 'status-3xx';
  if (code >= 400 && code < 500) return 'status-4xx';
  return 'status-5xx';
}

export default function ResponseViewer({ response, loading }) {
  const [showHeaders, setShowHeaders] = useState(false);

  if (loading) {
    return (
      <div className="response-panel">
        <div className="response-panel-header">
          <span className="response-panel-title">Response</span>
        </div>
        <div className="response-loading">
          <span className="spinner" style={{ width: 22, height: 22, borderWidth: 3 }} />
        </div>
      </div>
    );
  }

  if (!response) {
    return (
      <div className="response-panel">
        <div className="response-panel-header">
          <span className="response-panel-title">Response</span>
        </div>
        <div className="response-empty">
          <div className="response-empty-icon">⚡</div>
          <p>Send a request to see the response here</p>
        </div>
      </div>
    );
  }

  if (response.error) {
    return (
      <div className="response-panel">
        <div className="response-panel-header">
          <span className="response-panel-title">Response</span>
          <span className={`status-badge status-5xx`}>Error</span>
        </div>
        <div className="response-body">
          <div className="response-error">⚠️ {response.message}</div>
        </div>
      </div>
    );
  }

  const isJson = typeof response.data === 'object';
  const bodyStr = isJson
    ? JSON.stringify(response.data, null, 2)
    : String(response.data);

  return (
    <div className="response-panel">
      <div className="response-panel-header">
        <span className="response-panel-title">Response</span>
        <div className="response-meta">
          <span className="response-time">{response.elapsed}ms</span>
          <span className={`status-badge ${statusClass(response.status)}`}>
            {response.status}
          </span>
        </div>
      </div>

      <div className="response-body">
        {/* Body */}
        {isJson ? (
          <div
            className="json-block"
            dangerouslySetInnerHTML={{ __html: highlightJSON(bodyStr) }}
          />
        ) : (
          <pre className="json-block" style={{ color: 'var(--text-primary)' }}>{bodyStr}</pre>
        )}

        {/* Headers */}
        {response.headers?.length > 0 && (
          <div className="response-headers-section">
            <button
              className="collapsible-btn"
              onClick={() => setShowHeaders((v) => !v)}
            >
              {showHeaders ? '▾' : '▸'} Response Headers ({response.headers.length})
            </button>
            {showHeaders && (
              <div className="headers-list">
                {response.headers.map(([k, v], i) => (
                  <div key={i} className="header-row">
                    <span className="header-key">{k}:</span>
                    <span className="header-val mono">{v}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
