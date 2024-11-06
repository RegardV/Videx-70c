import { useState, useEffect } from 'react';
import Terminal from './components/Terminal';
import SettingsModal from './components/SettingsModal';
import ReadmeModal from './components/ReadmeModal';
import { CogIcon } from './components/Icons';
import { useTheme } from './hooks/useTheme';
import TerminalTabs from './components/TerminalTabs';

interface TerminalSession {
  id: string;
  name: string;
  isDemoMode: boolean;
  isPowerShell?: boolean;
}

export default function App() {
  const [sessions, setSessions] = useState<TerminalSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isReadmeOpen, setIsReadmeOpen] = useState(false);
  const [readmeContent, setReadmeContent] = useState('');
  const [demoCount, setDemoCount] = useState(0);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    fetch('/README.md')
      .then(response => response.text())
      .then(content => setReadmeContent(content))
      .catch(error => console.error('Error loading README:', error));
  }, []);

  const handleTerminalConnect = (containerId: string, isDemoMode: boolean = false, isPowerShell: boolean = false) => {
    const id = isDemoMode ? `demo-terminal-${demoCount}` : (isPowerShell ? 'powershell' : containerId);
    const name = isDemoMode ? `Demo Terminal ${demoCount + 1}` : (isPowerShell ? 'System PowerShell' : `Terminal ${containerId.slice(0, 8)}`);
    
    const newSession: TerminalSession = {
      id,
      name,
      isDemoMode,
      isPowerShell
    };
    
    setSessions(prev => [...prev, newSession]);
    setActiveSessionId(id);
    setIsSettingsOpen(false);
    
    if (isDemoMode) {
      setDemoCount(prev => prev + 1);
    }
  };

  const handleRenameSession = (sessionId: string, newName: string) => {
    setSessions(prev => prev.map(session => 
      session.id === sessionId ? { ...session, name: newName } : session
    ));
  };

  const handleCloseSession = (sessionId: string) => {
    setSessions(prev => prev.filter(session => session.id !== sessionId));
    if (activeSessionId === sessionId) {
      const remainingSessions = sessions.filter(session => session.id !== sessionId);
      setActiveSessionId(remainingSessions.length > 0 ? remainingSessions[0].id : null);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--crt-bg)] crt">
      <header className="bg-[var(--crt-orange-dim)] p-2 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsReadmeOpen(true)}
            className="text-2xl font-bold crt-text hover:text-[var(--crt-orange-dim)]"
          >
            VIDEX/70
          </button>
          <TerminalTabs
            sessions={sessions}
            activeSessionId={activeSessionId}
            onSessionSelect={setActiveSessionId}
            onRenameSession={handleRenameSession}
            onCloseSession={handleCloseSession}
          />
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className="px-3 py-1 border border-[var(--crt-orange)] text-sm hover:bg-[var(--crt-orange-dim)] rounded"
          >
            {theme === 'orange' ? 'IBM GREEN' : 'IBM ORANGE'}
          </button>
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 hover:bg-[var(--crt-orange-dim)] rounded"
          >
            <CogIcon className="w-6 h-6" />
          </button>
        </div>
      </header>

      <main className="flex-1">
        {!activeSessionId ? (
          <div className="h-[calc(100vh-3rem)] flex items-center justify-center title-screen">
            <div className="text-center crt-text relative z-10 terminal-frame p-8 border-2 border-[var(--crt-orange)] rounded">
              <h2 className="text-6xl font-bold mb-12 title-glow tracking-wider">VIDEX/70</h2>
              <div className="mb-12 text-2xl space-y-4">
                <p className="tracking-wide">* * * TERMINAL READY * * *</p>
                <p className="tracking-wide mt-4">SYSTEM VERSION 1.0</p>
                <p className="tracking-wide mt-4">COPYRIGHT (C) 1970</p>
              </div>
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="px-8 py-4 border-2 border-[var(--crt-orange)] hover:bg-[var(--crt-orange-dim)] text-2xl tracking-wider transition-colors duration-200 rounded"
              >
                INITIALIZE TERMINAL
              </button>
            </div>
          </div>
        ) : (
          <Terminal 
            containerId={activeSessionId} 
            isDemoMode={sessions.find(s => s.id === activeSessionId)?.isDemoMode || false}
            isPowerShell={sessions.find(s => s.id === activeSessionId)?.isPowerShell || false}
          />
        )}
      </main>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSubmit={handleTerminalConnect}
      />
      <ReadmeModal
        isOpen={isReadmeOpen}
        onClose={() => setIsReadmeOpen(false)}
        content={readmeContent}
      />
    </div>
  );
}