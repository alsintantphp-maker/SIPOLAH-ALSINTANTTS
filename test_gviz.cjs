fetch('https://docs.google.com/spreadsheets/d/15uUmtI5CDwUw6FpvPyshOR2v9zoDXDxp-3a_D5al7C4/gviz/tq?tqx=out:csv&gid=1391367572')
.then(res => res.text())
.then(console.log);
