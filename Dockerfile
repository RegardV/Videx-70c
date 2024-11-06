FROM mcr.microsoft.com/windows/servercore:ltsc2022

# Set working directory
WORKDIR /app

# Install Node.js
SHELL ["powershell", "-Command"]
RUN Invoke-WebRequest -Uri https://nodejs.org/dist/v18.18.0/node-v18.18.0-x64.msi -OutFile node.msi; \
    Start-Process msiexec.exe -ArgumentList '/i', 'node.msi', '/quiet', '/norestart' -Wait; \
    Remove-Item node.msi

# Install dependencies first for better caching
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Expose both the Vite dev server and Socket.IO server ports
EXPOSE 5173
EXPOSE 3001

# Start the application using PowerShell
CMD ["powershell", "-Command", "npm start"]