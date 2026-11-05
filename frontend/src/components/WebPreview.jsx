import React, { useRef, useState } from 'react';
import { RefreshCw, ExternalLink, Globe } from 'lucide-react';

export default function WebPreview({ htmlContent }) {
  const [key, setKey] = useState(0);

  const handleRefresh = () => {
    setKey((prev) => prev + 1);
  };

  const handleOpenNewTab = () => {
    const blob = new Blob([htmlContent || ''], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      backgroundColor: '#ffffff'
    }}>
      {/* Top Preview Bar */}
      <div style={{
        height: '36px',
        backgroundColor: '#1e293b',
        borderBottom: '1px solid #334155',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontSize: '12px' }}>
          <Globe size={14} color="#38bdf8" />
          <span>Live Web Sandbox</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            onClick={handleRefresh}
            title="Reload Preview"
            style={{ background: 'transparent', color: '#cbd5e1', padding: '4px', borderRadius: '4px' }}
          >
            <RefreshCw size={13} />
          </button>
          <button
            onClick={handleOpenNewTab}
            title="Open in New Tab"
            style={{ background: 'transparent', color: '#cbd5e1', padding: '4px', borderRadius: '4px' }}
          >
            <ExternalLink size={13} />
          </button>
        </div>
      </div>

      {/* Sandboxed iframe */}
      <iframe
        key={key}
        title="Live HTML Preview"
        srcDoc={htmlContent || '<html><body style="background:#0f172a;color:#fff;font-family:sans-serif;padding:20px;"><h3>Live Web Preview</h3><p>Run an HTML/CSS program to view output here.</p></body></html>'}
        sandbox="allow-scripts allow-modals"
        style={{
          width: '100%',
          flex: 1,
          border: 'none',
          backgroundColor: '#0f172a'
        }}
      />
    </div>
  );
}

