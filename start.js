/**
 * start-multi.js
 *
 * Usage:
 *   node start-multi.js client   # starts web client + client-side services
 *   node start-multi.js admin    # starts admin UI + admin-side services
 *   node start-multi.js          # defaults to "client"
 *
 * Edit the "config" section below if your folders differ.
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const mode = (process.argv[2] || 'client').toLowerCase();
if (['-h', '--help', 'help'].includes(mode)) {
  console.log('Usage: node start-multi.js [client|admin]');
  process.exit(0);
}

const config = {
  client: [
    { name: 'web', cmd: 'npm', args: ['run', 'dev'], cwd: path.resolve('./web') },
    { name: 'food-service', cmd: 'node', args: ['server.js'], cwd: path.resolve('./server/food-service') },
    { name: 'auth-service', cmd: 'node', args: ['server.js'], cwd: path.resolve('./server/auth-service') },
  ],
  admin: [
    { name: 'admin-ui', cmd: 'npm', args: ['run', 'dev'], cwd: path.resolve('./admin-ui') },
    { name: 'food-service-admin', cmd: 'node', args: ['server.js'], cwd: path.resolve('./server/food-service') },
  ],
};

const services = config[mode];
if (!services) {
  console.error(`Unknown mode "${mode}". Use "client" or "admin".`);
  process.exit(1);
}

function prefixLines(prefix, buf) {
  const str = String(buf).replace(/\r/g, '');
  return str.split('\n').filter(Boolean).map(line => `[${prefix}] ${line}`).join('\n') + '\n';
}

const children = [];

services.forEach(svc => {
  if (!fs.existsSync(svc.cwd)) {
    console.warn(`[${svc.name}] warning: cwd "${svc.cwd}" does not exist. Service will still be spawned but may fail.`);
  }

  const child = spawn(svc.cmd, svc.args, {
    cwd: svc.cwd,
    env: Object.assign({}, process.env),
    shell: process.platform === 'win32', // use shell on Windows for "npm" etc.
  });

  child.stdout.on('data', d => process.stdout.write(prefixLines(svc.name, d)));
  child.stderr.on('data', d => process.stderr.write(prefixLines(svc.name, d)));

  child.on('exit', (code, signal) => {
    console.log(`[${svc.name}] exited with ${signal || code}`);
  });

  child.on('error', err => {
    console.error(`[${svc.name}] spawn error: ${err.message}`);
  });

  children.push({ svc, child });
});

function shutdown(signal) {
  console.log(`Received ${signal}. Stopping ${children.length} services...`);
  children.forEach(({ svc, child }) => {
    try {
      if (!child.killed) {
        child.kill('SIGTERM');
      }
    } catch (e) {
      // ignore
    }
  });

  // give children a moment to exit
  setTimeout(() => process.exit(0), 500);
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

// keep parent process alive
console.log(`Started ${children.length} services for mode "${mode}". Press Ctrl+C to stop.`);