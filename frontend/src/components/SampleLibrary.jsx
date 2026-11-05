import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Play, 
  FileCode, 
  ChevronRight, 
  ChevronDown, 
  Search, 
  ExternalLink,
  Sparkles 
} from 'lucide-react';
import { sampleAPI } from '../services/api';

export default function SampleLibrary({ onLoadSample, onRunSample }) {
  const [samples, setSamples] = useState([]);
  const [selectedSample, setSelectedSample] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    sampleAPI.list().then((res) => {
      const data = res.data.samples || [];
      setSamples(data);
      if (data.length > 0) setSelectedSample(data[0]);
    }).catch(() => {});
  }, []);

  const categories = ['All', 'Apache Pig', 'Hadoop MapReduce', 'Python', 'C & C++', 'Java', 'SQL', 'HTML / CSS / JavaScript'];

  const filteredSamples = samples.filter((s) => {
    const matchCat = selectedCategory === 'All' || s.category === selectedCategory;
    const matchSearch = s.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        s.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div style={{
      display: 'flex',
      height: '100%',
      backgroundColor: 'var(--bg-primary)',
      color: 'var(--text-main)',
      overflow: 'hidden'
    }}>
      {/* Left List of Practicals */}
      <div style={{
        width: '320px',
        backgroundColor: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header & Search */}
        <div style={{ padding: '12px', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <BookOpen size={16} color="#818cf8" />
            <span style={{ fontWeight: '700', fontSize: '13px' }}>Big Data Practicals Library</span>
          </div>

          <div style={{ position: 'relative', marginBottom: '8px' }}>
            <Search size={13} color="var(--text-dim)" style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Filter practicals..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', paddingLeft: '26px', fontSize: '12px' }}
            />
          </div>

          {/* Category Tabs */}
          <div style={{ display: 'flex', gap: '4px', overflowX: 'auto', paddingBottom: '4px', scrollbarWidth: 'none' }}>
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setSelectedCategory(c)}
                style={{
                  padding: '3px 8px',
                  borderRadius: '12px',
                  fontSize: '11px',
                  whiteSpace: 'nowrap',
                  backgroundColor: selectedCategory === c ? '#6366f1' : 'var(--bg-tertiary)',
                  color: selectedCategory === c ? '#ffffff' : 'var(--text-muted)',
                  fontWeight: selectedCategory === c ? '600' : '400'
                }}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Practicals List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '6px' }}>
          {filteredSamples.map((s) => {
            const isSelected = selectedSample?.id === s.id;
            return (
              <div
                key={s.id}
                onClick={() => setSelectedSample(s)}
                style={{
                  padding: '8px 10px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  marginBottom: '4px',
                  backgroundColor: isSelected ? 'var(--bg-tertiary)' : 'transparent',
                  borderLeft: isSelected ? '3px solid #818cf8' : '3px solid transparent'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
                  <span style={{ fontSize: '10px', fontWeight: '700', color: '#818cf8', textTransform: 'uppercase' }}>
                    {s.category}
                  </span>
                </div>
                <div style={{ fontSize: '12.5px', fontWeight: isSelected ? '600' : '400', color: isSelected ? '#ffffff' : 'var(--text-main)' }}>
                  {s.title}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Selected Practical Details */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', padding: '24px' }}>
        {selectedSample ? (
          <div style={{ maxWidth: '850px' }}>
            {/* Title & Actions */}
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              marginBottom: '16px'
            }}>
              <div>
                <span style={{
                  fontSize: '11px',
                  fontWeight: '700',
                  padding: '3px 8px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(99, 102, 241, 0.2)',
                  color: '#818cf8',
                  textTransform: 'uppercase'
                }}>
                  {selectedSample.category}
                </span>
                <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#ffffff', margin: '8px 0 4px 0' }}>
                  {selectedSample.title}
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '13.5px', lineHeight: 1.5 }}>
                  {selectedSample.description}
                </p>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => onLoadSample(selectedSample)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    borderRadius: '6px',
                    backgroundColor: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-color)',
                    color: '#ffffff',
                    fontSize: '12.5px',
                    fontWeight: '600'
                  }}
                >
                  <FileCode size={14} color="#818cf8" />
                  <span>Open in Editor</span>
                </button>

                <button
                  onClick={() => onRunSample(selectedSample)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    backgroundColor: '#10b981',
                    color: '#ffffff',
                    fontSize: '12.5px',
                    fontWeight: '700',
                    boxShadow: '0 2px 10px rgba(16, 185, 129, 0.4)'
                  }}
                >
                  <Play size={14} fill="#ffffff" />
                  <span>Run Program</span>
                </button>
              </div>
            </div>

            {/* Dataset Badge if applicable */}
            {selectedSample.dataset && (
              <div style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '10px 14px',
                marginBottom: '18px',
                fontSize: '12.5px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span style={{ color: '#38bdf8', fontWeight: '600' }}>Dataset Used:</span>
                <code style={{ background: 'var(--bg-tertiary)', padding: '2px 6px', borderRadius: '4px', color: '#f8fafc' }}>
                  {selectedSample.dataset}
                </code>
              </div>
            )}

            {/* Source Code Box */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-dim)', marginBottom: '6px', textTransform: 'uppercase' }}>
                Source Code
              </div>
              <pre style={{
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '16px',
                fontSize: '12.5px',
                fontFamily: 'var(--font-mono)',
                color: '#e2e8f0',
                lineHeight: 1.5,
                overflowX: 'auto'
              }}>
                {selectedSample.code}
              </pre>
            </div>

            {/* Expected Output Box */}
            <div>
              <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-dim)', marginBottom: '6px', textTransform: 'uppercase' }}>
                Expected Output
              </div>
              <pre style={{
                backgroundColor: '#0a0f1d',
                border: '1px solid rgba(56, 189, 248, 0.25)',
                borderRadius: '8px',
                padding: '14px',
                fontSize: '12px',
                fontFamily: 'var(--font-mono)',
                color: '#38bdf8',
                lineHeight: 1.5,
                overflowX: 'auto'
              }}>
                {selectedSample.expected_output}
              </pre>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-dim)' }}>
            Select a sample practical to view source code and execution instructions.
          </div>
        )}
      </div>
    </div>
  );
}

