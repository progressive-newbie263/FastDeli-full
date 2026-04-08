const fsp = require('fs/promises');
const path = require('path');
const { spawn } = require('child_process');
const http = require('http');

const TUNNELS = [
  { port: 5000, envKey: 'EXPO_PUBLIC_AUTH_API_URL', label: 'auth-service' },
  { port: 5002, envKey: 'EXPO_PUBLIC_DELIVERY_API_URL', label: 'delivery-service' },
];

// Expo uu tien .env.local cao hon .env, nen ghi truc tiep vao .env.local
// de tranh xung dot khi ca 2 file cung ton tai.
const envPath = path.join(__dirname, 'driver-app', '.env.local');
const discoveredUrls = {};
const STATIC_DRIVER_ENV = {
  EXPO_PUBLIC_ENABLE_LOCAL_FALLBACK: 'false',
  EXPO_PUBLIC_API_TIMEOUT_MS: '4500',
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const probeLocalService = (port, timeoutMs = 2500) =>
  new Promise((resolve) => {
    const req = http.get(
      {
        hostname: '127.0.0.1',
        port,
        path: '/',
        timeout: timeoutMs,
      },
      (res) => {
        res.resume();
        resolve(res.statusCode >= 200 && res.statusCode < 500);
      }
    );

    req.on('error', () => resolve(false));
    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });
  });

const waitForLocalService = async ({ port, label }, maxWaitMs = 90000) => {
  const start = Date.now();
  while (Date.now() - start < maxWaitMs) {
    // eslint-disable-next-line no-await-in-loop
    const ok = await probeLocalService(port);
    if (ok) {
      console.log(`Local service ready: ${label} on 127.0.0.1:${port}`);
      return true;
    }
    // eslint-disable-next-line no-await-in-loop
    await sleep(1500);
  }

  console.warn(`Timeout waiting local service: ${label} on 127.0.0.1:${port}`);
  return false;
};

const upsertEnvLine = (content, key, value) => {
  const line = `${key}=${value}`;
  if (content.includes(`${key}=`)) {
    return content.replace(new RegExp(`${key}=.*`, 'g'), line);
  }
  return content ? `${content}\n${line}` : line;
};

const persistEnv = async () => {
  let envContent = '';
  try {
    envContent = await fsp.readFile(envPath, 'utf8');
  } catch (_) {
    envContent = '';
  }

  let nextContent = envContent;
  Object.entries(STATIC_DRIVER_ENV).forEach(([envKey, value]) => {
    nextContent = upsertEnvLine(nextContent, envKey, value);
  });

  Object.entries(discoveredUrls).forEach(([envKey, url]) => {
    nextContent = upsertEnvLine(nextContent, envKey, url);
  });

  await fsp.writeFile(envPath, nextContent, 'utf8');
};

function startTunnel({ port, envKey, label }) {
  console.log(`Starting localtunnel for ${label} on port ${port}...`);
  const lt = spawn('npx', ['localtunnel', '--port', String(port), '--local-host', '127.0.0.1'], { shell: true });

  lt.stdout.on('data', async (data) => {
    const output = data.toString();
    process.stdout.write(output);

    const match = output.match(/your url is: (https:\/\/[^\s]+)/);
    if (!match) {
      return;
    }

    const url = match[1];
    discoveredUrls[envKey] = url;
    await persistEnv();

    console.log(` ${label}: ${url}`);
    console.log(` Updated driver-app/.env.local -> ${envKey}=${url}`);
    console.log(' Restart Expo app after both URLs are ready.');
  });

  lt.stderr.on('data', (data) => {
    process.stderr.write(`[${label}] ${data}`);
  });

  lt.on('close', (code) => {
    console.log(`[${label}] localtunnel exited with code ${code}`);
  });
}

async function run() {
  console.log('Waiting local services before opening public tunnels...');
  for (const tunnel of TUNNELS) {
    // eslint-disable-next-line no-await-in-loop
    await waitForLocalService(tunnel);
  }

  TUNNELS.forEach(startTunnel);
}

run();
