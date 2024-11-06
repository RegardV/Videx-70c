import React, { useState } from 'react';
import { EditIcon } from './Icons';

interface TerminalSession {
  id: string;
  name: string;
  isDemoMode: boolean;
}

interface TerminalTabsProps {
  sessions: TerminalSession[];
  activeSessionId: string | null;
  onSessionSelect: (sessionId: string) => void;
  onRenameSession: (sessionId: string, newName: string) => void;
  onCloseSession: (sessionId: string) => void;
}

export default function TerminalTabs({
  sessions,
  activeSessionId,
  onSessionSelect,
  onRenameSession,
  onCloseSession
}: TerminalTabsProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const handleStartEdit = (session: TerminalSession) => {
    setEditingId(session.id);
    setEditName(session.name);
  };

  const handleSubmitEdit = (sessionId: string) => {
    if (editName.trim()) {
      onRenameSession(sessionId, editName.trim());
    }
    setEditingId(null);
  };

  if (sessions.length === 0) return null;

  return (
    <div className="flex gap-2 overflow-x-auto">
      {sessions.map((session) => (
        <div
          key={session.id}
          className={`flex items-center gap-2 px-3 py-1 rounded cursor-pointer transition-colors duration-200 ${
            activeSessionId === session.id
              ? 'bg-[var(--crt-orange)] text-black'
              : 'text-[var(--crt-orange)] border border-[var(--crt-orange)] hover:bg-[var(--crt-orange-dim)]'
          }`}
          onClick={() => onSessionSelect(session.id)}
        >
          {editingId === session.id ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmitEdit(session.id);
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onBlur={() => handleSubmitEdit(session.id)}
                autoFocus
                className="bg-transparent border-none outline-none text-inherit w-24"
              />
            </form>
          ) : (
            <>
              <span className="truncate max-w-[100px]">{session.name}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleStartEdit(session);
                }}
                className="opacity-50 hover:opacity-100"
              >
                <EditIcon className="w-3 h-3" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCloseSession(session.id);
                }}
                className="opacity-50 hover:opacity-100 ml-1"
              >
                ×
              </button>
            </>
          )}
        </div>
      ))}
    </div>
  );
}