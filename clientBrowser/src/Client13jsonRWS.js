/**
 * Websocket Client for Browser
 * - websocket version: 13
 * - subprotocol: jsonRWS
 */
const eventEmitter = require('./auxillary/eventEmitter');
const jsonRWS = require('../../lib/subprotocol/jsonRWS');
const raw = require('../../lib/subprotocol/raw');
const helper = require('../../lib/helper');


class Client13jsonRWS {

  /**
   * @param {{wsURL:string, questionTimeout:number, reconnectAttempts:number, reconnectDelay:number, subprotocols:string[], debug:boolean}} wcOpts - websocket client options
   */
  constructor(wcOpts) {
    // websocket client default options
    this.wcOpts = wcOpts;
    if (!wcOpts.wsURL || !/^ws:\/\//.test(wcOpts.wsURL)) { throw new Error('Bad websocket URL'); } // HTTP request timeout i.e. websocket connect timeout (when internet is down or on localhost $ sudo ip link set lo down)
    if (!wcOpts.connectTimeout) { this.wcOpts.connectTimeout = 8000; } // HTTP request timeout i.e. websocket connect timeout (when internet is down or on localhost $ sudo ip link set lo down)
    if (!wcOpts.reconnectAttempts) { this.wcOpts.reconnectAttempts = 5; } // how many times to try to reconnect when connection with the server is lost
    if (!wcOpts.reconnectDelay) { this.wcOpts.reconnectDelay = 3000; } // delay between reconnections, default is 3 seconds
    if (!wcOpts.questionTimeout) { this.wcOpts.questionTimeout = 3000; } // how many mss to wait for the answer when question is sent
    if (!wcOpts.subprotocols) { this.wcOpts.subprotocols = ['jsonRWS', 'raw']; } // list of the supported subprotocols
    if (!wcOpts.autodelayFactor) { this.wcOpts.autodelayFactor = 500; } // factor for preventing DDoS, bigger then sending messages works slower
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




// NodeJS (browserify)
if (typeof module !== 'undefined') {
  module.exports = Client13jsonRWS;
}

// Browser
if (typeof window !== 'undefined') {
  window.regochWebsocket = { Client13jsonRWS };
}
