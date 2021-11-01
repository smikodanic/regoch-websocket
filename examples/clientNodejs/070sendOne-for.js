/**
 * Send to one client many many messages.
 * Open client for leistening messages in the another terminal with $node 010onMessage.js
 */
const { RWClientNodejs } = require('../../index.js');


class TestClient extends RWClientNodejs {
  constructor(wcOpts) {
    super(wcOpts);
  }
}


const main = async () => {
  // connect to websocket server
  const wcOpts = {
    wsURL: 'ws://localhost:3211?authkey=TRTmrt',
    questionTimeout: 3 * 1000,
    reconnectAttempts: 5, // try to reconnect 5 times
    reconnectDelay: 3000, // delay between reconnections is 3 seconds
    subprotocols: ['jsonRWS'],
    debug: false
  };
  const testClient = new TestClient(wcOpts);
  await testClient.connect();

  const n = 500;

  console.log(`Sending ${n} messages...`);

  for (let i = 1; i <= n; i++) {
    await testClient.sendOne(211101133145489020, `#${i} some message`);
  }
};



main().catch(err => console.log(err));
