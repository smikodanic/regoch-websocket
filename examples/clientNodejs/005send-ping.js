/**
 * Ping example.
 * Client is sending ping (opcode 0x9) and the server is responding with pong (opcode 0xA).
 */
const Client13jsonRWS = require('../../clientNodejs/Client13jsonRWS');
const helper = require('../../lib/helper');


class TestClient extends Client13jsonRWS {
  constructor(wcOpts) {
    super(wcOpts);
  }
}



const main = async () => {
  // connect to websocket server
  const wcOpts = {
    wsURL: 'ws://localhost:3211?authkey=TRTmrt',
    questionTimeout: 3*1000, // wait for answer
    reconnectAttempts: 3, // try to reconnect n times
    reconnectDelay: 3000, // delay between reconnections
    subprotocols: ['jsonRWS'],
    debug: false
  };
  const testClient = new TestClient(wcOpts);
  await testClient.connect();

  await helper.sleep(2000);
  console.log('Sending pings ...');

  testClient.ping(1000, 5); // send ping 5 times, every 1 second

  testClient.on('pong', msgSTR => {
    console.log('received::', msgSTR);
  });
};

main();



