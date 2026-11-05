import React, { useState, useEffect } from 'react';
import { Database, Search, Upload, Download, RefreshCw, FileSpreadsheet } from 'lucide-react';
import { datasetAPI } from '../services/api';

export default function DatasetViewer({ activeDatasetName, onSelectDataset }) {
  const [datasetsList, setDatasetsList] = useState({ user_datasets: [], sample_datasets: [] });
  const [selectedFile, setSelectedFile] = useState(activeDatasetName || 'students.csv');
  const [previewData, setPreviewData] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadDatasetsList();
  }, []);

  useEffect(() => {
    if (activeDatasetName) {
      setSelectedFile(activeDatasetName);
      loadPreview(activeDatasetName);
    }
  }, [activeDatasetName]);

  const loadDatasetsList = async () => {
    try {
      const res = await datasetAPI.list();
      setDatasetsList(res.data);
      if (!selectedFile && res.data.sample_datasets?.length > 0) {
        const first = res.data.sample_datasets[0].filename;
        setSelectedFile(first);
        loadPreview(first);
      }
    } catch (e) {}
  };

  const loadPreview = async (fname) => {
    setLoading(true);
    try {
      const res = await datasetAPI.preview(fname);
      setPreviewData(res.data);
    } catch (e) {
      setPreviewData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (fname) => {
    setSelectedFile(fname);
    loadPreview(fname);
    if (onSelectDataset) onSelectDataset(fname);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const form = new FormData();
    form.append('file', file);
    try {
      await datasetAPI.upload(form);
      loadDatasetsList();
      handleSelect(file.name);
    } catch (err) {
      alert('Upload failed: ' + (err.response?.data?.error || err.message));
    }
  };

  const filteredRows = previewData?.rows?.filter((row) =>
    row.some((cell) => String(cell).toLowerCase().includes(searchTerm.toLowerCase()))
  ) || [];

  return (
    <div style={{
      display: 'flex',
      height: '100%',
      backgroundColor: 'var(--bg-primary)',
      overflow: 'hidden'
    }}>
      {/* Sidebar: Available Datasets */}
      <div style={{
        width: '220px',
        backgroundColor: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{
          padding: '10px 12px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-dim)' }}>
            Datasets Catalogue
          </span>
          <label style={{ cursor: 'pointer' }} title="Upload Dataset">
            <Upload size={14} color="#818cf8" />
            <input type="file" onChange={handleFileUpload} style={{ display: 'none' }} />
          </label>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '6px' }}>
          <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-dim)', padding: '4px 6px' }}>
            Sample Big Data Files
          </div>
          {datasetsList.sample_datasets?.map((d) => (
            <div
              key={d.id}
              onClick={() => handleSelect(d.filename)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 8px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '12.5px',
                backgroundColor: selectedFile === d.filename ? 'var(--bg-tertiary)' : 'transparent',
                color: selectedFile === d.filename ? '#818cf8' : 'var(--text-muted)',
                fontWeight: selectedFile === d.filename ? '600' : '400'
              }}
            >
              <FileSpreadsheet size={14} color="#34d399" />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {d.filename}
              </span>
            </div>
          ))}

          {datasetsList.user_datasets?.length > 0 && (
            <>
              <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-dim)', padding: '10px 6px 4px 6px' }}>
                My Uploads
              </div>
              {datasetsList.user_datasets.map((d) => (
                <div
                  key={d.id}
                  onClick={() => handleSelect(d.filename)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 8px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '12.5px',
                    backgroundColor: selectedFile === d.filename ? 'var(--bg-tertiary)' : 'transparent',
                    color: selectedFile === d.filename ? '#818cf8' : 'var(--text-muted)'
                  }}
                >
                  <Database size={14} color="#38bdf8" />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {d.filename}
                  </span>
                </div>
              ))}
            </>
          )}
        </div>
      </div>

      {/* Main Preview Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Dataset Header & Search */}
        <div style={{
          padding: '8px 14px',
          backgroundColor: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontWeight: '600', fontSize: '13px', color: '#ffffff' }}>
              {selectedFile || 'Select a Dataset'}
            </span>
            {previewData && (
              <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                ({previewData.total_rows_estimated} records | {(previewData.file_size / 1024).toFixed(1)} KB)
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ position: 'relative' }}>
              <Search size={13} color="var(--text-dim)" style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Search rows..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ paddingLeft: '26px', width: '160px', height: '28px', fontSize: '12px' }}
              />
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div style={{ flex: 1, overflow: 'auto', padding: '10px' }}>
          {loading ? (
            <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
              Loading dataset preview...
            </div>
          ) : previewData ? (
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '12px',
              fontFamily: 'var(--font-mono)'
            }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-tertiary)', textAlign: 'left' }}>
                  <th style={{ padding: '8px 10px', border: '1px solid var(--border-color)', color: 'var(--text-dim)', width: '40px' }}>#</th>
                  {previewData.columns?.map((col, idx) => (
                    <th key={idx} style={{ padding: '8px 10px', border: '1px solid var(--border-color)', color: '#818cf8', fontWeight: '600' }}>
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredRows.slice(0, 50).map((row, rIdx) => (
                  <tr key={rIdx} style={{ backgroundColor: rIdx % 2 === 0 ? 'transparent' : 'rgba(255, 255, 255, 0.02)' }}>
                    <td style={{ padding: '6px 10px', border: '1px solid var(--border-color)', color: 'var(--text-dim)' }}>{rIdx + 1}</td>
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} style={{ padding: '6px 10px', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}>
                        {String(cell)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-dim)', fontSize: '13px' }}>
              Select a dataset from the list to preview its dataflow structure.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

