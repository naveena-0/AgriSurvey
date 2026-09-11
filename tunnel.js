const localtunnel = require('localtunnel');
const fs = require('fs');

(async () => {
  try {
    const tunnel = await localtunnel({ port: 5173 });
    console.log('====================================');
    console.log('🌐 DIRECT PUBLIC URL:');
    console.log(tunnel.url);
    console.log('====================================');
    fs.writeFileSync('public_url.txt', tunnel.url);

    tunnel.on('close', () => {
      console.log('Tunnel was closed');
    });
  } catch (err) {
    console.error('Tunnel Error:', err);
  }
})();
