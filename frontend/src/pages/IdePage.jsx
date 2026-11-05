import React, { useState, useEffect } from 'react';
import { 
  FolderTree, 
  Terminal as TerminalIcon, 
  Play, 
  BookOpen, 
  Bookmark, 
  Database, 
  FileSpreadsheet, 
  Code2, 
  AlertOctagon, 
  Cpu, 
  Globe, 
  ChevronUp, 
  ChevronDown 
} from 'lucide-react';
import FileExplorer from '../components/FileExplorer';
import CodeEditor from '../components/CodeEditor';
import Terminal from '../components/Terminal';
import OutputConsole from '../components/OutputConsole';
import ErrorConsole from '../components/ErrorConsole';
import LogsConsole from '../components/LogsConsole';
import DatasetViewer from '../components/DatasetViewer';
import WebPreview from '../components/WebPreview';
import SampleLibrary from '../components/SampleLibrary';
import SavedPrograms from '../components/SavedPrograms';
import { fileAPI, executionAPI, programAPI } from '../services/api';
import { SUPPORTED_LANGUAGES } from '../services/languageDefinitions';

export default function IdePage() {
  // Left Sidebar State
  const [activeSidebar, setActiveSidebar] = useState('files'); // 'files' | 'samples' | 'saved' | 'datasets'
  const [filesTree, setFilesTree] = useState([]);

  // Monaco Tabs State
  const [tabs, setTabs] = useState([
    {
      id: 'tab_welcome',
      title: 'welcome.py',
      path: 'welcome.py',
      language: 'python',
      code: `# Welcome to Big Data Online Lab!\n# Write your code here or load sample programs from the left sidebar.\n\nimport sys\nprint("=== Welcome to Big Data Online Lab ===")\nprint(f"Python Version: {sys.version.split()[0]}")\nprint("Ready for Big Data, Hadoop MapReduce, and Multi-Language programming!")\n`,
      isDirty: false
    }
  ]);
  const [activeTabId, setActiveTabId] = useState('tab_welcome');
  const [currentLanguage, setCurrentLanguage] = useState('python');

  // Execution & Bottom Panel State
  const [activeBottomTab, setActiveBottomTab] = useState('terminal'); // 'terminal' | 'output' | 'error' | 'logs' | 'dataset' | 'web'
  const [bottomPanelHeight, setBottomPanelHeight] = useState(280);
  const [isBottomCollapsed, setIsBottomCollapsed] = useState(false);

  // Execution Results
  const [isRunning, setIsRunning] = useState(false);
  const [currentExecutionToken, setCurrentExecutionToken] = useState(null);
  const [lastOutput, setLastOutput] = useState('');
  const [lastError, setLastError] = useState('');
  const [lastLogs, setLastLogs] = useState('');
  const [lastStatus, setLastStatus] = useState(null);
  const [lastExecutionTime, setLastExecutionTime] = useState(null);
  const [activeDatasetToPreview, setActiveDatasetToPreview] = useState('students.csv');

  useEffect(() => {
    refreshFiles();
  }, []);

  const refreshFiles = async () => {
    try {
      const res = await fileAPI.list();
      setFilesTree(res.data.files || []);
    } catch (e) {}
  };

  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];

  // Open file from explorer or nano terminal
  const handleOpenFile = async (relPath) => {
    // Check if already open in tabs
    const existing = tabs.find((t) => t.path === relPath);
    if (existing) {
      setActiveTabId(existing.id);
      setCurrentLanguage(existing.language);
      return;
    }

    try {
      const res = await fileAPI.getContent(relPath);
      const ext = '.' + relPath.split('.').pop()?.toLowerCase();
      const matchedLang = SUPPORTED_LANGUAGES.find((l) => l.extension === ext)?.id || 'python';

      const newTab = {
        id: 'tab_' + Math.random().toString(36).substr(2, 9),
        title: relPath.split('/').pop(),
        path: relPath,
        language: matchedLang,
        code: res.data.content,
        isDirty: false
      };

      setTabs((prev) => [...prev, newTab]);
      setActiveTabId(newTab.id);
      setCurrentLanguage(matchedLang);
    } catch (err) {
      alert('Failed to open file: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleSelectTab = (tabId) => {
    setActiveTabId(tabId);
    const t = tabs.find((x) => x.id === tabId);
    if (t) setCurrentLanguage(t.language);
  };

  const handleCloseTab = (tabId) => {
    if (tabs.length === 1) return;
    const newTabs = tabs.filter((t) => t.id !== tabId);
    setTabs(newTabs);
    if (activeTabId === tabId) {
      setActiveTabId(newTabs[newTabs.length - 1].id);
      setCurrentLanguage(newTabs[newTabs.length - 1].language);
    }
  };

  const handleCodeChange = (newCode) => {
    setTabs((prev) =>
      prev.map((t) =>
        t.id === activeTabId ? { ...t, code: newCode, isDirty: true } : t
      )
    );
  };

  const handleSelectLanguage = (newLang) => {
    setCurrentLanguage(newLang);
    const langObj = SUPPORTED_LANGUAGES.find((l) => l.id === newLang);
    if (langObj && activeTab && !activeTab.isDirty && activeTab.title.startsWith('untitled')) {
      // update boilerplate if untitled
      setTabs((prev) =>
        prev.map((t) =>
          t.id === activeTabId
            ? { ...t, language: newLang, code: langObj.defaultCode }
            : t
        )
      );
    } else {
      setTabs((prev) =>
        prev.map((t) =>
          t.id === activeTabId ? { ...t, language: newLang } : t
        )
      );
    }
  };

  // Run Program (Ctrl+Enter)
  const handleRun = async () => {
    if (!activeTab || isRunning) return;
    setIsRunning(true);
    setIsBottomCollapsed(false);

    // Switch to output tab or web preview
    if (currentLanguage === 'html') {
      setActiveBottomTab('web');
    } else {
      setActiveBottomTab('output');
    }

    try {
      const res = await executionAPI.execute({
        language: currentLanguage,
        code: activeTab.code,
        title: activeTab.title
      });

      setLastOutput(res.data.output || '');
      setLastError(res.data.error || '');
      setLastLogs(res.data.logs || '');
      setLastStatus(res.data.status);
      setLastExecutionTime(res.data.execution_time);
      setCurrentExecutionToken(res.data.execution_id);

      if (res.data.error && !res.data.output) {
        setActiveBottomTab('error');
      }
    } catch (err) {
      setLastError(err.response?.data?.error || err.message || 'Execution failed');
      setLastStatus('ERROR');
      setActiveBottomTab('error');
    } finally {
      setIsRunning(false);
      refreshFiles();
    }
  };

  // Stop Program
  const handleStop = async () => {
    if (currentExecutionToken) {
      try {
        await executionAPI.stop(currentExecutionToken);
        setLastStatus('STOPPED');
      } catch (e) {}
    }
    setIsRunning(false);
  };

  // Save Program (Ctrl+S)
  const handleSave = async () => {
    if (!activeTab) return;
    try {
      // 1. Save to physical workspace file
      await fileAPI.saveContent(activeTab.path || activeTab.title, activeTab.code);
      // 2. Also register in database saved programs
      await programAPI.create({
        title: activeTab.title,
        language: currentLanguage,
        source_code: activeTab.code
      });

      setTabs((prev) =>
        prev.map((t) => (t.id === activeTabId ? { ...t, isDirty: false } : t))
      );
      refreshFiles();
    } catch (err) {
      alert('Save failed: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleClear = () => {
    if (window.confirm('Clear all code in current editor?')) {
      handleCodeChange('');
    }
  };

  const handleDownload = () => {
    if (!activeTab) return;
    const blob = new Blob([activeTab.code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = activeTab.title;
    a.click();
  };

  const handleLoadSample = (sample) => {
    const ext = '.' + (sample.language === 'pig' ? 'pig' : (sample.language === 'mapreduce' ? 'java' : sample.language));
    const filename = `${sample.id}${ext}`;
    const newTab = {
      id: 'tab_' + sample.id,
      title: filename,
      path: filename,
      language: sample.language,
      code: sample.code,
      isDirty: false
    };

    setTabs((prev) => {
      const idx = prev.findIndex((t) => t.id === newTab.id);
      if (idx >= 0) return prev;
      return [...prev, newTab];
    });
    setActiveTabId(newTab.id);
    setCurrentLanguage(sample.language);
    setActiveSidebar('files');

    if (sample.dataset) {
      const dName = sample.dataset.split(',')[0].trim();
      setActiveDatasetToPreview(dName);
    }
  };

  const handleRunSample = (sample) => {
    handleLoadSample(sample);
    setTimeout(() => {
      handleRun();
    }, 100);
  };

  return (
    <div style={{
      display: 'flex',
      height: 'calc(100vh - 52px)',
      width: '100vw',
      backgroundColor: 'var(--bg-primary)',
      overflow: 'hidden'
    }}>
      {/* Activity Bar (VS Code style vertical icons) */}
      <div style={{
        width: '48px',
        backgroundColor: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '10px 0',
        gap: '14px',
        zIndex: 10
      }}>
        <button
          onClick={() => setActiveSidebar(activeSidebar === 'files' ? '' : 'files')}
          title="File Explorer"
          style={{
            background: 'transparent',
            padding: '8px',
            borderRadius: '8px',
            color: activeSidebar === 'files' ? '#818cf8' : 'var(--text-dim)',
            borderLeft: activeSidebar === 'files' ? '2px solid #818cf8' : '2px solid transparent'
          }}
        >
          <FolderTree size={20} />
        </button>

        <button
          onClick={() => setActiveSidebar(activeSidebar === 'samples' ? '' : 'samples')}
          title="Big Data Practicals & Samples"
          style={{
            background: 'transparent',
            padding: '8px',
            borderRadius: '8px',
            color: activeSidebar === 'samples' ? '#818cf8' : 'var(--text-dim)',
            borderLeft: activeSidebar === 'samples' ? '2px solid #818cf8' : '2px solid transparent'
          }}
        >
          <BookOpen size={20} />
        </button>

        <button
          onClick={() => setActiveSidebar(activeSidebar === 'datasets' ? '' : 'datasets')}
          title="Datasets Manager"
          style={{
            background: 'transparent',
            padding: '8px',
            borderRadius: '8px',
            color: activeSidebar === 'datasets' ? '#818cf8' : 'var(--text-dim)',
            borderLeft: activeSidebar === 'datasets' ? '2px solid #818cf8' : '2px solid transparent'
          }}
        >
          <FileSpreadsheet size={20} />
        </button>

        <button
          onClick={() => setActiveSidebar(activeSidebar === 'saved' ? '' : 'saved')}
          title="Saved Programs"
          style={{
            background: 'transparent',
            padding: '8px',
            borderRadius: '8px',
            color: activeSidebar === 'saved' ? '#818cf8' : 'var(--text-dim)',
            borderLeft: activeSidebar === 'saved' ? '2px solid #818cf8' : '2px solid transparent'
          }}
        >
          <Bookmark size={20} />
        </button>
      </div>

      {/* Primary Sidebar Panel */}
      {activeSidebar && (
        <div style={{
          width: '280px',
          height: '100%',
          backgroundColor: 'var(--bg-secondary)',
          borderRight: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          {activeSidebar === 'files' && (
            <FileExplorer
              files={filesTree}
              onOpenFile={handleOpenFile}
              onRefresh={refreshFiles}
              activeFile={activeTab?.path}
            />
          )}
          {activeSidebar === 'samples' && (
            <SampleLibrary
              onLoadSample={handleLoadSample}
              onRunSample={handleRunSample}
            />
          )}
          {activeSidebar === 'saved' && (
            <SavedPrograms
              onOpenProgram={(p) => {
                const newTab = {
                  id: 'tab_' + p.id,
                  title: p.title,
                  path: p.title,
                  language: p.language,
                  code: p.source_code,
                  isDirty: false
                };
                setTabs((prev) => [...prev, newTab]);
                setActiveTabId(newTab.id);
                setCurrentLanguage(p.language);
                setActiveSidebar('files');
              }}
            />
          )}
          {activeSidebar === 'datasets' && (
            <DatasetViewer
              activeDatasetName={activeDatasetToPreview}
              onSelectDataset={(name) => {
                setActiveDatasetToPreview(name);
                setActiveBottomTab('dataset');
                setIsBottomCollapsed(false);
              }}
            />
          )}
        </div>
      )}

      {/* Central Editor & Bottom Panel Workspace */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Upper Region: Monaco Code Editor */}
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <CodeEditor
            tabs={tabs}
            activeTabId={activeTabId}
            onSelectTab={handleSelectTab}
            onCloseTab={handleCloseTab}
            onCodeChange={handleCodeChange}
            currentLanguage={currentLanguage}
            onSelectLanguage={handleSelectLanguage}
            onRun={handleRun}
            onStop={handleStop}
            onSave={handleSave}
            onClear={handleClear}
            onDownload={handleDownload}
            isRunning={isRunning}
          />
        </div>

        {/* Lower Region: Resizable Bottom Panel */}
        <div style={{
          height: isBottomCollapsed ? '34px' : `${bottomPanelHeight}px`,
          backgroundColor: 'var(--bg-secondary)',
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          transition: 'height 0.15s ease'
        }}>
          {/* Bottom Tabs Header */}
          <div style={{
            height: '34px',
            backgroundColor: 'var(--bg-secondary)',
            borderBottom: isBottomCollapsed ? 'none' : '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 8px',
            userSelect: 'none'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
              <button
                onClick={() => { setActiveBottomTab('terminal'); setIsBottomCollapsed(false); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '5px 10px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: activeBottomTab === 'terminal' ? '600' : '400',
                  backgroundColor: activeBottomTab === 'terminal' && !isBottomCollapsed ? 'var(--bg-tertiary)' : 'transparent',
                  color: activeBottomTab === 'terminal' && !isBottomCollapsed ? '#818cf8' : 'var(--text-muted)'
                }}
              >
                <TerminalIcon size={13} />
                <span>Integrated Terminal</span>
              </button>

              <button
                onClick={() => { setActiveBottomTab('output'); setIsBottomCollapsed(false); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '5px 10px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: activeBottomTab === 'output' ? '600' : '400',
                  backgroundColor: activeBottomTab === 'output' && !isBottomCollapsed ? 'var(--bg-tertiary)' : 'transparent',
                  color: activeBottomTab === 'output' && !isBottomCollapsed ? '#818cf8' : 'var(--text-muted)'
                }}
              >
                <Code2 size={13} />
                <span>Program Output</span>
              </button>

              <button
                onClick={() => { setActiveBottomTab('error'); setIsBottomCollapsed(false); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '5px 10px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: activeBottomTab === 'error' ? '600' : '400',
                  backgroundColor: activeBottomTab === 'error' && !isBottomCollapsed ? 'var(--bg-tertiary)' : 'transparent',
                  color: activeBottomTab === 'error' && !isBottomCollapsed ? '#f87171' : 'var(--text-muted)'
                }}
              >
                <AlertOctagon size={13} />
                <span>Errors Console {lastError ? '●' : ''}</span>
              </button>

              <button
                onClick={() => { setActiveBottomTab('logs'); setIsBottomCollapsed(false); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '5px 10px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: activeBottomTab === 'logs' ? '600' : '400',
                  backgroundColor: activeBottomTab === 'logs' && !isBottomCollapsed ? 'var(--bg-tertiary)' : 'transparent',
                  color: activeBottomTab === 'logs' && !isBottomCollapsed ? '#38bdf8' : 'var(--text-muted)'
                }}
              >
                <Cpu size={13} />
                <span>Execution Logs & Hadoop</span>
              </button>

              <button
                onClick={() => { setActiveBottomTab('dataset'); setIsBottomCollapsed(false); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '5px 10px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: activeBottomTab === 'dataset' ? '600' : '400',
                  backgroundColor: activeBottomTab === 'dataset' && !isBottomCollapsed ? 'var(--bg-tertiary)' : 'transparent',
                  color: activeBottomTab === 'dataset' && !isBottomCollapsed ? '#34d399' : 'var(--text-muted)'
                }}
              >
                <FileSpreadsheet size={13} />
                <span>Input Dataset Preview</span>
              </button>

              <button
                onClick={() => { setActiveBottomTab('web'); setIsBottomCollapsed(false); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '5px 10px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: activeBottomTab === 'web' ? '600' : '400',
                  backgroundColor: activeBottomTab === 'web' && !isBottomCollapsed ? 'var(--bg-tertiary)' : 'transparent',
                  color: activeBottomTab === 'web' && !isBottomCollapsed ? '#38bdf8' : 'var(--text-muted)'
                }}
              >
                <Globe size={13} />
                <span>Live Web Preview</span>
              </button>
            </div>

            {/* Collapse / Expand Toggle */}
            <button
              onClick={() => setIsBottomCollapsed(!isBottomCollapsed)}
              style={{ background: 'transparent', color: 'var(--text-dim)', padding: '4px' }}
            >
              {isBottomCollapsed ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>

          {/* Panel Content Body */}
          {!isBottomCollapsed && (
            <div style={{ flex: 1, overflow: 'hidden' }}>
              {activeBottomTab === 'terminal' && (
                <Terminal
                  onOpenFileInEditor={handleOpenFile}
                  onRefreshFiles={refreshFiles}
                />
              )}
              {activeBottomTab === 'output' && (
                <OutputConsole
                  output={lastOutput}
                  status={lastStatus}
                  executionTime={lastExecutionTime}
                  onClear={() => setLastOutput('')}
                />
              )}
              {activeBottomTab === 'error' && (
                <ErrorConsole
                  error={lastError}
                  onClear={() => setLastError('')}
                />
              )}
              {activeBottomTab === 'logs' && (
                <LogsConsole
                  logs={lastLogs}
                  onClear={() => setLastLogs('')}
                />
              )}
              {activeBottomTab === 'dataset' && (
                <DatasetViewer
                  activeDatasetName={activeDatasetToPreview}
                  onSelectDataset={(name) => setActiveDatasetToPreview(name)}
                />
              )}
              {activeBottomTab === 'web' && (
                <WebPreview
                  htmlContent={lastOutput || activeTab?.code}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

