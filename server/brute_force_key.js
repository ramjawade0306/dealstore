const https = require('https');

const base = 'AIzaSy';
const mid = 'NiEFTau5gcBGi7_';
const end = 'WzLJdnE_mg';

const candidates1 = ['AoKd', 'Aokd'];
const candidates2 = ['Atl2', 'At12', 'AtI2', 'AtL2'];

async function test(key) {
  return new Promise(resolve => {
    const data = JSON.stringify({ returnSecureToken: true });
    const req = https.request({
      hostname: 'identitytoolkit.googleapis.com',
      path: '/v1/accounts:signUp?key=' + key,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, res => {
      let b = '';
      res.on('data', d => b += d);
      res.on('end', () => {
        const j = JSON.parse(b);
        const isInvalid = j.error && j.error.message.includes('API_KEY_INVALID');
        if (!isInvalid) {
          console.log(`⭐⭐ FOUND VALID KEY: ${key}`);
          console.log(`Response Message: ${j.error ? j.error.message : 'SUCCESS'}`);
          resolve(true);
        } else {
          resolve(false);
        }
      });
    });
    req.write(data);
    req.end();
  });
}

async function run() {
  for (const c1 of candidates1) {
    for (const c2 of candidates2) {
      const key = `${base}${c1}${mid}${c2}${end}`;
      if (await test(key)) {
        console.log('--- TEST COMPLETE ---');
        return;
      }
    }
  }
  console.log('--- NO VALID KEY FOUND ---');
}

run();
