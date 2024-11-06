import React, { useState } from 'react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (containerId: string, isDemoMode?: boolean, isPowerShell?: boolean) => void;
}

export default function SettingsModal({ isOpen, onClose, onSubmit }: SettingsModalProps) {
  const [containerId, setContainerId] = useState('');
  const [isDemoMode, setIsDemoMode] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isDemoMode) {
      onSubmit('demo-terminal', true);
    } else if (containerId.trim()) {
      onSubmit(containerId.trim(), false);
    }
    setContainerId('');
    setIsDemoMode(false);
  };

  const handlePowerShell = () => {
    onSubmit('powershell', false, true);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center p-4 z-50">
      <div className="bg-[var(--crt-bg)] border-2 border-[var(--crt-orange)] max-w-md w-full shadow-2xl">
        <form onSubmit={handleSubmit} className="p-6">
          <h2 className="text-xl font-semibold mb-4 text-[var(--crt-orange)]">SYSTEM CONFIGURATION</h2>
          
          <div className="mb-4">
            <button
              type="button"
              onClick={handlePowerShell}
              className="w-full px-4 py-3 text-sm font-medium bg-[var(--crt-orange)] text-black hover:bg-[var(--crt-orange-dim)] rounded mb-4"
            >
              LAUNCH SYSTEM POWERSHELL
            </button>

            <div className="border-t border-[var(--crt-orange-dim)] my-4"></div>

            <label className="flex items-center space-x-3 mb-4">
              <input
                type="checkbox"
                checked={isDemoMode}
                onChange={(e) => {
                  setIsDemoMode(e.target.checked);
                  if (e.target.checked) {
                    setContainerId('');
                  }
                }}
                className="form-checkbox h-5 w-5 text-[var(--crt-orange)] border-[var(--crt-orange)]"
              />
              <span className="text-sm font-medium text-[var(--crt-orange)]">DEMO MODE [TEST]</span>
            </label>
          </div>

          {!isDemoMode && (
            <div className="mb-4">
              <label htmlFor="containerId" className="block text-sm font-medium text-[var(--crt-orange)] mb-2">
                CONTAINER ID
              </label>
              <input
                type="text"
                id="containerId"
                value={containerId}
                onChange={(e) => setContainerId(e.target.value)}
                className="w-full px-3 py-2 bg-[var(--crt-bg)] border border-[var(--crt-orange)] text-[var(--crt-orange)] focus:ring-1 focus:ring-[var(--crt-orange)]"
                placeholder="ENTER CONTAINER ID"
              />
            </div>
          )}

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-[var(--crt-orange)] border border-[var(--crt-orange)] hover:bg-[var(--crt-orange-dim)] rounded"
            >
              CANCEL
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium bg-[var(--crt-orange)] text-black hover:bg-[var(--crt-orange-dim)] rounded"
              disabled={!isDemoMode && !containerId.trim()}
            >
              {isDemoMode ? 'INITIALIZE DEMO' : 'CONNECT'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}