import Docker from 'dockerode';
import { config } from './config.js';

export async function createDockerClient() {
  // First try named pipe (Windows default)
  try {
    const docker = new Docker({ 
      socketPath: config.docker.npipe
    });
    await docker.ping();
    console.log('Connected to Docker via named pipe');
    return docker;
  } catch (npipeError) {
    console.log('Named pipe connection failed, trying TCP...');
    
    // Fallback to TCP
    try {
      const docker = new Docker({
        host: config.docker.tcp.host,
        port: config.docker.tcp.port
      });
      await docker.ping();
      console.log('Connected to Docker via TCP');
      return docker;
    } catch (tcpError) {
      throw new Error('Could not connect to Docker. Please ensure Docker Desktop is running with exposed daemon');
    }
  }
}

export async function getContainerInfo(docker, containerId) {
  try {
    const container = docker.getContainer(containerId);
    const info = await container.inspect();
    return {
      id: info.Id,
      platform: info.Platform || 'linux', // Default to linux if not specified
      isWindows: info.Platform === 'windows' || info.Os === 'windows'
    };
  } catch (error) {
    console.error('Error getting container info:', error);
    throw error;
  }
}