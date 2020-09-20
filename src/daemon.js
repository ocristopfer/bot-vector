var forever = require('forever-monitor');
const convert = (from, to) => str => Buffer.from(str, from).toString(to)
var child = new (forever.Monitor)('main.js', {
  max: 3,
  silent: true,
  args: []
});

child.on('exit', function () {
  console.log('your-filename.js has exited after 3 restarts');
});

child.on('error', function (data) {
    console.log(data);
});


child.on('stdout', function (data) {
  console.log(data);
  var str = convert(data['buffer']);
  console.log(str);
});

child.on('stderr', function (data) {
  console.log(convert(data));
});


child.start();