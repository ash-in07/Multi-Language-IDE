import React, { useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { 
  Play, 
  Square, 
  Save, 
  Trash2, 
  Download, 
  X, 
  FileCode, 
  RotateCcw,
  Sparkles,
  Loader2
} from 'lucide-react';
import LanguageSelector from './LanguageSelector';
import { SUPPORTED_LANGUAGES, registerPigLanguage } from '../services/languageDefinitions';

export default function CodeEditor({
  tabs,
  activeTabId,
  onSelectTab,
  onCloseTab,
  onCodeChange,
  currentLanguage,
  onSelectLanguage,
  onRun,
  onStop,
  onSave,
  onClear,
  onDownload,
  isRunning,
  isSaving
}) {
  const editorRef = useRef(null);
  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];
  const langConfig = SUPPORTED_LANGUAGES.find((l) => l.id === currentLanguage) || SUPPORTED_LANGUAGES[0];

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    // Register Apache Pig Monarch tokenizer
    registerPigLanguage(monaco);

    // Keyboard Shortcuts: Ctrl+Enter / Cmd+Enter to RUN
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      onRun();
    });

    // Keyboard Shortcuts: Ctrl+S / Cmd+S to SAVE
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      onSave();
    });

    // Monaco Editor configuration
    editor.updateOptions({
      fontSize: 13.5,
      fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
      tabSize: 4,
      minimap: { enabled: true, maxColumn: 80 },
      scrollBeyondLastLine: false,
      smoothScrolling: true,
      cursorBlinking: 'smooth',
      bracketPairColorization: { enabled: true },
      automaticLayout: true,
      lineNumbersMinChars: 3,
      padding: { top: 12, bottom: 12 },
    });
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      backgroundColor: 'var(--bg-primary)',
      overflow: 'hidden'
    }}>
      {/* Top Bar: Tabs & Action Toolbar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border-color)',
        minHeight: '40px',
        paddingRight: '12px'
      }}>
        {/* Editor Tabs */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          overflowX: 'auto',
          flex: 1,
          scrollbarWidth: 'none'
        }}>
          {tabs.map((tab) => {
            const isActive = tab.id === activeTabId;
            return (
              <div
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 14px',
                  cursor: 'pointer',
                  backgroundColor: isActive ? 'var(--bg-primary)' : 'transparent',
                  borderRight: '1px solid var(--border-color)',
                  borderTop: isActive ? '2px solid #818cf8' : '2px solid transparent',
                  color: isActive ? '#ffffff' : 'var(--text-muted)',
                  fontSize: '12.5px',
                  fontWeight: isActive ? '600' : '400',
                  userSelect: 'none',
                  whiteSpace: 'nowrap'
                }}
              >
                <FileCode size={14} color={isActive ? '#818cf8' : 'var(--text-dim)'} />
                <span>{tab.title}</span>
                {tab.isDirty && (
                  <span style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: '#818cf8',
                    display: 'inline-block'
                  }} />
                )}
                {tabs.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onCloseTab(tab.id);
                    }}
                    style={{
                      background: 'transparent',
                      padding: '2px',
                      borderRadius: '4px',
                      color: 'var(--text-dim)'
                    }}
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Toolbar Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <LanguageSelector
            currentLanguage={currentLanguage}
            onSelectLanguage={onSelectLanguage}
          />

          {/* RUN BUTTON */}
          <button
            onClick={onRun}
            disabled={isRunning}
            title="Execute Program (Ctrl+Enter)"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: isRunning ? 'var(--bg-tertiary)' : '#10b981',
              color: '#ffffff',
              padding: '6px 14px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: '700',
              boxShadow: isRunning ? 'none' : '0 2px 8px rgba(16, 185, 129, 0.4)',
              cursor: isRunning ? 'not-allowed' : 'pointer'
            }}
          >
            {isRunning ? (
              <>
                <Loader2 size={14} className="glow-active" style={{ animation: 'spin 1s linear infinite' }} />
                <span>Running...</span>
              </>
            ) : (
              <>
                <Play size={14} fill="#ffffff" />
                <span>Run</span>
              </>
            )}
          </button>

          {/* STOP BUTTON */}
          {isRunning && (
            <button
              onClick={onStop}
              title="Stop Execution"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                backgroundColor: '#ef4444',
                color: '#ffffff',
                padding: '6px 10px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '600'
              }}
            >
              <Square size={13} fill="#ffffff" />
              <span>Stop</span>
            </button>
          )}

          {/* SAVE BUTTON */}
          <button
            onClick={onSave}
            title="Save Program (Ctrl+S)"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              backgroundColor: 'var(--bg-tertiary)',
              color: 'var(--text-main)',
              border: '1px solid var(--border-color)',
              padding: '6px 10px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: '500'
            }}
          >
            <Save size={14} color="#818cf8" />
            <span>Save</span>
          </button>

          {/* CLEAR BUTTON */}
          <button
            onClick={onClear}
            title="Clear Editor"
            style={{
              backgroundColor: 'var(--bg-tertiary)',
              color: 'var(--text-muted)',
              border: '1px solid var(--border-color)',
              padding: '6px 8px',
              borderRadius: '6px'
            }}
          >
            <Trash2 size={14} />
          </button>

          {/* DOWNLOAD BUTTON */}
          <button
            onClick={onDownload}
            title="Download Source Code"
            style={{
              backgroundColor: 'var(--bg-tertiary)',
              color: 'var(--text-muted)',
              border: '1px solid var(--border-color)',
              padding: '6px 8px',
              borderRadius: '6px'
            }}
          >
            <Download size={14} />
          </button>
        </div>
      </div>

      {/* Monaco Code Editor Workspace */}
      <div style={{ flex: 1, position: 'relative' }}>
        <Editor
          height="100%"
          language={langConfig.monacoLang}
          value={activeTab?.code || ''}
          theme="vs-dark"
          onChange={(val) => onCodeChange(val || '')}
          onMount={handleEditorDidMount}
          options={{
            renderLineHighlight: 'all',
            cursorStyle: 'line',
            matchBrackets: 'always',
            contextmenu: true,
            tabCompletion: 'on',
            wordWrap: 'off'
          }}
        />
      </div>
    </div>
  );
}

