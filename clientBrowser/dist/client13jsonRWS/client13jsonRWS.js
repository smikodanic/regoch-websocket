(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
/**
 * Websocket Client for Browser
 * - websocket version: 13
 * - subprotocol: jsonRWS
 */
const eventEmitter = require('./aux/eventEmitter');
const jsonRWS = require('../../lib/subprotocol/jsonRWS');
const helper = require('../../lib/helper');


class Client13jsonRWS {

  /**
   * @param {{wsURL:string, questionTimeout:number, reconnectAttempts:number, reconnectDelay:number, subprotocols:string[], debug:boolean}} wcOpts - websocket client options
   */
  constructor(wcOpts) {
    this.wcOpts = wcOpts; // websocket client options
    this.wsocket; // Websocket instance https://developer.mozilla.org/en-US/docs/Web/API/WebSocket
    this.socketID; // socket ID number, for example: 210214082949459100

    this.attempt = 1; // reconnect attempt counter
  }


  /************* CLIENT CONNECTOR ************/
  /**
   * Connect to the websocket server.
   * @returns {Promise<Socket>}
   */
  connect() {
    const wsURL = this.wcOpts.wsURL; // websocket URL: ws://localhost:3211/something?authkey=TRTmrt
    this.wsocket = new WebSocket(wsURL, this.wcOpts.subprotocols);

    this.onEvents();

    // return socket as promise
    return new Promise(resolve => {
      // eventEmitter.removeAllListeners(); // not needed if once() is used
      eventEmitter.once('connected', () => { resolve(this.wsocket); });
      // console.log(`"connected" listeners: ${eventEmitter.listenerCount('connected')}`.cliBoja('yellow'));
    });
  }


  /**
   * Disconnect from the websocket server.
   * @returns {void}
   */
  disconnect() {
    if (!!this.wsocket) { this.wsocket.close(); }
    this.blockReconnect();
  }


  /**
   * Try to reconnect the client when the socket is closed.
   * This method is fired on every 'close' socket's event.
   */
  async reconnect() {
    const attempts = this.wcOpts.reconnectAttempts;
    const delay = this.wcOpts.reconnectDelay;
    if (this.attempt <= attempts) {
      await helper.sleep(delay);
      this.connect();
      console.log(`Reconnect attempt #${this.attempt} of ${attempts} in ${delay}ms`);
      this.attempt++;
    }
  }


  /**
   * Block reconnect usually after disconnect() method is used.
   */
  blockReconnect() {
    this.attempt = this.wcOpts.reconnectAttempts + 1;
  }



  /**
   * Event listeners.
   * @returns {void}
   */
  onEvents() {
    this.wsocket.onopen = async (openEvt) => {
      this.onMessage();
      console.log('WS Connection opened');
      this.attempt = 1;
      this.socketID = await this.infoSocketId();
      console.log(`socketID: ${this.socketID}`);
      eventEmitter.emit('connected');
    };

    this.wsocket.onclose = (closeEvt) => {
      console.log('WS Connection closed');
      delete this.wsocket; // Websocket instance https://developer.mozilla.org/en-US/docs/Web/API/WebSocket
      delete this.socketID;
      this.reconnect();
    };

    this.wsocket.onerror = (errorEvt) => {
      // console.error(errorEvt);
    };
  }



  /************* RECEIVER ************/
  /**
   * Receive the message event and push it to msgStream.
   * @returns {void}
   */
  onMessage() {
    this.wsocket.onmessage = event => {
      try {
        const msgSTR = event.data;
        this.debugger('Received::', msgSTR);
        const msg = jsonRWS.incoming(msgSTR); // test against subprotocol rules and convert string to object);

        const detail = {msg, msgSTR};
        if (msg.cmd === 'route') { eventEmitter.emit('route', detail); }
        else if (msg.cmd === 'info/socket/id') { eventEmitter.emit('question', detail); }
        else if (msg.cmd === 'info/socket/list') { eventEmitter.emit('question', detail); }
        else if (msg.cmd === 'info/room/list') { eventEmitter.emit('question', detail); }
        else if (msg.cmd === 'info/room/listmy') { eventEmitter.emit('question', detail); }
        else { eventEmitter.emit('message', detail); }

      } catch (err) {
        console.error(err);
      }
    };
  }



  /************* QUESTIONS ************/
  /*** Send a question to the websocket server and wait for the answer. */
  /**
   * Send question and expect the answer.
   * @param {string} cmd - command
   * @returns {Promise<object>}
   */
  question(cmd) {
    // send the question
    const payload = undefined;
    const to = this.socketID;
    this.carryOut(to, cmd, payload);

    // receive the answer
    return new Promise(async (resolve, reject) => {
      this.once('question', async (msg, msgSTR) => {
        if (msg.cmd === cmd) { resolve(msg); }
        else { reject(new Error('Received cmd is not same as sent cmd.')); }
      });
      await helper.sleep(this.wcOpts.questionTimeout);
      reject(new Error(`No answer for the question: ${cmd}`));
    });
  }

  /**
   * Send question about my socket ID.
   * @returns {Promise<number>}
   */
  async infoSocketId() {
    const answer = await this.question('info/socket/id');
    this.socketID = +answer.payload;
    return this.socketID;
  }

  /**
   * Send question about all socket IDs connected to the server.
   * @returns {Promise<number[]>}
   */
  async infoSocketList() {
    const answer = await this.question('info/socket/list');
    return answer.payload;
  }

  /**
   * Send question about all rooms in the server.
   * @returns {Promise<{name:string, socketIds:number[]}[]>}
   */
  async infoRoomList() {
    const answer = await this.question('info/room/list');
    return answer.payload;
  }

  /**
   * Send question about all rooms where the client was entered.
   * @returns {Promise<{name:string, socketIds:number[]}[]>}
   */
  async infoRoomListmy() {
    const answer = await this.question(`info/room/listmy`);
    return answer.payload;
  }






  /************* SEND MESSAGE TO OTHER CLIENTS ************/
  /**
   * Send message to the websocket server if the connection is not closed (https://developer.mozilla.org/en-US/docs/Web/API/WebSocket/readyState).
   * @param {number|number[]} to - final destination: 210201164339351900
   * @param {string} cmd - command
   * @param {any} payload - message payload
   * @returns {void}
   */
  async carryOut(to, cmd, payload) {
    const id = helper.generateID(); // the message ID
    const from = +this.socketID; // the sender ID
    if (!to) { to = 0; } // server ID is 0
    const msgObj = {id, from, to, cmd, payload};
    const msg = jsonRWS.outgoing(msgObj);
    this.debugger('Sent::', msg);

    // the message must be defined and client must be connected to the server
    if (!!msg && !!this.wsocket && this.wsocket.readyState === 1) {
      await new Promise(r => setTimeout(r, 0));
      await this.wsocket.send(msg);
    } else {
      throw new Error('The message is not defined or the client is disconnected.');
    }
  }


  /**
   * Send message (payload) to one client.
   * @param {number} to - 210201164339351900
   * @param {any} msg - message sent to the client
   * @returns {void}
   */
  async sendOne(to, msg) {
    const cmd = 'socket/sendone';
    const payload = msg;
    await this.carryOut(to, cmd, payload);
  }


  /**
   * Send message (payload) to one or more clients.
   * @param {number[]} to - [210205081923171300, 210205082042463230]
   * @param {any} msg - message sent to the clients
   * @returns {void}
   */
  async send(to, msg) {
    const cmd = 'socket/send';
    const payload = msg;
    await this.carryOut(to, cmd, payload);
  }


  /**
   * Send message (payload) to all clients except the sender.
   * @param {any} msg - message sent to the clients
   * @returns {void}
   */
  async broadcast(msg) {
    const to = 0;
    const cmd = 'socket/broadcast';
    const payload = msg;
    await this.carryOut(to, cmd, payload);
  }

  /**
   * Send message (payload) to all clients and the sender.
   * @param {any} msg - message sent to the clients
   * @returns {void}
   */
  async sendAll(msg) {
    const to = 0;
    const cmd = 'socket/sendall';
    const payload = msg;
    await this.carryOut(to, cmd, payload);
  }



  /************* ROOM ************/
  /**
   * Subscribe in the room.
   * @param {string} roomName
   * @returns {void}
   */
  async roomEnter(roomName) {
    const to = 0;
    const cmd = 'room/enter';
    const payload = roomName;
    await this.carryOut(to, cmd, payload);
  }

  /**
   * Unsubscribe from the room.
   * @param {string} roomName
   * @returns {void}
   */
  async roomExit(roomName) {
    const to = 0;
    const cmd = 'room/exit';
    const payload = roomName;
    await this.carryOut(to, cmd, payload);
  }

  /**
   * Unsubscribe from all rooms.
   * @returns {void}
   */
  async roomExitAll() {
    const to = 0;
    const cmd = 'room/exitall';
    const payload = undefined;
    await this.carryOut(to, cmd, payload);
  }

  /**
   * Send message to the room.
   * @param {string} roomName
   * @param {any} msg
   * @returns {void}
   */
  async roomSend(roomName, msg) {
    const to = roomName;
    const cmd = 'room/send';
    const payload = msg;
    await this.carryOut(to, cmd, payload);
  }




  /********* SEND MESSAGE (COMMAND) TO SERVER *********/
  /**
   * Setup a nick name.
   * @param {string} nickname - nick name
   * @returns {void}
   */
  async setNick(nickname) {
    const to = 0;
    const cmd = 'socket/nick';
    const payload = nickname;
    await this.carryOut(to, cmd, payload);
  }


  /**
   * Send route command.
   * @param {string} uri - route URI, for example /shop/product/55
   * @param {any} body - body
   * @returns {void}
   */
  async route(uri, body) {
    const to = 0;
    const cmd = 'route';
    const payload = {uri, body};
    await this.carryOut(to, cmd, payload);
  }




  /*********** LISTENERS ************/
  /**
   * Wrapper around the eventEmitter
   * @param {string} eventName - event name: 'connected', 'message', 'route', 'question
   * @param {Function} listener - callback function, for example: (msg, msgSTR) => { console.log(msgSTR); }
   */
  on(eventName, listener) {
    return eventEmitter.on(eventName, event => {
      listener.call(null, event.detail.msg, event.detail.msgSTR);
    });
  }

  /**
   * Wrapper around the eventEmitter
   * @param {string} eventName - event name: 'connected', 'message', 'route', 'question
   * @param {Function} listener - callback function, for example: (msg, msgSTR) => { console.log(msgSTR); }
   */
  once(eventName, listener) {
    return eventEmitter.on(eventName, event => {
      listener.call(null, event.detail.msg, event.detail.msgSTR);
    });
  }

  /**
   * Wrapper around the eventEmitter
   * @param {string} eventName - event name: 'connected', 'message', 'route', 'question
   */
  off(eventName) {
    return eventEmitter.off(eventName);
  }



  /*********** MISC ************/
  /**
   * Debugger. Use it as this.debug(var1, var2, var3)
   * @returns {void}
   */
  debugger(...textParts) {
    const text = textParts.join('');
    if (this.wcOpts.debug) { console.log(text); }
  }




}




// NodeJS
if (typeof module !== 'undefined') {
  module.exports = Client13jsonRWS;
}

// Browser
if (typeof window !== 'undefined') {
  window.regochWebsocket = { Client13jsonRWS };
}

},{"../../lib/helper":3,"../../lib/subprotocol/jsonRWS":4,"./aux/eventEmitter":2}],2:[function(require,module,exports){
class EventEmitter {

  constructor() {
    this.activeOns = []; // [{eventName:string, listenerCB:Function}]
  }

  /**
   * Create and emit the event
   * @param {string} eventName - event name, for example: 'pushstate'
   * @param {any} detail - event argument
   * @returns {void}
   */
  emit(eventName, detail) {
    const evt = new CustomEvent(eventName, {detail});
    window.dispatchEvent(evt);
  }


  /**
   * Listen for the event
   * @param {string} eventName - event name, for example: 'pushstate'
   * @param {Function} listener - callback function with event parameter
   * @returns {void}
   */
  on(eventName, listener) {
    const listenerCB = event => { listener(event); };

    // remove duplicated listeners
    let ind = 0;
    for (const activeOn of this.activeOns) {
      if (activeOn.eventName === eventName && activeOn.listenerCB.toString() === listenerCB.toString()) {
        window.removeEventListener(eventName, activeOn.listenerCB);
        this.activeOns.splice(ind, 1);
      }
      ind++;
    }

    this.activeOns.push({eventName, listenerCB});
    window.addEventListener(eventName, listenerCB);
  }


  /**
   * Listen for the event only once
   * @param {string} eventName - event name, for example: 'pushstate'
   * @param {Function} listener - callback function with event parameter
   * @returns {void}
   */
  once(eventName, listener) {
    const listenerCB = event => {
      listener(event);
      window.removeEventListener(eventName, listenerCB);
    };
    window.addEventListener(eventName, listenerCB, {once: true});
  }


  /**
   * Stop listening the event for multiple listeners defined with on().
   * For example eventEmitter.on('msg', fja1) & eventEmitter.on('msg', fja2) then eventEmitter.off('msg') will remove fja1 and fja2 listeners.
   * @param {string} eventName - event name, for example: 'pushstate'
   * @returns {void}
   */
  off(eventName) {
    let ind = 0;
    for (const activeOn of this.activeOns) {
      if (activeOn.eventName === eventName) {
        window.removeEventListener(eventName, activeOn.listenerCB);
        this.activeOns.splice(ind, 1);
      }
      ind++;
    }
  }



  /**
   * Get all active listeners.
   * @returns {{eventName:string, listenerCB:Function}[]}
   */
  getListeners() {
    return {...this.activeOns};
  }



}


module.exports = new EventEmitter();

},{}],3:[function(require,module,exports){
class Helper {

  /**
   * Create unique id. It's combination of timestamp and random number 'r'
   * in format: YYMMDDHHmmssSSSrrr ---> YY year, MM month, DD day, HH hour, mm min, ss sec, SSS ms, rrr 3 random digits
   * 18 digits in total, for example: 210129163129492100
   * @returns {number}
   */
  generateID() {
    const rnd = Math.random() * 1000;
    const rrr = Math.floor(rnd);

    const timestamp = new Date();
    const tsp = timestamp.toISOString()
      .replace(/^20/, '')
      .replace(/\-/g, '')
      .replace(/\:/g, '')
      .replace('T', '')
      .replace('Z', '')
      .replace('.', '');

    const id = +(tsp + rrr);
    return id;
  }


  /**
   * Gives now time in nice format -> Friday, 1/29/2021, 16:31:29.801
   * @returns {string}
   */
  nowTime() {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-us', {
      weekday: 'long',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      fractionalSecondDigits: 3,
      hour12: false,
      timeZone: 'UTC'
    });
    return formatter.format(now);
  }


  /**
   * Pause the code execution
   * @param {number} ms - miliseconds
   * @returns {Promise}
   */
  async sleep(ms) {
    await new Promise(resolve => setTimeout(resolve, ms));
  }



  /**
   * Print all buffer values as string. The bytes are printed separately, for example byte 81, byte 7e ...etc
   * For example: 81 7e 00 8b 7b 22 69 64 22 3a 32 31 30 32 31 34 31 30
   * @param {Buffer} buff
   * @returns {void}
   */
  printBuffer(buff) {
    console.log(buff.toString('hex').match(/../g).join(' '));
  }


}




