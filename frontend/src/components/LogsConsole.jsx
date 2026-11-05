import React from 'react';
import { FileText, Cpu, Trash2 } from 'lucide-react';

export default function LogsConsole({ logs, onClear }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      backgroundColor: 'var(--bg-primary)',
      fontFamily: 'var(--font-mono)'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '6px 14px',
        backgroundColor: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border-color)',
        fontSize: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#38bdf8', fontWeight: '600' }}>
          <Cpu size={14} />
          Execution Logs & Hadoop Counters
        </div>
        <button
          onClick={onClear}
          title="Clear Logs"
          style={{ background: 'transparent', color: 'var(--text-muted)', padding: '2px 4px' }}
        >
          <Trash2 size={12} />
        </button>
      </div>

      <div style={{
        flex: 1,
        padding: '14px',
        overflowY: 'auto',
        fontSize: '12.5px',
        lineHeight: 1.5,
        color: '#94a3b8',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word'
      }}>
        {logs ? (
          logs
        ) : (
          <div style={{ color: 'var(--text-dim)', fontStyle: 'italic' }}>
            No execution logs currently available.
          </div>
        )}
      </div>
    </div>
  );
}

