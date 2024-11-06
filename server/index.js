import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { spawn } from 'child_process';
import { findAvailablePort } from './port-finder.js';
import { config } from './config.js';
import { createDockerClient, getContainerInfo } from './docker-client.js';

async function startServer() {
  const app = express();
  const httpServer = createServer(app);

  const PORT = await findAvailablePort(config.portRange.min, config.portRange.max);
  
  if (!PORT) {
    console.error(`No available ports found in range ${config.portRange.min}-${config.portRange.max}`);
    process.exit(1);
  }

  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  // Initialize Docker client
  let docker;
  try {
    docker = await createDockerClient();
  } catch (error) {
    console.error('Failed to initialize Docker client:', error.message);
  }

  io.on('connection', (socket) => {
    console.log('Client connected');
    let activeProcess = null;
    let activeStream = null;

    socket.on('list-containers', async () => {
      if (!docker) {
        socket.emit('error', { message: 'Docker connection not available' });
        return;
      }

      try {
        const containers = await docker.listContainers();
        const containersWithInfo = await Promise.all(containers.map(async container => {
          const info = await getContainerInfo(docker, container.Id);
          return {
            id: container.Id,
            name: container.Names[0].replace('/', ''),
            status: container.State,
            platform: info.platform,
            isWindows: info.isWindows
          };
        }));
        socket.emit('containers', containersWithInfo);
      } catch (error) {
        console.error('Error listing containers:', error);
        socket.emit('error', { message: 'Failed to list containers: ' + error.message });
      }
    });

    socket.on('attach-container', async (containerId, isPowerShell = false) => {
      try {
        if (isPowerShell) {
          console.log('Starting PowerShell session...');
          activeProcess = spawn('powershell.exe', ['-NoLogo']);
          
          activeProcess.stdout.on('data', (data) => {
            socket.emit(`terminal-output-${containerId}`, data.toString());
          });

          activeProcess.stderr.on('data', (data) => {
            socket.emit(`terminal-output-${containerId}`, data.toString());
          });

          socket.on(`terminal-input-${containerId}`, (data) => {
            if (activeProcess && activeProcess.stdin) {
              activeProcess.stdin.write(data);
            }
          });

          activeProcess.on('exit', () => {
            socket.emit(`terminal-output-${containerId}`, '\r\nPowerShell session ended\r\n');
          });
        } else if (docker) {
          console.log('Connecting to container:', containerId);
          
          try {
            const containerInfo = await getContainerInfo(docker, containerId);
            const container = docker.getContainer(containerId);
            const exec = await container.exec({
              AttachStdin: true,
              AttachStdout: true,
              AttachStderr: true,
              Tty: true,
              Cmd: containerInfo.isWindows ? ['powershell.exe'] : ['/bin/sh']
            });

            const stream = await exec.start({
              hijack: true,
              stdin: true
            });

            activeStream = stream;

            stream.on('data', (chunk) => {
              socket.emit(`terminal-output-${containerId}`, chunk.toString());
            });

            socket.on(`terminal-input-${containerId}`, (data) => {
              if (stream && !stream.destroyed) {
                stream.write(data);
              }
            });

            stream.on('end', () => {
              socket.emit(`terminal-output-${containerId}`, '\r\nContainer connection closed\r\n');
            });

            stream.on('error', (error) => {
              console.error('Stream error:', error);
              socket.emit('error', { message: 'Connection error: ' + error.message });
            });
          } catch (containerError) {
            console.error('Container error:', containerError);
            socket.emit('error', { 
              message: 'Container error: Make sure the container is running and has the appropriate shell available'
            });
          }
        } else {
          socket.emit('error', { message: 'Docker is not available' });
        }
      } catch (error) {
        console.error('Connection error:', error);
        socket.emit('error', { message: 'Failed to connect: ' + error.message });
      }
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected');
      if (activeProcess) {
        activeProcess.kill();
      }
      if (activeStream && !activeStream.destroyed) {
        activeStream.end();
      }
    });
  });

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();