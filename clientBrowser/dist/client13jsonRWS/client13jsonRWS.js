/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 375:
/***/ ((module) => {

class Helper {

  /**
   * Create unique id. It's combination of timestamp and random number 'r'
   * in format: YYYYMMDDHHmmssSSSrrr ---> YYYY year, MM month, DD day, HH hour, mm min, ss sec, SSS ms, rrr 3 random digits
   * 20 digits in total, for example: '20210129163129492100'
   * @returns {string}
   */
  generateID() {
    const rnd = Math.random().toString();
    const rrr = rnd.replace('0.', '').substring(0, 3);

    const timestamp = new Date(); // UTC (Greenwich time)
    const tsp = timestamp.toISOString()
      .replace(/\-/g, '')
      .replace(/\:/g, '')
      .replace('T', '')
      .replace('Z', '')
      .replace('.', '');

    const id = tsp + rrr;
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


  /**
   * Print buffer in nice table of bytes.
   * @param {Buffer} buff - bytes
   * @param {number} perRow - how many bytes present per row (per line)
   */
  tableOfBytes(buff, perRow) {
    let bytes = buff.toString('hex').match(/../g);

    // add new line
    bytes = bytes.map((byte, key) => {
      if (key === 0) { byte = '\n ' + byte; }
      if ((key + 1) % perRow === 0) { byte += '\n'; }
      return byte;
    });

    const str = bytes.join(' ');
    return str;
  }


}




module.exports = new Helper();


/***/ }),

/***/ 98:
/***/ ((module) => {

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
 *  d) The data type definition of the sent object: {id:string, from:string, to:string, cmd:string, payload?:any}
 */


class JsonRWS {

  constructor() {
    this.delimiter = '\u0003';  // end-of-text unicode character
  }

  /*********** INCOMING MESSAGES ***********/
  /**
   * Execute the jsonRWS subprotocol for incoming messages. Filter and map incoming messages.
   * 1. Test if the message has valid "jsonRWS" format {id:string, from:string, to:string|string[], cmd:string, payload?:any}.
   * 2. Convert the message from string to object.
   * @param {string} msgSTR -incoming message
   * @returns {{id:string, from:string, to:numstringber|string[], cmd:string, payload?:any}}
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
   * 1. Test if the message has valid "jsonRWS" format {id:string, from:string, to:string|string[], cmd:string, payload:any}.
   * 2. Convert the message from object to string.
   * @param {{id:string, from:string, to:string|string[], cmd:string, payload?:any}} msg - outgoing message
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
  async processing(msg, socket, dataTransfer, socketStorage, eventEmitter) {
    const id = msg.id;
    const from = msg.from;
    const to = msg.to;
    const cmd = msg.cmd;
    const payload = msg.payload;


    /*** socket commands ***/
    if (cmd === 'socket/sendone') {
      // {id: '20210129163129492000', from: '20210129163129492111', to: '20210201164339351900', cmd: 'socket/sendone', payload: 'Some message to another client'}
      const id = msg.to;
      const toSocket = await socketStorage.findOne({ id });
      await dataTransfer.sendOne(msg, toSocket);
    }

    else if (cmd === 'socket/send') {
      // {id: '20210129163129492000', from: '20210129163129492111', to: ['20210201164339351900', '210201164339351901'], cmd: 'socket/send', payload: 'Some message to another client(s)'}
      const socketIDs = to.map(socketID => socketID); // convert to numbers
      const sockets = await socketStorage.find({ id: { $in: socketIDs } });
      await dataTransfer.send(msg, sockets);
    }

    else if (cmd === 'socket/broadcast') {
      // {id: '20210129163129492000', from: '20210129163129492111', to: '0', cmd: 'socket/broadcast', payload: 'Some message to all clients except the sender'}
      await dataTransfer.broadcast(msg, socket);
    }

    else if (cmd === 'socket/sendall') {
      // {id: '20210129163129492000', from: '20210129163129492111', to: '0', cmd: 'socket/sendall', payload: 'Some message to all clients and the sender'}
      await dataTransfer.sendAll(msg);
    }

    else if (cmd === 'socket/nick') {
      // {id: '20210129163129492000', from: '20210129163129492111', to: '0', cmd: 'socket/nick', payload: 'Peter Pan'}
      const nickname = msg.payload;
      try {
        await socketStorage.setNick(socket, nickname);
        msg.payload = socket.extension.nickname;
      } catch (err) {
        msg.cmd = 'error';
        msg.payload = err.message;
      }
      socket.extension.sendSelf(msg);
    }


    /*** room commands ***/
    else if (cmd === 'room/enter') {
      // {id: '20210129163129492000', from: '20210129163129492111', to: '0', cmd: 'room/enter', payload: 'My Chat Room'}
      const roomName = payload;
      socketStorage.roomEnter(socket, roomName);
      msg.payload = `Entered in the room '${roomName}'`;
      socket.extension.sendSelf(msg);
    }

    else if (cmd === 'room/exit') {
      // {id: '20210129163129492000', from: '20210129163129492111', to: '0', cmd: 'room/exit', payload: 'My Chat Room'}
      const roomName = payload;
      socketStorage.roomExit(socket, payload);
      msg.payload = `Exited from the room '${roomName}'`;
      socket.extension.sendSelf(msg);
    }

    else if (cmd === 'room/exitall') {
      // {id: '20210129163129492000', from: '20210129163129492111', to: '0', cmd: 'room/exitall'}
      socketStorage.roomExitAll(socket);
      msg.payload = 'Exited from all rooms';
      socket.extension.sendSelf(msg);
    }

    else if (cmd === 'room/send') {
      // {id: '20210129163129492000', from: '20210129163129492111', to: 'My Chat Room', cmd: 'room/send', payload: 'Some message to room clients.'}
      const roomName = to;
      await dataTransfer.sendRoom(msg, socket, roomName);
    }


    /*** route command ***/
    else if (cmd === 'route') {
      // {id: '20210129163129492000', from: '20210129163129492111', to: '0', cmd: 'route', payload: {uri: 'shop/login', body: {username:'mark', password:'thG5$#w'}}}
      eventEmitter.emit('route', msg, socket, dataTransfer, socketStorage, eventEmitter);
    }


    /*** question commands ***/
    else if (cmd === 'question/socket/id') {
      // {id: '20210129163129492000', from: '20210129163129492111', to: '20210129163129492111', cmd: 'question/socket/id'}
      msg.payload = socket.extension.id;
      socket.extension.sendSelf(msg);
    }

    else if (cmd === 'question/socket/list') {
      // {id: '20210129163129492000', from: '20210129163129492111', to: '20210129163129492111', cmd: 'question/socket/list'}
      const sockets = await socketStorage.find();
      const socket_ids_nicks = sockets.map(socket => { return { id: socket.extension.id, nickname: socket.extension.nickname }; });
      msg.payload = socket_ids_nicks; // {id:string, nickname:string}
      socket.extension.sendSelf(msg);
    }

    else if (cmd === 'question/room/list') {
      // {id: '20210129163129492000', from: '20210129163129492111', to: '20210129163129492111', cmd: 'question/room/list'}
      const rooms = await socketStorage.roomList();
      msg.payload = rooms;
      socket.extension.sendSelf(msg);
    }

    else if (cmd === 'question/room/listmy') {
      // {id: '20210129163129492000', from: '20210129163129492111', to: '20210129163129492111', cmd: 'question/room/listmy'}
      const rooms = await socketStorage.roomListOf(msg.from);
      msg.payload = rooms;
      socket.extension.sendSelf(msg);
    }

  }



  /******* HELPERS ********/
  /**
   * Helper to test msg properties.
   * @param {string[]} msgObjProperties - properties of the "msg" object
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
      if (msgObjProperties.indexOf(requiredField) === -1) { tf = false; break; }
    }

    return tf;
  }


}



module.exports = new JsonRWS();


/***/ }),

