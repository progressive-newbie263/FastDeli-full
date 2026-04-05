const fsp = require('fs/promises');
const path = require('path');
const { spawn } = require('child_process');

async function run() {
  console.log('Starting localtunnel on port 5000...');
  const lt = spawn('npx', ['localtunnel', '--port', '5000'], { shell: true });

  lt.stdout.on('data', async (data) => {
    const output = data.toString();
    console.log(output);
    const match = output.match(/your url is: (https:\/\/[^\s]+)/);
    if (match) {
      const url = match[1];
      console.log(`\n✅ Tunnel created! Public URL: ${url}`);
      
      const envPath = path.join(__dirname, 'driver-app', '.env');
      let envContent = '';
      try {
        envContent = await fsp.readFile(envPath, 'utf8');
      } catch (err) {
        // File doesn't exist, we will create it
      }
      
      const newEnvLine = `EXPO_PUBLIC_AUTH_API_URL=${url}`;
      let updatedContent;
      if (envContent.includes('EXPO_PUBLIC_AUTH_API_URL=')) {
        updatedContent = envContent.replace(/EXPO_PUBLIC_AUTH_API_URL=.*/, newEnvLine);
      } else {
        updatedContent = envContent ? envContent + `\n${newEnvLine}` : newEnvLine;
      }
      
      await fsp.writeFile(envPath, updatedContent, 'utf8');
      console.log(`✅ Updated driver-app/.env with: ${newEnvLine}`);
      console.log(`\n👉 PLEASE RESTART YOUR EXPO APP (npx expo start --clear) for the new URL to take effect.`);
      console.log(`   Keep this terminal open while you test on public networks!`);
    }
  });

  lt.stderr.on('data', (data) => {
    console.error(`lt stderr: ${data}`);
  });

  lt.on('close', (code) => {
    console.log(`localtunnel process exited with code ${code}`);
  });
}

run();
