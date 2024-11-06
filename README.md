# VIDEX/70 - Retro Terminal Manager
#docker on Windows only for now

A retro-styled web terminal interface for Docker containers, inspired by 1970s IBM terminals. Features dynamic port allocation, multiple terminal sessions, and theme switching between classic IBM Orange and IBM Green.

![VIDEX/70 Terminal](screenshot.png)

## Features

- 🖥️ **Retro UI**: Authentic 1970s IBM terminal look and feel
- 🔄 **Multi-Terminal Support**: Manage multiple container terminals simultaneously
- 🎨 **Theme Switching**: Toggle between IBM Orange and IBM Green themes
- 📝 **Renamable Sessions**: Customize terminal session names
- 🔌 **Dynamic Ports**: Automatic port allocation for conflict-free operation
- 🎮 **Demo Mode**: Test the interface without connecting to real containers

## Local Installation with Docker (Windows)

### Prerequisites

- Docker Desktop for Windows installed and running
- Windows 10/11 with WSL2 enabled
- Docker engine running and accessible

### Quick Start

1. Clone the repository to your local machine:
   ```powershell
   git clone <repository-url>
   cd videx
   ```

2. Build the Docker image:
   ```powershell
   docker build -t videx .
   ```

3. Run the container:
   ```powershell
   docker run -d `
     -p 5173:5173 `
     -p 3001:3001 `
     -v //./pipe/docker_engine://./pipe/docker_engine `
     --name videx `
     videx
   ```

   Note: The application will automatically find available ports if 5173 or 3001 are in use.

4. Access the interface:
   ```
   http://localhost:5173
   ```

### Port Configuration

VIDEX/70 uses two ports by default:
- `5173`: Web interface
- `3001`: WebSocket server

If these ports are in use, the application will automatically find available ports in the range 3001-3999.

### Using the Terminal

1. Click the gear icon in the top-right corner
2. Choose between:
   - Demo Mode: Test the interface with a simulated terminal
   - System PowerShell: Launch a local PowerShell session
   - Container Mode: Connect to a real Docker container by entering its ID

### Multiple Sessions

- Open multiple terminals by connecting to different containers
- Rename sessions by clicking the edit icon on the terminal tab
- Switch between sessions using the tabs
- Close sessions using the × button on each tab

### Theme Switching

Toggle between IBM Orange and IBM Green themes using the theme button in the top-right corner.

## Security Considerations

⚠️ Important security notes:

- Only run on trusted networks
- Don't expose to the internet without proper security measures
- Use authentication if deploying in a production environment
- Be cautious with container access permissions

## Development

If you want to run the project without Docker for development:

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm start
   ```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with React, TypeScript, and Tailwind CSS
- Terminal emulation powered by Xterm.js
- Docker integration via Dockerode
- Inspired by 1970s IBM computer terminals