/**
 * Ping example.
 * Client is sending ping (opcode 0x9) and the server is responding with pong (opcode 0xA).
 */
const { RWClientNodejs, lib } = require('../../index.js');
const helper = lib.helper;


class TestClient extends RWClientNodejs {
  constructor(wcOpts) {
    super(wcOpts);
  }
}



const main = async () => {
  // connect to websocket server
  const wcOpts = {
    wsURL: 'ws://localhost:3211?authkey=TRTmrt',
    questionTimeout: 3 * 1000, // wait for answer
    reconnectAttempts: 3, // try to reconnect n times
    reconnectDelay: 3000, // delay between reconnections
    subprotocols: ['jsonRWS'],
    debug: false,
    debug_DataParser: false
  };
  const testClient = new TestClient(wcOpts);
  await testClient.connect();

  console.log('Send 5 pings every 1 second and receive pongs...');
  await helper.sleep(2000);

  testClient.on('pong', msgSTR => {
    console.log('received::', msgSTR);
  });

  // IMPORTANT: Use ping() method after on('pong', cb) listener
  await testClient.ping(1000, 5); // send ping 5 times, every 1 second
};

main();



