import React from 'react';
import { SUPPORTED_LANGUAGES } from '../services/languageDefinitions';
import { ChevronDown, Sparkles } from 'lucide-react';

export default function LanguageSelector({ currentLanguage, onSelectLanguage }) {
  const current = SUPPORTED_LANGUAGES.find((l) => l.id === currentLanguage) || SUPPORTED_LANGUAGES[0];

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <select
          value={currentLanguage}
          onChange={(e) => onSelectLanguage(e.target.value)}
          style={{
            appearance: 'none',
            WebkitAppearance: 'none',
            backgroundColor: 'var(--bg-tertiary)',
            color: 'var(--text-main)',
            border: '1px solid var(--border-color)',
            padding: '5px 28px 5px 10px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: '600',
            cursor: 'pointer',
            minWidth: '175px'
          }}
        >
          <optgroup label="--- Big Data Engines ---">
            {SUPPORTED_LANGUAGES.filter(l => l.category === 'Big Data').map(l => (
              <option key={l.id} value={l.id}>
                ⚡ {l.name}
              </option>
            ))}
          </optgroup>
          <optgroup label="--- General & Data ---">
            {SUPPORTED_LANGUAGES.filter(l => l.category === 'General' || l.category === 'Data').map(l => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </optgroup>
          <optgroup label="--- Systems & Compilers ---">
            {SUPPORTED_LANGUAGES.filter(l => l.category === 'Systems').map(l => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </optgroup>
          <optgroup label="--- Web & Scripting ---">
            {SUPPORTED_LANGUAGES.filter(l => l.category === 'Web').map(l => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </optgroup>
        </select>
        <ChevronDown 
          size={14} 
          color="var(--text-muted)" 
          style={{ 
            position: 'absolute', 
            right: '8px', 
            top: '50%', 
            transform: 'translateY(-50%)', 
            pointerEvents: 'none' 
          }} 
        />
      </div>

      {current.badge && (
        <span style={{
          fontSize: '10px',
          fontWeight: '700',
          padding: '2px 7px',
          borderRadius: '12px',
          backgroundColor: `${current.color}22`,
          color: current.color,
          border: `1px solid ${current.color}55`,
          textTransform: 'uppercase',
          letterSpacing: '0.4px'
        }}>
          {current.badge}
        </span>
      )}
    </div>
  );
}

