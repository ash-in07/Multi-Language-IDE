import React, { useState } from 'react';
import { CheckCircle2, AlertCircle, Clock, Copy, Check, Trash2 } from 'lucide-react';

export default function OutputConsole({ 
  output, 
  status, 
  executionTime, 
  onClear 
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusBadge = () => {
    if (!status) return null;
    if (status === 'SUCCESS') {
      return (
        <span style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          background: 'rgba(16, 185, 129, 0.15)',
          color: '#34d399',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          padding: '2px 8px',
          borderRadius: '12px',
          fontSize: '11px',
          fontWeight: '600'
        }}>
          <CheckCircle2 size={12} />
          SUCCESS
        </span>
      );
    }
    if (status === 'TIMEOUT') {
      return (
        <span style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          background: 'rgba(245, 158, 11, 0.15)',
          color: '#fbbf24',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          padding: '2px 8px',
          borderRadius: '12px',
          fontSize: '11px',
          fontWeight: '600'
        }}>
          <Clock size={12} />
          TIMEOUT
        </span>
      );
    }
    return (
      <span style={{
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        background: 'rgba(239, 68, 68, 0.15)',
        color: '#f87171',
        border: '1px solid rgba(239, 68, 68, 0.3)',
        padding: '2px 8px',
        borderRadius: '12px',
        fontSize: '11px',
        fontWeight: '600'
      }}>
        <AlertCircle size={12} />
        ERROR
      </span>
    );
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      backgroundColor: 'var(--bg-primary)',
      fontFamily: 'var(--font-mono)'
    }}>
      {/* Sub-header Controls */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '6px 14px',
        backgroundColor: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border-color)',
        fontSize: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {getStatusBadge()}
          {executionTime !== undefined && executionTime !== null && (
            <span style={{ color: 'var(--text-muted)', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Clock size={12} />
              {executionTime.toFixed(3)}s
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={handleCopy}
            title="Copy Output"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              background: 'transparent',
              color: copied ? '#34d399' : 'var(--text-muted)',
              fontSize: '11px',
              padding: '2px 6px',
              borderRadius: '4px'
            }}
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          <button
            onClick={onClear}
            title="Clear Output"
            style={{
              background: 'transparent',
              color: 'var(--text-muted)',
              padding: '2px 4px',
              borderRadius: '4px'
            }}
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      {/* Output Content */}
      <div style={{
        flex: 1,
        padding: '14px',
        overflowY: 'auto',
        fontSize: '13px',
        lineHeight: 1.5,
        color: '#e2e8f0',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word'
      }}>
        {output ? (
          output
        ) : (
          <div style={{ color: 'var(--text-dim)', fontStyle: 'italic' }}>
            No program output yet. Write or select a program and click "Run".
          </div>
        )}
      </div>
    </div>
  );
}

