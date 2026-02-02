const { spawn } = require('child_process');
const path = require('path');

const domain = `tm-mobile-${Date.now()}.surge.sh`;
const surgeBin = path.join('node_modules', 'surge', 'bin', 'surge');
const viteBin = path.join('node_modules', 'vite', 'bin', 'vite.js');

function runCommand(command, args, name) {
  return new Promise((resolve, reject) => {
    console.log(`[${name}] Running: node ${command} ${args.join(' ')}`);
    const child = spawn('node', [command, ...args], {
      stdio: 'inherit',
      shell: true
    });

    child.on('close', (code) => {
      if (code === 0) {
        console.log(`[${name}] Success`);
        resolve();
      } else {
        console.error(`[${name}] Failed with code ${code}`);
        reject(new Error(`${name} failed`));
      }
    });
  });
}

async function deploy() {
  try {
    // 1. Build
    await runCommand(viteBin, ['build'], 'Build');

    // 2. Deploy
    const args = ['dist', '--domain', domain, '--token', '605caf902ebc111b47a394b2d7f4eee9', '--login', '1012494013@qq.com'];
    
    let attempts = 0;
    const maxAttempts = 3;
    
    while (attempts < maxAttempts) {
        try {
            console.log(`Deploying to ${domain}... (Attempt ${attempts + 1}/${maxAttempts})`);
            await runCommand(surgeBin, args, 'Surge');
            console.log(`\nSUCCESS: Deployed to https://${domain}`);
            break;
        } catch (e) {
            attempts++;
            console.error(`Deployment attempt ${attempts} failed.`);
            if (attempts >= maxAttempts) {
                throw new Error('All deployment attempts failed.');
            }
            console.log('Retrying in 2 seconds...');
            await new Promise(r => setTimeout(r, 2000));
        }
    }
  } catch (err) {
    console.error('\nDeployment failed:', err);
    process.exit(1);
  }
}

deploy();
