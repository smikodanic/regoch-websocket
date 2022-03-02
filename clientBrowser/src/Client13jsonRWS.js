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
    this.wcOpts = wcOpts; // websocket client options
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
        this.debugger('Received::', msgSTR);

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
   * @param {number|number[]} to - final destination: 210201164339351900
   * @param {string} cmd - command
   * @param {any} payload - message payload
   * @return {object} message object {id, from, to, cmd, payload}
   */
  async carryOut(to, cmd, payload) {
    const id = helper.generateID(); // the message ID
    const from = this.socketID; // the sender ID
    if (!to) { to = '0'; } // server ID is 0
    const msgObj = { id, from, to, cmd, payload };
    const msg = jsonRWS.outgoing(msgObj);
    this.debugger('Sent::', msg);

    // the message must be defined and client must be connected to the server
    if (!!msg && !!this.wsocket && this.wsocket.readyState === 1) {
      await new Promise(r => setTimeout(r, 0));
      await this.wsocket.send(msg);
      return msg;
    } else {
      throw new Error('The message is not defined or the client is disconnected.');
    }
  }


  /**
   * Send message (payload) to one client.
   * @param {number} to - 210201164339351900
   * @param {any} msg - message sent to the client
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
   */
  async send(to, msg) {
    const cmd = 'socket/send';
    const payload = msg;
    await this.carryOut(to, cmd, payload);
  }


  /**
   * Send message (payload) to all clients except the sender.
   * @param {any} msg - message sent to the clients
   */
  async broadcast(msg) {
    const to = '0';
    const cmd = 'socket/broadcast';
    const payload = msg;
    await this.carryOut(to, cmd, payload);
  }

  /**
   * Send message (payload) to all clients and the sender.
   * @param {any} msg - message sent to the clients
   */
  async sendAll(msg) {
    const to = '0';
    const cmd = 'socket/sendall';
    const payload = msg;
    await this.carryOut(to, cmd, payload);
  }



  /******************************* QUESTIONS ******************************/
  /*** Send a question to the websocket server and wait for the answer. ***/

  /**
   * Send question and expect the answer.
   * @param {string} cmd - command
   * @returns {Promise<object>}
   */
  question(cmd) {
    // send the question
    const to = this.socketID;
    const payload = undefined;
    this.carryOut(to, cmd, payload);

    // receive the answer
    return new Promise(async (resolve, reject) => {
      this.once('question', msg => { if (msg.cmd === cmd) { resolve(msg); } });
      await helper.sleep(this.wcOpts.questionTimeout);
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
   */
  async roomEnter(roomName) {
    const to = '0';
    const cmd = 'room/enter';
    const payload = roomName;
    await this.carryOut(to, cmd, payload);
  }

  /**
   * Unsubscribe from the room.
   * @param {string} roomName
   */
  async roomExit(roomName) {
    const to = '0';
    const cmd = 'room/exit';
    const payload = roomName;
    await this.carryOut(to, cmd, payload);
  }

  /**
   * Unsubscribe from all rooms.
   */
  async roomExitAll() {
    const to = '0';
    const cmd = 'room/exitall';
    const payload = undefined;
    await this.carryOut(to, cmd, payload);
  }

  /**
   * Send message to the room.
   * @param {string} roomName
   * @param {any} msg
   */
  async roomSend(roomName, msg) {
    const to = roomName;
    const cmd = 'room/send';
    const payload = msg;
    await this.carryOut(to, cmd, payload);
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
    await this.carryOut(to, cmd, payload);
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




  /******* OTHER ********/
  /**
   * Debugger. Use it as this.debug(var1, var2, var3)
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