module.exports = new Helper();

},{}],4:[function(require,module,exports){
/**
 * Subprotocol name: jsonRWS
 * HTTP header: "Sec-WebSocket-Protocol": "jsonRWS"
 *
 * Subprotocol description:
 *  This subprotocol is created for communication between websocket server and client.
 *
 * Subprotocol definitons:
 *  a) Client have to send message in valid JSON format. Allowed fields: id, from, to, cmd, payload.
 *  b) Server have to send message in valid JSON format. Allowed fields: id, from, to, cmd, payload.
 *  c) The message is converted from string to object.
 */


class JsonRWS {

  constructor() {
    this.delimiter = '<<!END!>>';
  }

  /*********** INCOMING MESSAGES ***********/
  /**
   * Execute the jsonRWS subprotocol for incoming messages. Filter and map incoming messages.
   * 1. Test if the message has valid "jsonRWS" format {id:number, from:number, to:number|number[]|string, cmd:string, payload?:any}.
   * 2. Convert the message from string to object.
   * @param {string} msgSTR -incoming message
   * @returns {{id:number, from:number, to:number|number[]|string, cmd:string, payload?:any}}
   */
  incoming(msgSTR) {
    let tf = false;
    let msg;
    try {
      msgSTR = msgSTR.replace(this.delimiter, ''); // remove delimiter
      msg = JSON.parse(msgSTR);
      const msgObjProperties = Object.keys(msg);
      tf = this._testFields(msgObjProperties);
    } catch (err) {
      tf = false;
    }

    if (tf) { return msg; }
    else { throw new Error(`Incoming message doesn\'t have valid "jsonRWS" subprotocol format. msg:: "${msgSTR}"`); }
  }



  /*********** OUTGOING MESSAGES ***********/
  /**
   * Execute the jsonRWS subprotocol for outgoing messages. Filter and map outgoing messages.
   * 1. Test if the message has valid "jsonRWS" format {id:number, from:number, to:number|number[]|string, cmd:string, payload:any}.
   * 2. Convert the message from object to string.
   * @param {{id:number, from:number, to:number|number[]|string, cmd:string, payload?:any}} msg - outgoing message
   * @returns {string}
   */
  outgoing(msg) {
    const msgObjProperties = Object.keys(msg);
    const tf = this._testFields(msgObjProperties);

    if (tf) {
      const msgSTR = JSON.stringify(msg) + this.delimiter;
      return msgSTR;
    } else {
      throw new Error(`Outgoing message doesn\'t have valid "jsonRWS" subprotocol format. msg:: ${JSON.stringify(msg)}`);
    }
  }



  /*********** PROCESS MESSAGES ***********/
  /**
   * Process client messages internally.
   * @param {object} msg - instruction message - {id, from, to, cmd, payload}
   * @param {Socket} socket - client which received the message
   * @param {DataTransfer} dataTransfer - instance of the DataTransfer
   * @param {SocketStorage} socketStorage - instance of the SockketStorage
   * @param {EventEmitter} eventEmitter - event emitter initiated in the RWS.js
   */
  async process(msg, socket, dataTransfer, socketStorage, eventEmitter) {
    const id = msg.id;
    const from = msg.from;
    const to = msg.to;
    const cmd = msg.cmd;
    const payload = msg.payload;


    /*** socket commands ***/
    if (cmd === 'socket/sendone') {
      // {id: 210129163129492000, from: 210129163129492111, to: 210201164339351900, cmd: 'socket/sendone', payload: 'Some message to another client'}
      const id = +msg.to;
      const toSocket = await socketStorage.findOne({id});
      dataTransfer.sendOne(msg, toSocket); }

    else if (cmd === 'socket/send') {
      // {id: 210129163129492000, from: 210129163129492111, to: [210201164339351900, 210201164339351901], cmd: 'socket/send', payload: 'Some message to another client(s)'}
      const socketIDs = to.map(socketID => +socketID); // convert to numbers
      const sockets = await socketStorage.find({id: {$in: socketIDs}});
      dataTransfer.send(msg, sockets); }

    else if (cmd === 'socket/broadcast') {
      // {id: 210129163129492000, from: 210129163129492111, to: 0, cmd: 'socket/broadcast', payload: 'Some message to all clients except the sender'}
      dataTransfer.broadcast(msg, socket); }

    else if (cmd === 'socket/sendall') {
      // {id: 210129163129492000, from: 210129163129492111, to: 0, cmd: 'socket/sendall', payload: 'Some message to all clients and the sender'}
      dataTransfer.sendAll(msg); }

    else if (cmd === 'socket/nick') {
      // {id: 210129163129492000, from: 210129163129492111, to: 0, cmd: 'socket/nick', payload: 'Peter Pan'}
      const nickname = msg.payload;
      try {
        await socketStorage.setNick(socket, nickname);
        msg.payload = socket.extension.nickname;
      } catch (err) {
        msg.cmd = 'error';
        msg.payload = err.message;
      }
      socket.extension.sendSelf(msg); }


    /*** room commands ***/
    else if (cmd === 'room/enter') {
      // {id: 210129163129492000, from: 210129163129492111, to: 0, cmd: 'room/enter', payload: 'My Chat Room'}
      const roomName = payload;
      socketStorage.roomEnter(socket, roomName);
      msg.payload = `Entered in the room '${roomName}'`;
      socket.extension.sendSelf(msg); }

    else if (cmd === 'room/exit') {
      // {id: 210129163129492000, from: 210129163129492111, to: 0, cmd: 'room/exit', payload: 'My Chat Room'}
      const roomName = payload;
      socketStorage.roomExit(socket, payload);
      msg.payload = `Exited from the room '${roomName}'`;
      socket.extension.sendSelf(msg); }

    else if (cmd === 'room/exitall') {
      // {id: 210129163129492000, from: 210129163129492111, to: 0, cmd: 'room/exitall'}
      socketStorage.roomExitAll(socket);
      msg.payload = 'Exited from all rooms';
      socket.extension.sendSelf(msg); }

    else if (cmd === 'room/send') {
      // {id: 210129163129492000, from: 210129163129492111, to: 'My Chat Room', cmd: 'room/send', payload: 'Some message to room clients.'}
      const roomName = to;
      dataTransfer.sendRoom(msg, socket, roomName); }


    /*** route command ***/
    else if (cmd === 'route') {
      // {id: 210129163129492000, from: 210129163129492111, to: 0, cmd: 'route', payload: {uri: 'shop/login', body: {username:'mark', password:'thG5$#w'}}}
      eventEmitter.emit('route', msg, socket, dataTransfer, socketStorage, eventEmitter); }


    /*** info commands ***/
    else if (cmd === 'info/socket/id') {
      // {id: 210129163129492000, from: 210129163129492111, to: 210129163129492111, cmd: 'info/socket/id'}
      msg.payload = socket.extension.id;
      socket.extension.sendSelf(msg); }

    else if (cmd === 'info/socket/list') {
      // {id: 210129163129492000, from: 210129163129492111, to: 210129163129492111, cmd: 'info/socket/list'}
      const sockets = await socketStorage.find();
      const socket_ids_nicks = sockets.map(socket => { return {id: socket.extension.id, nickname: socket.extension.nickname}; });
      msg.payload = socket_ids_nicks; // {id:number, nickname:string}
      socket.extension.sendSelf(msg); }

    else if (cmd === 'info/room/list') {
      // {id: 210129163129492000, from: 210129163129492111, to: 210129163129492111, cmd: 'info/room/list'}
      const rooms = await socketStorage.roomList();
      msg.payload = rooms;
      socket.extension.sendSelf(msg); }

    else if (cmd === 'info/room/listmy') {
      // {id: 210129163129492000, from: 210129163129492111, to: 210129163129492111, cmd: 'info/room/listmy'}
      const rooms = await socketStorage.roomListOf(msg.from);
      msg.payload = rooms;
      socket.extension.sendSelf(msg); }

  }



  /******* HELPERS ********/
  /**
   * Helper to test msg properties.
   * @param {string[]} msgObjProperties - propewrties of the "msg" object
   */
  _testFields(msgObjProperties) {
    const allowedFields = ['id', 'from', 'to', 'cmd', 'payload'];
    const requiredFields = ['id', 'from', 'to', 'cmd'];
    let tf = true;

    // check if every of the msg properties are in allowed fields
    for (const prop of msgObjProperties) {
      if (allowedFields.indexOf(prop) === -1) { tf = false; break; }
    }

    // check if every of required fields is present
    for (const requiredField of requiredFields) {
      if(msgObjProperties.indexOf(requiredField) === -1) { tf = false; break; }
    }

    return tf;
  }


}



module.exports = new JsonRWS();

},{}]},{},[1]);

//# sourceMappingURL=client13jsonRWS.js.map
