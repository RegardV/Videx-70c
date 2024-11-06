import { useState, useEffect, useRef } from 'react';
import { Terminal as XTerm } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { io } from 'socket.io-client';
import 'xterm/css/xterm.css';

interface TerminalProps {
  containerId: string;
  isDemoMode?: boolean;
  isPowerShell?: boolean;
}

export default function Terminal({ containerId, isDemoMode = false, isPowerShell = false }: TerminalProps) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerm | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const socketRef = useRef<any>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    const initializeTerminal = async () => {
      if (!terminalRef.current) return;

      const term = new XTerm({
        cursorBlink: true,
        theme: {
          background: 'var(--crt-bg)',
          foreground: 'var(--crt-orange)',
          cursor: 'var(--crt-orange)'
        },
        fontFamily: 'VT323, monospace',
        fontSize: 15,
        rows: 24,
        cols: 80,
        letterSpacing: 0,
        convertEol: true
      });

      const fitAddon = new FitAddon();
      term.loadAddon(fitAddon);

      xtermRef.current = term;
      fitAddonRef.current = fitAddon;

      term.open(terminalRef.current);
      fitAddon.fit();

      if (isDemoMode) {
        handleDemoMode(term);
      } else {
        await connectToContainer(term);
      }

      const handleResize = () => {
        if (fitAddonRef.current) {
          fitAddonRef.current.fit();
          const dims = fitAddonRef.current.proposeDimensions();
          if (dims && socketRef.current) {
            socketRef.current.emit('resize', dims);
          }
        }
      };

      window.addEventListener('resize', handleResize);
      return () => {
        window.removeEventListener('resize', handleResize);
        term.dispose();
        if (socketRef.current) {
          socketRef.current.disconnect();
        }
      };
    };

    initializeTerminal();
  }, [containerId, isDemoMode, isPowerShell]);

  const connectToContainer = async (term: XTerm) => {
    if (isConnecting) return;
    setIsConnecting(true);

    try {
      const socket = io('http://localhost:3001', {
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 10000
      });

      socketRef.current = socket;

      socket.on('connect', () => {
        setIsConnected(true);
        setIsConnecting(false);
        term.write('\r\nConnected to server\r\n');
        socket.emit('attach-container', containerId, isPowerShell);
      });

      socket.on('connect_error', (error) => {
        console.error('Connection error:', error);
        term.write('\r\nConnection error. Retrying...\r\n');
      });

      socket.on(`terminal-output-${containerId}`, (data) => {
        term.write(data);
      });

      socket.on('error', (data) => {
        term.write(`\r\nError: ${data.message}\r\n`);
        setIsConnecting(false);
      });

      term.onData((data) => {
        if (isConnected) {
          socket.emit(`terminal-input-${containerId}`, data);
        }
      });

      term.onResize(({ cols, rows }) => {
        if (isConnected) {
          socket.emit('resize', { cols, rows });
        }
      });

      const dims = fitAddonRef.current?.proposeDimensions();
      if (dims) {
        socket.emit('resize', dims);
      }
    } catch (error) {
      console.error('Failed to connect:', error);
      term.write('\r\nFailed to connect to server. Please try again.\r\n');
      setIsConnecting(false);
    }
  };

  // Rest of the component remains the same...
  const handleDemoMode = (term: XTerm) => {
    const welcomeMessage = [
      '\r\n',
      '╔════════════════════════════════════════════╗\r\n',
      '║           VIDEX/70 - DEMO MODE             ║\r\n',
      '║------------------------------------------ ║\r\n',
      '║ TYPE "HELP" FOR AVAILABLE COMMANDS         ║\r\n',
      '╚════════════════════════════════════════════╝\r\n',
      '\r\n'
    ].join('');

    term.write(welcomeMessage);
    term.write('$ ');

    let currentLine = '';

    term.onKey(({ key, domEvent }) => {
      const printable = !domEvent.altKey && !domEvent.ctrlKey && !domEvent.metaKey;

      if (domEvent.keyCode === 13) { // Enter
        term.write('\r\n');
        handleDemoCommand(currentLine.trim(), term);
        currentLine = '';
        term.write('$ ');
      } else if (domEvent.keyCode === 8) { // Backspace
        if (currentLine.length > 0) {
          currentLine = currentLine.slice(0, -1);
          term.write('\b \b');
        }
      } else if (printable) {
        currentLine += key;
        term.write(key);
      }
    });
  };

  const handleDemoCommand = (command: string, term: XTerm) => {
    const cmd = command.toLowerCase();
    
    switch (cmd) {
      case 'help':
        term.write([
          'Available commands:\r\n',
          '  HELP     - Show this help message\r\n',
          '  CLEAR    - Clear the screen\r\n',
          '  DATE     - Show current date and time\r\n',
          '  VERSION  - Show system version\r\n',
          '  STATUS   - Show terminal status\r\n',
          '  EXIT     - Exit demo mode\r\n'
        ].join(''));
        break;
      
      case 'clear':
        term.clear();
        break;
      
      case 'date':
        term.write(`${new Date().toLocaleString()}\r\n`);
        break;
      
      case 'version':
        term.write('VIDEX/70 Terminal System [Version 1.0.0]\r\n');
        break;
      
      case 'status':
        term.write([
          'Terminal Status:\r\n',
          `Mode: ${isPowerShell ? 'PowerShell' : 'Demo'}\r\n`,
          `Session ID: ${containerId}\r\n`,
          `Terminal Size: ${term.cols}x${term.rows}\r\n`
        ].join(''));
        break;
      
      case 'exit':
        term.write('Exiting demo mode...\r\n');
        break;
      
      case '':
        break;
      
      default:
        term.write(`Command not recognized: ${command}\r\n`);
        term.write('Type "HELP" for available commands\r\n');
    }
  };

  return (
    <div className="h-[calc(100vh-3rem)] w-full bg-[var(--crt-bg)] relative overflow-hidden">
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="w-full h-full" 
          style={{
            backgroundImage: `
              linear-gradient(45deg, var(--crt-orange) 25%, transparent 25%),
              linear-gradient(-45deg, var(--crt-orange) 25%, transparent 25%),
              linear-gradient(45deg, transparent 75%, var(--crt-orange) 75%),
              linear-gradient(-45deg, transparent 75%, var(--crt-orange) 75%)
            `,
            backgroundSize: '4px 4px',
            backgroundPosition: '0 0, 0 2px, 2px -2px, -2px 0px'
          }}
        />
      </div>
      <div 
        ref={terminalRef}
        className="w-full h-full overflow-hidden shadow-lg relative crt"
        style={{
          backgroundColor: 'var(--crt-bg)',
          border: '1px solid var(--crt-orange)'
        }}
      />
    </div>
  );
}