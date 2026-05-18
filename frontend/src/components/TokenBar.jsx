import { useState } from 'react';

export default function TokenBar({ token, onChange }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!token) return;
    await navigator.clipboard.writeText(token);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="token-section">
      <span className="topbar-label">Token</span>
      <div className="token-input-wrap">
        <input
          className="token-input"
          type="password"
          placeholder="Paste JWT token…"
          value={token}
          onChange={(e) => onChange(e.target.value)}
          title={token || 'No token set'}
        />
      </div>
      <button
        className={`btn-copy ${copied ? 'copied' : ''}`}
        onClick={handleCopy}
        disabled={!token}
        title="Copy token to clipboard"
      >
        {copied ? '✓ Copied' : 'Copy'}
      </button>
    </div>
  );
}
