#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

let server;
let restartCount = 0;
const maxRestarts = 5;

function startServer() {
  console.log(`🚀 Starting server (attempt ${restartCount + 1}/${maxRestarts + 1})`);
  
  server = spawn('node', ['server.js'], {
    cwd: path.join(__dirname),
    stdio: 'inherit',
    env: process.env
  });

  server.on('close', (code) => {
    console.log(`💀 Server process exited with code ${code}`);
    
    if (code !== 0 && restartCount < maxRestarts) {
      restartCount++;
      console.log(`🔄 Restarting server in 3 seconds... (${restartCount}/${maxRestarts})`);
      setTimeout(startServer, 3000);
    } else if (restartCount >= maxRestarts) {
      console.log(`❌ Max restart attempts (${maxRestarts}) reached. Please check the logs.`);
      process.exit(1);
    } else {
      console.log('✅ Server shutdown gracefully');
      process.exit(0);
    }
  });

  server.on('error', (err) => {
    console.error('❌ Failed to start server:', err);
  });
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Received SIGINT. Terminating server...');
  if (server) {
    server.kill('SIGINT');
  }
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Received SIGTERM. Terminating server...');
  if (server) {
    server.kill('SIGTERM');
  }
});

// Start the server
startServer();
