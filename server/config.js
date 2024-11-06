export const config = {
  defaultServerPort: 3001,
  defaultVitePort: 5173,
  docker: {
    npipe: '//./pipe/docker_engine',
    tcp: {
      host: 'localhost',
      port: 2375
    },
    defaultShell: 'powershell.exe'
  },
  portRange: {
    min: 3001,
    max: 3999
  }
};