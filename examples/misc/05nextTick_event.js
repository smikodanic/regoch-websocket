const { EventEmitter } = require('events');
const eventEmitter = new EventEmitter();
eventEmitter.setMaxListeners(8);


eventEmitter.on('mojEVT', msg => {
  console.log(msg);
});


eventEmitter.emit('mojEVT', 'Start ...');


for (let i = 1; i <= 10; i++) {
  console.log(`# ${i}`);
  eventEmitter.emit('mojEVT', `Message # ${i}`);
  setImmediate(() => {
    eventEmitter.emit('mojEVT', `Immediate # ${i}`);
  });
  process.nextTick(() => {
    eventEmitter.emit('mojEVT', `Tick # ${i}`);
  });
}

setTimeout(() => {
  console.log('timeout');
  eventEmitter.emit('mojEVT', 'Timeout ...');
}, 3400);


setImmediate(() => {
  eventEmitter.emit('mojEVT', 'Immediate ...');
});

