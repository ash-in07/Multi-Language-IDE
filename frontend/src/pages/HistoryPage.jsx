import React, { useState, useEffect } from 'react';
import { History, CheckCircle2, AlertCircle, Clock, Search, RefreshCw, Eye, X } from 'lucide-react';
import { executionAPI } from '../services/api';

export default function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [filterStatus, setFilterStatus] = useState('ALL');

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const res = await executionAPI.history();
      setHistory(res.data.history || []);
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  const filtered = history.filter((h) => {
    if (filterStatus === 'ALL') return true;
    return h.execution_status === filterStatus;
  });

  return (
    <div style={{
      height: 'calc(100vh - 52px)',
      overflowY: 'auto',
      backgroundColor: 'var(--bg-primary)',
      color: 'var(--text-main)',
      padding: '30px 40px',
      fontFamily: 'var(--font-sans)'
    }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '24px',
          borderBottom: '1px solid var(--border-color)',
          paddingBottom: '16px'
        }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <History size={22} color="#818cf8" />
              Program Execution History
            </h1>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Audit log of compiler builds, MapReduce jobs, and query runs across your workspace.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{ padding: '6px 12px', fontSize: '12px' }}
            >
              <option value="ALL">All Statuses</option>
              <option value="SUCCESS">Success Only</option>
              <option value="ERROR">Errors Only</option>
              <option value="TIMEOUT">Timeouts Only</option>
            </select>

            <button
              onClick={loadHistory}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '6px',
                backgroundColor: 'var(--bg-tertiary)',
                color: 'var(--text-main)',
                fontSize: '12px'
              }}
            >
              <RefreshCw size={13} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* History Table */}
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading execution audit history...
          </div>
        ) : filtered.length > 0 ? (
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '13px',
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: '8px',
            overflow: 'hidden',
            border: '1px solid var(--border-color)'
          }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-tertiary)', textAlign: 'left', color: 'var(--text-dim)' }}>
                <th style={{ padding: '12px 16px' }}>Run ID</th>
                <th style={{ padding: '12px 16px' }}>Status</th>
                <th style={{ padding: '12px 16px' }}>Execution Time</th>
                <th style={{ padding: '12px 16px' }}>Timestamp</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Inspection</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item, idx) => (
                <tr
                  key={item.id}
                  style={{
                    borderTop: '1px solid var(--border-color)',
                    backgroundColor: idx % 2 === 0 ? 'transparent' : 'rgba(255, 255, 255, 0.015)'
                  }}
                >
                  <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                    #{item.id}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '3px 8px',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: '700',
                      backgroundColor: item.execution_status === 'SUCCESS' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                      color: item.execution_status === 'SUCCESS' ? '#34d399' : '#f87171'
                    }}>
                      {item.execution_status === 'SUCCESS' ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                      {item.execution_status}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)' }}>
                    {item.execution_time}s
                  </td>
                  <td style={{ padding: '12px 16px', color: 'var(--text-dim)', fontSize: '12px' }}>
                    {item.created_at ? new Date(item.created_at).toLocaleString() : ''}
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <button
                      onClick={() => setSelectedItem(item)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '4px 10px',
                        borderRadius: '4px',
                        backgroundColor: 'var(--bg-tertiary)',
                        color: '#818cf8',
                        fontSize: '12px',
                        fontWeight: '500'
                      }}
                    >
                      <Eye size={13} />
                      <span>View Output</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-dim)' }}>
            No execution history found matching the selected criteria.
          </div>
        )}

        {/* View Output Modal */}
        {selectedItem && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              width: '720px',
              maxHeight: '80vh',
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: '10px',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}>
              <div style={{
                padding: '14px 18px',
                borderBottom: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <span style={{ fontWeight: '600' }}>Execution Log #{selectedItem.id} Output</span>
                <button onClick={() => setSelectedItem(null)} style={{ background: 'transparent', color: '#fff' }}>
                  <X size={16} />
                </button>
              </div>

              <div style={{ padding: '16px', overflowY: 'auto' }}>
                <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-dim)', marginBottom: '6px' }}>
                  Standard Output:
                </div>
                <pre style={{
                  backgroundColor: 'var(--bg-primary)',
                  padding: '12px',
                  borderRadius: '6px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '12.5px',
                  color: '#e2e8f0',
                  lineHeight: 1.5,
                  maxHeight: '260px',
                  overflowY: 'auto',
                  marginBottom: '16px'
                }}>
                  {selectedItem.output || '(No stdout)'}
                </pre>

                {selectedItem.error_message && (
                  <>
                    <div style={{ fontSize: '12px', fontWeight: '600', color: '#f87171', marginBottom: '6px' }}>
                      Errors & Diagnostics:
                    </div>
                    <pre style={{
                      backgroundColor: '#1f1315',
                      border: '1px solid #3b181a',
                      padding: '12px',
                      borderRadius: '6px',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '12.5px',
                      color: '#fca5a5',
                      lineHeight: 1.5,
                      maxHeight: '180px',
                      overflowY: 'auto'
                    }}>
                      {selectedItem.error_message}
                    </pre>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

