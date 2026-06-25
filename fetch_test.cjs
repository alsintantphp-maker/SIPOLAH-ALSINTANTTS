const http = require('http');

http.get('http://localhost:3000/api/spreadsheet?url=15uUmtI5CDwUw6FpvPyshOR2v9zoDXDxp-3a_D5al7C4', (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => console.log(data));
}).on('error', (err) => console.error(err));
