import React from 'react';
import { AlertTriangle, AlertOctagon, Trash2 } from 'lucide-react';

export default function ErrorConsole({ error, onClear }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      backgroundColor: '#0f0a0a',
      fontFamily: 'var(--font-mono)'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '6px 14px',
        backgroundColor: '#1f1315',
        borderBottom: '1px solid #3b181a',
        fontSize: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#f87171', fontWeight: '600' }}>
          <AlertOctagon size={14} />
          Error & Diagnostics Console
        </div>
        <button
          onClick={onClear}
          title="Clear Errors"
          style={{ background: 'transparent', color: '#f87171', padding: '2px 4px' }}
        >
          <Trash2 size={12} />
        </button>
      </div>

      <div style={{
        flex: 1,
        padding: '14px',
        overflowY: 'auto',
        fontSize: '13px',
        lineHeight: 1.5,
        color: '#fca5a5',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word'
      }}>
        {error ? (
          error
        ) : (
          <div style={{ color: 'var(--text-dim)', fontStyle: 'italic' }}>
            No errors reported. All compilations and executions clean.
          </div>
        )}
      </div>
    </div>
  );
}

