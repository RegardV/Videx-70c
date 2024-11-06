import React from 'react';
import { marked } from 'marked';

interface ReadmeModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: string;
}

export default function ReadmeModal({ isOpen, onClose, content }: ReadmeModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-[var(--crt-bg)] border-2 border-[var(--crt-orange)] max-w-4xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-[var(--crt-orange)]">VIDEX/70 DOCUMENTATION</h2>
            <button
              onClick={onClose}
              className="text-[var(--crt-orange)] hover:text-[var(--crt-orange-dim)]"
            >
              ×
            </button>
          </div>
          <div 
            className="prose prose-invert max-w-none crt-text"
            dangerouslySetInnerHTML={{ 
              __html: marked(content, { breaks: true }) 
            }}
          />
        </div>
      </div>
    </div>
  );
}