const https = require('https');

https.get('https://docs.google.com/spreadsheets/d/15uUmtI5CDwUw6FpvPyshOR2v9zoDXDxp-3a_D5al7C4/export?format=csv&gid=1391367572', (res) => {
  // follow redirects
  if (res.statusCode > 300 && res.statusCode < 400 && res.headers.location) {
    https.get(res.headers.location, (res2) => {
      let data = '';
      res2.on('data', (chunk) => data += chunk);
      res2.on('end', () => console.log(data));
    });
  } else {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => console.log(data));
  }
}).on('error', (err) => console.error(err));
