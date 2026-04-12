/**
 * start.js
 *
 * Usage:
 *   node start.js client   # starts customer client + food/auth/delivery services
 *   node start.js supplier # starts supplier portal + food/auth services
 *   node start.js admin    # starts admin UI + food/delivery/bike services
 *   node start.js driver   # starts expo driver app + auth service + delivery service
 *   node start.js all      # starts all web apps + all backend services
 *   node start.js          # defaults to "client"
 *   chuẩn bị build driver
 * Edit the "config" section below if your folders differ.
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const mode = (process.argv[2] || 'client').toLowerCase();
if (['-h', '--help', 'help'].includes(mode)) {
  console.log('Usage: node start.js [client|supplier|admin|driver|all]');
  process.exit(0);
}

const config = {
  all: [
    { name: 'client-web', cmd: 'npm', args: ['run', 'dev'], cwd: path.resolve('./client') },
    { name: 'supplier-web', cmd: 'npm', args: ['run', 'dev'], cwd: path.resolve('./supplier') },
    { name: 'admin-ui', cmd: 'npm', args: ['run', 'dev'], cwd: path.resolve('./admin-ui') },
    { name: 'food-service', cmd: 'node', args: ['server.js'], cwd: path.resolve('./server/food-service') },
    { name: 'auth-service', cmd: 'node', args: ['server.js'], cwd: path.resolve('./server/auth-service') },
    { name: 'delivery-service', cmd: 'node', args: ['server.js'], cwd: path.resolve('./server/delivery-service') },
    { name: 'bike-service', cmd: 'node', args: ['index.js'], cwd: path.resolve('./server/bike-service') },
  ],
  client: [
    { name: 'client-web', cmd: 'npm', args: ['run', 'dev'], cwd: path.resolve('./client') },
    { name: 'food-service', cmd: 'node', args: ['server.js'], cwd: path.resolve('./server/food-service') },
    { name: 'auth-service', cmd: 'node', args: ['server.js'], cwd: path.resolve('./server/auth-service') },
    { name: 'delivery-service', cmd: 'node', args: ['server.js'], cwd: path.resolve('./server/delivery-service') },
  ],
  supplier: [
    { name: 'supplier-web', cmd: 'npm', args: ['run', 'dev'], cwd: path.resolve('./supplier') },
    { name: 'food-service-supplier', cmd: 'node', args: ['server.js'], cwd: path.resolve('./server/food-service') },
    { name: 'auth-service-supplier', cmd: 'node', args: ['server.js'], cwd: path.resolve('./server/auth-service') },
  ],
  admin: [
    { name: 'admin-ui', cmd: 'npm', args: ['run', 'dev'], cwd: path.resolve('./admin-ui') },
    { name: 'food-service-admin', cmd: 'node', args: ['server.js'], cwd: path.resolve('./server/food-service') },
    { name: 'delivery-service-admin', cmd: 'node', args: ['server.js'], cwd: path.resolve('./server/delivery-service') },
    { name: 'bike-service-admin', cmd: 'node', args: ['index.js'], cwd: path.resolve('./server/bike-service') },
  ],
  driver: [
    { name: 'driver-app', cmd: 'npm', args: ['run', 'start'], cwd: path.resolve('./driver-app') },
    { name: 'auth-service-driver', cmd: 'node', args: ['server.js'], cwd: path.resolve('./server/auth-service') },
    { name: 'delivery-service-driver', cmd: 'node', args: ['server.js'], cwd: path.resolve('./server/delivery-service') },
  ],
};

const services = config[mode];
if (!services) {
  console.error(`Unknown mode "${mode}". Use "client", "supplier", "admin", "driver", or "all".`);
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