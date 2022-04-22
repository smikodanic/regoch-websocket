class TestClient extends window.regochWebsocket.Client13jsonRWS {

  constructor(wcOpts) {
    super(wcOpts);
  }


  async connectMe() {
    const wsocket = await this.connect();
    console.log('+++Connected', wsocket);
    this.messageReceiver();
  }


  /*** Questions Tests */
  async questionSocketId_test() {
    try {
      const socketID = await this.questionSocketId();
      $('[data-text="socketID"]').text(socketID);
    } catch (err) {
      console.error(err);
    }
  }

  async questionSocketList_test() {
    try {
      const socketIDs = await this.questionSocketList();
      $('[data-text="socketIDs"]').text(JSON.stringify(socketIDs));
    } catch (err) {
      console.error(err);
    }
  }

  async questionRoomList_test() {
    try {
      const rooms = await this.questionRoomList(); // [{name, socketIDs}]
      if (!!rooms) {
        const roomNames = rooms.map(room => room.name);
        $('[data-text="roomNames"]').text(roomNames);
      }
    } catch (err) {
      console.error(err);
    }
  }

  async questionRoomListmy_test() {
    try {
      const rooms = await this.questionRoomListmy(); // [{name, socketIDs}]
      if (!!rooms) {
        const roomNames = rooms.map(room => room.name);
        $('[data-text="myRoomNames"]').text(roomNames);
      }
    } catch (err) {
      console.error(err);
    }
  }



  /*** Send Tests */
  async sendOne_test() {
    const to = document.getElementById('to1').value;
    const payload = document.getElementById('payload1').value;
    await this.sendOne(to, payload);
  }

  async send_test() {
    const tos = document.getElementById('to2').value; // string '210205081923171300, 210205082042463230'
    const to = tos.split(',').map(to => to.trim()); // array of strings ['210205081923171300', '210205082042463230']
    const payload = document.getElementById('payload2').value;
    await this.send(to, payload);
  }

  async broadcast_test() {
    const payload = document.getElementById('payload3').value;
    await this.broadcast(payload);
  }

  async sendAll_test() {
    const payload = document.getElementById('payload4').value;
    await this.sendAll(payload);
  }

  // async/await must be used in the consecutive sending
  async sendOne_consecutive_test() {
    const to = document.getElementById('to5').value;
    for (let i = 1; i <= 100; i++) {
      const payload = `${i}. consecutive message`;
      await this.sendOne(to, payload);
    }
  }






  // https://developer.mozilla.org/en-US/docs/Web/API/WebSocket/readyState
  printInfo(msg) {
    const msgSize = window.regoch.helper.getMessageSize(msg);
    if (this.wsocket && this.wsocket.readyState === 1) { console.log(`Sent (${msgSize}): ${msg}`); }
  }



  /*** ROOM ***/
  roomEnter_test() {
    const roomName = document.getElementById('roomName').value;
    this.roomEnter(roomName);
  }

  roomExit_test() {
    const roomName = document.getElementById('roomName').value;
    this.roomExit(roomName);
  }

  roomExitAll_test() {
    this.roomExitAll();
  }

  roomSend_test() {
    const roomName = document.getElementById('roomName').value;
    const roomMessage = document.getElementById('roomMessage').value;
    this.roomSend(roomName, roomMessage);
  }



  /*** SERVER COMMANDS ***/
  setNick_test() {
    const nickname = document.getElementById('nickname').value;
    this.setNick(nickname);
  }

  route_test() {
    const uri = document.getElementById('routeUri').value;
    const bodyStr = document.getElementById('routeBody').value;
    const body = JSON.parse(bodyStr);
    this.route(uri, body);
  }


  route_test2() {
    const uri = document.getElementById('routeUri2').value;
    this.route(uri);

    // receive route
    this.once('route', (msg, msgSTR) => {
      console.log('route msg::', msg);

      // regoch-router transitional varaible trx
      const router = new window.regochRouter({ debug: false });
      const payload = msg.payload; // {uri:string, body?:any}
      router.trx = {
        uri: payload.uri,
        body: payload.body,
        client: this
      };

      // route definitions
      router.def('/returned/back/:n', (trx) => { console.log('trx.params::', trx.params); });
      router.notfound((trx) => { console.log(`The URI not found: ${trx.uri}`); });

      // execute the router
      router.exe().catch(err => {
        console.log(err);
      });

    });
  }


  messageReceiver() {
    this.on('message', (msg, msgSTR) => {
      console.log('Message msg (message after subprotocol):::', msg); // message after subprotocol
      console.log('Message msgSTR (message string):::', msgSTR); // received message
      $('#incomingMessage').text(msg.payload);
    });

    this.on('message-error', err => {
      console.error('Message error:::', err);
    });

    this.on('server-error', (msg, msgSTR) => {
      console.error('Server error:::', msgSTR);
    });
  }


  /*** test on, once, off, offAll ***/
  async sendContinuous() {
    const to = $('#toID').val();
    for (let i = 1; i <= 100; i++) {
      const payload = `${i}. message sent`;
      await this.sendOne(to, payload);
      await new Promise(r => setTimeout(r, 1000));
    }
  }

  testON() {
    this.msg_listener = (msg, msgSTR) => {
      $('#receivedMessage').text(msg.payload);
    };
    this.on('message', this.msg_listener);
  }

  testONCE() {
    this.once('message', (msg, msgSTR) => {
      $('#receivedMessage').text(msg.payload);
      console.log('testONCE msgSTR::', msgSTR);
    });
  }

  testOFF() {
    this.off('message', this.msg_listener);
  }

  testOFFALL() {
    this.offAll('message');
  }




}




const wcOpts = {
  wsURL: 'ws://localhost:3211?authkey=TRTmrt',
  connectTimeout: 8000,
  reconnectAttempts: 6, // try to reconnect n times
  reconnectDelay: 5000, // delay between reconnections
  questionTimeout: 13000, // wait for answer
  subprotocols: ['jsonRWS', 'raw'],
  autodelayFactor: 500,
  debug: false,
  debug_DataParser: false
};

const testCB = new TestClient(wcOpts);
