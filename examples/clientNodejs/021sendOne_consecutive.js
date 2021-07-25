/**
 * Send to one client several consecutive messages.
 * Open in another terminal $node 010onMessage.js
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
    questionTimeout: 3*60*1000, // wait 3secs for answer
    reconnectAttempts: 5, // try to reconnect 5 times
    reconnectDelay: 3000, // delay between reconnections is 3 seconds
    subprotocols: ['jsonRWS'],
    debug: false
  };
  const testClient = new TestClient(wcOpts);
  const socket = await testClient.connect();

  const body = {
    user_id: '5eec761a790f891791d48fa8',
    robot_id: '5ef5a545790f891791d73223',
    task_id: '60ab4fcc17c14b29e642a6d7',
    echo_method: 'log',
    echo_msg: 'Task \"050infinite_run\" is resumed - 25.5.2021 12:51:22',
    time: '2021-05-25T10:51:22.254Z'
  };

  // NOTICE: Will not work well if await is not used !!!
  await testClient.sendOne(210725152743550900, 'some message 1');
  await testClient.sendOne(210725152743550900, body);
  await testClient.sendOne(210725152743550900, 'some message 3');
  await testClient.sendOne(210725152743550900, 'some message 4');
  await testClient.sendOne(210725152743550900, 'some message 5');

  await testClient.sendOne(210725152743550900, 'some message 6');
  await testClient.sendOne(210725152743550900, 'some message 7');
  await testClient.sendOne(210725152743550900, 'some message 8');
  await testClient.sendOne(210725152743550900, 'some message 9');
  await testClient.sendOne(210725152743550900, 'some message 10');

  console.log('Messages sent');

  await helper.sleep(1000);
  process.exit();
};



main().catch(err => console.log(err));
