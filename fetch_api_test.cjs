const http = require('http');

http.get('http://localhost:3000/api/fetch-external-data', (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    try {
        console.log(JSON.parse(data).data.length, 'records');
        console.log(JSON.parse(data).data.slice(0, 2));
    } catch (e) {
        console.log(data);
    }
  });
}).on('error', (err) => console.error(err));
