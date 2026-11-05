import React, { useEffect, useRef } from 'react';
import { Terminal as XTerm } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { WebLinksAddon } from 'xterm-addon-web-links';
import 'xterm/css/xterm.css';
import { terminalAPI } from '../services/api';

export default function Terminal({ onOpenFileInEditor, onRefreshFiles }) {
  const terminalRef = useRef(null);
  const xtermInstance = useRef(null);
  const fitAddonRef = useRef(null);
  const sessionIdRef = useRef(null);
  const currentLineRef = useRef('');
  const historyRef = useRef([]);
  const historyIdxRef = useRef(-1);

  useEffect(() => {
    if (!terminalRef.current) return;

    // Initialize xterm.js
    const term = new XTerm({
      cursorBlink: true,
      theme: {
        background: '#090d16',
        foreground: '#e2e8f0',
        cursor: '#818cf8',
        selectionBackground: 'rgba(99, 102, 241, 0.4)',
        black: '#0f172a',
        red: '#ef4444',
        green: '#10b981',
        yellow: '#f59e0b',
        blue: '#3b82f6',
        magenta: '#a855f7',
        cyan: '#06b6d4',
        white: '#f8fafc',
        brightBlack: '#475569',
        brightGreen: '#34d399',
        brightCyan: '#38bdf8'
      },
      fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
      fontSize: 13,
      lineHeight: 1.25,
      convertEol: true
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.loadAddon(new WebLinksAddon());

    term.open(terminalRef.current);
    fitAddon.fit();

    xtermInstance.current = term;
    fitAddonRef.current = fitAddon;

    // Resize observer
    const resizeObserver = new ResizeObserver(() => {
      try {
        fitAddon.fit();
      } catch (e) {}
    });
    resizeObserver.observe(terminalRef.current);

    // Initialize backend terminal session
    terminalAPI.createSession().then((resp) => {
      sessionIdRef.current = resp.data.session_id;
      if (resp.data.banner) {
        term.write(resp.data.banner);
      }
      term.write(resp.data.prompt || 'student@bigdata-lab:~$ ');
    }).catch((err) => {
      term.write('\r\n\x1b[31mFailed to connect to backend terminal container.\x1b[0m\r\n');
    });

    // Handle user keyboard input
    term.onData((data) => {
      const code = data.charCodeAt(0);

      // Enter key
      if (data === '\r' || data === '\n') {
        const cmd = currentLineRef.current;
        term.write('\r\n');

        if (cmd.trim()) {
          historyRef.current.push(cmd);
          historyIdxRef.current = historyRef.current.length;

          // Send to backend
          terminalAPI.sendCommand(sessionIdRef.current, cmd).then((res) => {
            const out = res.data.output || '';
            if (out) {
              term.write(out.replace(/\n/g, '\r\n'));
            }
            term.write(res.data.prompt || 'student@bigdata-lab:~$ ');

            // Check if nano or command opened or created a file
            if (res.data.open_in_editor) {
              if (onOpenFileInEditor) onOpenFileInEditor(res.data.open_in_editor);
            }
            // Refresh file explorer tree
            if (onRefreshFiles) onRefreshFiles();
          }).catch((err) => {
            term.write(`\r\n\x1b[31mError: ${err.message}\x1b[0m\r\nstudent@bigdata-lab:~$ `);
          });
        } else {
          term.write('student@bigdata-lab:~$ ');
        }
        currentLineRef.current = '';
        return;
      }

      // Backspace
      if (code === 127 || code === 8) {
        if (currentLineRef.current.length > 0) {
          currentLineRef.current = currentLineRef.current.slice(0, -1);
          term.write('\b \b');
        }
        return;
      }

      // Up arrow (history previous)
      if (data === '\x1b[A') {
        if (historyRef.current.length > 0 && historyIdxRef.current > 0) {
          historyIdxRef.current--;
          const prevCmd = historyRef.current[historyIdxRef.current];
          // Clear current typed line
          term.write('\r\x1b[Kstudent@bigdata-lab:~$ ' + prevCmd);
          currentLineRef.current = prevCmd;
        }
        return;
      }

      // Down arrow (history next)
      if (data === '\x1b[B') {
        if (historyRef.current.length > 0 && historyIdxRef.current < historyRef.current.length - 1) {
          historyIdxRef.current++;
          const nextCmd = historyRef.current[historyIdxRef.current];
          term.write('\r\x1b[Kstudent@bigdata-lab:~$ ' + nextCmd);
          currentLineRef.current = nextCmd;
        } else {
          historyIdxRef.current = historyRef.current.length;
          term.write('\r\x1b[Kstudent@bigdata-lab:~$ ');
          currentLineRef.current = '';
        }
        return;
      }

      // Ctrl + C (cancel command)
      if (code === 3) {
        term.write('^C\r\nstudent@bigdata-lab:~$ ');
        currentLineRef.current = '';
        return;
      }

      // Standard character input
      if (code >= 32 && code <= 126) {
        currentLineRef.current += data;
        term.write(data);
      }
    });

    return () => {
      resizeObserver.disconnect();
      if (sessionIdRef.current) {
        terminalAPI.closeSession(sessionIdRef.current).catch(() => {});
      }
      term.dispose();
    };
  }, []);

  return (
    <div style={{
      width: '100%',
      height: '100%',
      backgroundColor: '#090d16',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div 
        ref={terminalRef} 
        style={{ 
          width: '100%', 
          height: '100%', 
          padding: '8px' 
        }} 
      />
    </div>
  );
}