/***/ 554:
/***/ ((module) => {

/**
 * Subprotocol name: raw
 * HTTP header: "Sec-WebSocket-Protocol": "raw"
 *
 * Subprotocol description:
 *  The simplest subprotocol.
 */


class Raw {

  constructor() {
    this.delimiter = '\u0003'; // end-of-text unicode character
  }

  /*********** INCOMING MESSAGES ***********/
  /**
   * Execute the subprotocol for incoming messages.
   * @param {string} msgSTR -incoming message
   * @returns {string}
   */
  incoming(msgSTR) {
    msgSTR = msgSTR.replace(this.delimiter, ''); // remove delimiter
    const msg = msgSTR;
    return msg;
  }



  /*********** OUTGOING MESSAGES ***********/
  /**
   * Execute the subprotocol for outgoing messages.
   * @param {any} msg - outgoing message
   * @returns {string}
   */
  outgoing(msg) {
    let msgSTR = msg;
    if (typeof msg === 'object') { msgSTR = JSON.stringify(msg); }
    msgSTR += this.delimiter;
    return msgSTR;
  }



  /*********** PROCESS MESSAGES ***********/
  /**
   * Process client messages internally.
   * @returns {void}
   */
  async process() { }


}


module.exports = new Raw();


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
(() => {
"use strict";

// UNUSED EXPORTS: default

;// CONCATENATED MODULE: ./src/auxillary/eventEmitter.js
/**
 * The EventEmitter based on window CustomEvent. Inspired by the NodeJS event lib.
 */
class EventEmitter {

  constructor() {
    this.activeOns = []; // [{eventName:string, listener:Function, listenerWindow:Function}]
  }


  /**
   * Create and emit the event
   * @param {string} eventName - event name, for example: 'pushstate'
   * @param {any} detail - event argument
   * @returns {void}
   */
  emit(eventName, detail = {}) {
    const evt = new CustomEvent(eventName, { detail });
    window.dispatchEvent(evt);
  }


  /**
   * Listen for the event
   * @param {string} eventName - event name, for example: 'pushstate'
   * @param {Function} listener - callback function, for example msg => {...}
   * @returns {void}
   */
  on(eventName, listener) {
    const listenerWindow = event => {
      const detailValues = this._getDetailValues(event.detail);
      listener.call(null, ...detailValues);
    };

    this._removeOne(eventName, listener);
    this.activeOns.push({ eventName, listener, listenerWindow });
    window.addEventListener(eventName, listenerWindow);
  }


  /**
   * Listen for the event only once
   * @param {string} eventName - event name, for example: 'pushstate'
   * @param {Function} listener - callback function
   * @returns {void}
   */
  once(eventName, listener) {
    const listenerWindow = event => {
      const detailValues = this._getDetailValues(event.detail);
      listener.call(null, ...detailValues);

      this._removeOne(eventName, listener, listenerWindow);
    };

    window.addEventListener(eventName, listenerWindow, { once: true });
  }


  /**
   * Stop listening the event for specific listener.
   * @param {string} eventName - event name, for example: 'pushstate'
   * @param {Function} listener - callback function, for example msg => {...}
   * @returns {void}
   */
  off(eventName, listener) {
    this._removeOne(eventName, listener);
  }


  /**
   * Stop listening the event for all listeners defined with on().
   * For example eventEmitter.on('msg', fja1) & eventEmitter.on('msg', fja2) then eventEmitter.off('msg') will remove fja1 and fja2 listeners.
   * @param {string} eventName - event name, for example: 'pushstate'
   * @returns {void}
   */
  offAll(eventName) {
    let ind = 0;
    for (const activeOn of this.activeOns) {
      if (activeOn.eventName === eventName) {
        window.removeEventListener(activeOn.eventName, activeOn.listenerWindow);
        this.activeOns.splice(ind, 1);
      }
      ind++;
    }
  }


  /**
   * Get all active listeners.
   * @returns {{eventName:string, listener:Function, listenerWindow:Function}[]}
   */
  getListeners() {
    return { ...this.activeOns };
  }





  /*** PRIVATES ***/
  /**
   * Remove a listener from window and this.activeOns
   */
  _removeOne(eventName, listener) {
    if (!listener) { throw new Error('eventEmitter._removeOne Error: listener is not defined'); }
    let ind = 0;
    for (const activeOn of this.activeOns) {
      if (activeOn.eventName === eventName && activeOn.listener.toString() === listener.toString()) {
        window.removeEventListener(activeOn.eventName, activeOn.listenerWindow);
        this.activeOns.splice(ind, 1);
      }
      ind++;
    }
  }


  /**
   * Get values from the event.detail object
   * @param {object} detail - event.detail object, for example {msg, msgSTR}
   * @returns {Array} - an array of the detail values (selected by the listener arguments)
   */
  _getDetailValues(detail) {
    const detailValues = !!detail ? Object.values(detail) : [];
    return detailValues;
  }





}


/* harmony default export */ const eventEmitter = (new EventEmitter());

// EXTERNAL MODULE: ../lib/subprotocol/jsonRWS.js
var jsonRWS = __webpack_require__(98);
// EXTERNAL MODULE: ../lib/subprotocol/raw.js
var raw = __webpack_require__(554);
// EXTERNAL MODULE: ../lib/helper.js
var helper = __webpack_require__(375);
;// CONCATENATED MODULE: ./src/Client13jsonRWS.js
/**
 * Websocket Client for Browser
 * - websocket version: 13
 * - subprotocol: jsonRWS
 */






class Client13jsonRWS {

  /**
   * @param {{wsURL:string, questionTimeout:number, reconnectAttempts:number, reconnectDelay:number, subprotocols:string[], debug:boolean}} wcOpts - websocket client options
   */
  constructor(wcOpts) {
    // websocket client default options
    this.wcOpts = wcOpts;
    if (!wcOpts.wsURL || !/^ws:\/\//.test(wcOpts.wsURL)) { throw new Error('Bad websocket URL'); } // HTTP request timeout i.e. websocket connect timeout (when internet is down or on localhost $ sudo ip link set lo down)
    if (!wcOpts.connectTimeout) { this.wcOpts.connectTimeout = 8000; } // HTTP request timeout i.e. websocket connect timeout (when internet is down or on localhost $ sudo ip link set lo down)
    if (wcOpts.reconnectAttempts === undefined) { this.wcOpts.reconnectAttempts = 6; } // how many times to try to reconnect when connection with the server is lost
    if (wcOpts.reconnectDelay === undefined) { this.wcOpts.reconnectDelay = 5000; } // delay between reconnections, default is 3 seconds
    if (wcOpts.questionTimeout === undefined) { this.wcOpts.questionTimeout = 13000; } // how many mss to wait for the answer when question is sent
    if (!wcOpts.subprotocols) { this.wcOpts.subprotocols = ['jsonRWS', 'raw']; } // list of the supported subprotocols
    // if (wcOpts.autodelayFactor === undefined) { this.wcOpts.autodelayFactor = 500; } // factor for preventing DDoS, bigger then sending messages works slower
    if (!wcOpts.debug) { this.wcOpts.debug = false; }
    if (!wcOpts.debug_DataParser) { this.wcOpts.debug_DataParser = false; } // ws message level debugging

    this.wsocket; // Websocket instance https://developer.mozilla.org/en-US/docs/Web/API/WebSocket
    this.socketID; // socket ID number, for example: 20210214082949459100
    this.attempt = 1; // reconnect attempt counter
    this.subprotocolLib;
  }


  /************* CLIENT CONNECTOR ************/
  /**
   * Connect to the websocket server.
   * @returns {Promise<WebSocket>}
   */
  connect() {
    this.socketID = helper.generateID();
    let wsURL = this.wcOpts.wsURL; // websocket URL: ws://localhost:3211/something?authkey=TRTmrt
    if (/\?[a-zA-Z0-9]/.test(wsURL)) { wsURL += `&socketID=${this.socketID}`; }
    else { wsURL += `socketID=${this.socketID}`; }

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
   */
  onEvents() {
    this.wsocket.onopen = async (openEvt) => {
      console.log(`WS Connection opened -- socketID: ${this.socketID}, subprotocol(handshaked): "${this.wsocket.protocol}"`);

      this.onMessage();

      this.attempt = 1;

      // define subprotocol library
      if (!!this.wsocket && this.wsocket.protocol === 'raw') { this.subprotocolLib = raw; }
      else if (!!this.wsocket && this.wsocket.protocol === 'jsonRWS') { this.subprotocolLib = jsonRWS; }
      else { this.subprotocolLib = raw; }

      eventEmitter.emit('connected');
    };


    this.wsocket.onclose = (closeEvt) => {
      console.log('WS Connection closed');
      delete this.wsocket; // Websocket instance https://developer.mozilla.org/en-US/docs/Web/API/WebSocket
      delete this.socketID;
      this.reconnect();
      eventEmitter.emit('disconnected');
    };


    this.wsocket.onerror = (errorEvt) => {
      // console.error(errorEvt);
    };
  }



  /************* RECEIVERS ************/
  /**
   * Receive the message as buffer and convert it in the appropriate subprotocol format.
   * If toEmit is true push it to eventEmitter as 'message' event.
   */
  onMessage() {
    if (!this.wsocket) { return; }
    const subprotocol = this.wsocket.protocol; // jsonRWS || raw

    this.wsocket.addEventListener('message', event => {
      try {
        const msgSTR = event.data;
        this._debugger('Received::', msgSTR);

        /**
           * Test if the message contains the delimiter.
           * Delimiter is important because the network is splitting large message in the chunks of data so we need to know when the message reached the end and new message is starting.
           * A TCP network chunk is around 1500 bytes. To check it use linux command: $ ifconfig | grep -i MTU
           * Related terms are TCP MTU (Maximum Transmission Unit) and TCP MSS (Maximum Segment Size) --> (MSS = MTU - TCPHdrLen - IPHdrLen)
           */
        const delimiter_reg = new RegExp(this.subprotocolLib.delimiter);
        if (!delimiter_reg.test(msgSTR)) { return; }

        const msg = this.subprotocolLib.incoming(msgSTR);

        // dispatch
        const detail = { msg, msgSTR };
        if (msg.cmd === 'route' && subprotocol === 'jsonRWS') { eventEmitter.emit('route', detail); }
        else if (msg.cmd === 'server-error' && subprotocol === 'jsonRWS') { this.blockReconnect(); eventEmitter.emit('server-error', detail); }
        else if (/^question\//.test(msg.cmd) && subprotocol === 'jsonRWS') { eventEmitter.emit('question', detail); }
        else { eventEmitter.emit('message', detail); }

      } catch (err) {
        eventEmitter.emit('message-error', err);
      }
    });

  }


  /************* SENDERS ************/
  /**
   * Send message to the websocket server if the connection is not closed (https://developer.mozilla.org/en-US/docs/Web/API/WebSocket/readyState).
   * @param {string|string[]} to - final destination: 210201164339351900
   * @param {string} cmd - command
   * @param {any} payload - message payload
   * @return {object} full websocket message object {id, from, to, cmd, payload}
   */
  async carryOut(to, cmd, payload) {
    const id = helper.generateID(); // the message ID
    const from = this.socketID; // the sender ID

    // test if "to" is string
    if (!Array.isArray(to) && typeof to !== 'string') {
      throw new Error('ERRcarryOut: "to" argument must be string');
    } else if (Array.isArray(to)) {
      for (const t of to) {
        if (typeof t !== 'string') { throw new Error('ERRcarryOut: "to" argument must be string'); }
      }
    }

    const msg = { id, from, to, cmd, payload };
    const msgSTR = jsonRWS.outgoing(msg);
    await this.socketWrite(msgSTR);

    this._debugger('Sent::', msgSTR);

    return msg;
  }


  /**
   * Check if socket is writable and not closed (https://developer.mozilla.org/en-US/docs/Web/API/WebSocket/readyState)
   * and send message in string format.
   * @param {Buffer} msgSTR - message to server
   */
  async socketWrite(msgSTR) {
    await new Promise(r => setTimeout(r, 0));
    if (!!this.wsocket && this.wsocket.readyState === 1) { this.wsocket.send(msgSTR); }
    else { throw new Error('Socket is not writeble or doesn\'t exist'); }
  }


  /**
   * Send message (payload) to one client.
   * @param {string} to - 210201164339351900
   * @param {any} payload - message sent to the client
   * @return {object} full websocket message object {id, from, to, cmd, payload}
   */
  async sendOne(to, payload) {
    const cmd = 'socket/sendone';
    return await this.carryOut(to, cmd, payload);
  }


  /**
   * Send message (payload) to one or more clients.
   * @param {string[]} to - [210205081923171300, 210205082042463230]
   * @param {any} payload - message sent to the clients
   * @return {object} full websocket message object {id, from, to, cmd, payload}
   */
  async send(to, payload) {
    const cmd = 'socket/send';
    return await this.carryOut(to, cmd, payload);
  }


  /**
   * Send message (payload) to all clients except the sender.
   * @param {any} payload - message sent to the clients
   * @return {object} full websocket message object {id, from, to, cmd, payload}
   */
  async broadcast(payload) {
    const to = '0';
    const cmd = 'socket/broadcast';
    return await this.carryOut(to, cmd, payload);
  }

  /**
   * Send message (payload) to all clients and the sender.
   * @param {any} payload - message sent to the clients
   * @return {object} full websocket message object {id, from, to, cmd, payload}
   */
  async sendAll(payload) {
    const to = '0';
    const cmd = 'socket/sendall';
    return await this.carryOut(to, cmd, payload);
  }



  /******************************* QUESTIONS ******************************/
  /*** Send a question to the websocket server and wait for the answer. ***/

  /**
   * Send question and expect the answer.
   * @param {string} cmd - command
   * @returns {Promise<object>}
   */
  async question(cmd) {
    // send the question
    const to = this.socketID;
    const payload = undefined;
    await this.carryOut(to, cmd, payload);

    // receive the answer
    return new Promise(async (resolve, reject) => {
      const listener = msg => { if (msg.cmd === cmd) { resolve(msg); } };
      this.once('question', listener);
      await helper.sleep(this.wcOpts.questionTimeout);
      this.off('question', listener);
      reject(new Error(`No answer for the question: ${cmd}`));
    });
  }


  /**
   * Send question about my socket ID.
   * @returns {Promise<number>}
   */
  async questionSocketId() {
    const answer = await this.question('question/socket/id');
    this.socketID = answer.payload;
    return this.socketID;
  }

  /**
   * Send question about all socket IDs connected to the server.
   * @returns {Promise<number[]>}
   */
  async questionSocketList() {
    const answer = await this.question('question/socket/list');
    return answer.payload;
  }

  /**
   * Send question about all rooms in the server.
   * @returns {Promise<{name:string, socketIds:number[]}[]>}
   */
  async questionRoomList() {
    const answer = await this.question('question/room/list');
    return answer.payload;
  }

  /**
   * Send question about all rooms where the client was entered.
   * @returns {Promise<{name:string, socketIds:number[]}[]>}
   */
  async questionRoomListmy() {
    const answer = await this.question(`question/room/listmy`);
    return answer.payload;
  }




  /************* ROOMS ************/
  /**
   * Subscribe in the room.
   * @param {string} roomName
   * @return {object} full websocket message object {id, from, to, cmd, payload}
   */
  async roomEnter(roomName) {
    const to = '0';
    const cmd = 'room/enter';
    const payload = roomName;
    return await this.carryOut(to, cmd, payload);
  }

  /**
   * Unsubscribe from the room.
   * @param {string} roomName
   * @return {object} full websocket message object {id, from, to, cmd, payload}
   */
  async roomExit(roomName) {
    const to = '0';
    const cmd = 'room/exit';
    const payload = roomName;
    return await this.carryOut(to, cmd, payload);
  }

  /**
   * Unsubscribe from all rooms.
   * @return {object} full websocket message object {id, from, to, cmd, payload}
   */
  async roomExitAll() {
    const to = '0';
    const cmd = 'room/exitall';
    const payload = undefined;
    return await this.carryOut(to, cmd, payload);
  }

  /**
   * Send message to all clients in the specific room excluding the client who sent the message.
   * @param {string} roomName
   * @param {any} payload
   * @return {object} full websocket message object {id, from, to, cmd, payload}
   */
  async roomSend(roomName, payload) {
    const to = roomName;
    const cmd = 'room/send';
    return await this.carryOut(to, cmd, payload);
  }




  /********* MISC *********/
  /**
   * Setup a nick name.
   * @param {string} nickname - nick name
   */
  async setNick(nickname) {
    const to = '0';
    const cmd = 'socket/nick';
    const payload = nickname;
    return await this.carryOut(to, cmd, payload);
  }


  /**
   * Send route command.
   * @param {string} uri - route URI, for example /shop/product/55
   * @param {any} body - body
   * @return {object} message object {id, from, to, cmd, payload}
   */
  async route(uri, body) {
    const to = '0';
    const cmd = 'route';
    const payload = { uri, body };
    return await this.carryOut(to, cmd, payload);
  }




  /*********** LISTENERS ************/
  /**
   * Listen the event.
   * @param {string} eventName - event name: 'connected', 'disconnected', 'message', 'message-error', 'route', 'question', 'server-error'
   * @param {Function} listener - callback function, for example: (msg, msgSTR) => { console.log(msgSTR); }
   */
  on(eventName, listener) {
    eventEmitter.on(eventName, listener);
  }

  /**
   * Listen the event only one time.
   * @param {string} eventName - event name: 'connected', 'disconnected', 'message', 'message-error', 'route', 'question', 'server-error'
   * @param {Function} listener - callback function, for example: (msg, msgSTR) => { console.log(msgSTR); }
   */
  once(eventName, listener) {
    return eventEmitter.once(eventName, listener);
  }

  /**
   * Stop listening the event.
   * @param {string} eventName - event name: 'connected', 'disconnected', 'message', 'message-error', 'route', 'question', 'server-error'
   * @param {Function} listener - callback function, for example: (msg, msgSTR) => { console.log(msgSTR); }
   */
  off(eventName, listener) {
    return eventEmitter.off(eventName, listener);
  }

  /**
   * Stop listening all events.
   * @param {string} eventName - event name: 'connected', 'disconnected', 'message', 'message-error', 'route', 'question', 'server-error'
   */
  offAll(eventName) {
    return eventEmitter.offAll(eventName);
  }




  /******* AUX ********/
  /**
   * Debugger. Use it as this._debugger(var1, var2, var3)
   */
  _debugger(...textParts) {
    const text = textParts.join('');
    if (this.wcOpts.debug) { console.log(text); }
  }



}





/* harmony default export */ const src_Client13jsonRWS = ((/* unused pure expression or super */ null && (Client13jsonRWS)));
window.regochWebsocket = { Client13jsonRWS };


})();

/******/ })()
;
//# sourceMappingURL=client13jsonRWS.js.map