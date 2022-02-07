/**
 * Websocket Client for NodeJS
 * - websocket version: 13
 * - subprotocol: jsonRWS
 */
const http = require('http');
const urlNode = require('url');
const crypto = require('crypto');
const { EventEmitter } = require('events');
const package_json = require('../package.json');
const { raw, jsonRWS, websocket13, helper, StringExt } = require('../lib');
const DataParser = websocket13.DataParser;
const handshake = websocket13.handshake;
new StringExt();


class Client13jsonRWS extends DataParser {

  /**
   * @param {{wsURL:string, questionTimeout:number, reconnectAttempts:number, reconnectDelay:number, subprotocols:string[], debug:boolean, debug_DataParser:boolean}} wcOpts - websocket client options
   */
  constructor(wcOpts) {
    super(wcOpts.debug_DataParser);

    this.wcOpts = wcOpts; // websocket client options
    this.socket; // TCP Socket https://nodejs.org/api/net.html#net_class_net_socket
    this.socketID; // socket ID number, for example: 210214082949459100
    this.attempt = 1; // reconnect attempt counter
    this.subprotocolLib;

    this.resHeaders; // onUpgrade response headers
    this.wsKey; // the value of 'Sec-Websocket-Key' header
    this.clientRequest; // client HTTP request https://nodejs.org/api/http.html#http_class_http_clientrequest

    this.eventEmitter = new EventEmitter();
    this.eventEmitter.setMaxListeners(8);

    this.onProcessEvents();
  }



  /************* CLIENT CONNECTOR ************/
  /**
   * Connect to the websocket server.
   * @returns {Promise<Socket>}
   */
  connect() {
    // http.request() options https://nodejs.org/api/http.html#http_http_request_url_options_callback
    const wsURL = this.wcOpts.wsURL; // websocket URL: ws://localhost:3211/something?authkey=TRTmrt
    const httpURL = wsURL.replace('wss://', 'https://').replace('ws://', 'http://');
    const urlObj = new urlNode.URL(httpURL);
    const hostname = urlObj.hostname;
    const port = urlObj.port;
    let path = !!urlObj.search ? urlObj.pathname + urlObj.search : urlObj.pathname; // /?authkey=TRTmrt

    this.socketID = helper.generateID();
    if (/\?[a-zA-Z0-9]/.test(path)) { path += `&socketID=${this.socketID}`; }
    else { path += `socketID=${this.socketID}`; }

    // create hash
    const GUID = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11'; // Globally Unique Identifier (GUID)
    this.wsKey = crypto
      .createHash('sha1')
      .update(GUID)
      .digest('base64');

    // send HTTP request
    const requestOpts = {
      hostname,
      port,
      path,
      method: 'GET',
      headers: {
        'Connection': 'Upgrade',
        'Upgrade': 'websocket',
        'Sec-Websocket-Key': this.wsKey,
        'Sec-WebSocket-Version': 13,
        'Sec-WebSocket-Protocol': this.wcOpts.subprotocols.join(','),
        'Sec-WebSocket-Extensions': 'permessage-deflate; client_max_window_bits',
        'User-Agent': `@regoch/client-nodejs/${package_json.version}`
      }
    };
    this.clientRequest = http.request(requestOpts);
    this.clientRequest.on('error', err => { console.log(err); });
    this.clientRequest.end();


    // socket events
    this.onEvents();
    this.onUpgrade();

    // return socket as promise
    return new Promise(resolve => {
      // this.eventEmitter.removeAllListeners(); // not needed if once() is used
      this.eventEmitter.once('connected', () => { resolve(this.socket); });
      // console.log(`"connected" listeners: ${this.eventEmitter.listenerCount('connected')}`.cliBoja('yellow'));
    });
  }


  /**
   * Disconnect from the server by sending the "close" websocket frame which contains opcode 0x8.
   */
  disconnect() {
    this.blockReconnect();
    const closeBUF = this.ctrlClose(1);
    this.socketWrite(closeBUF);
    // this.socket.destroy();
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
      console.log(`Reconnect attempt #${this.attempt} of ${attempts} in ${delay}ms`.cliBoja('blue', 'bright'));
      this.attempt++;
    }
  }


  /**
   * Block reconnect usually after disconnect() method is used.
   */
  blockReconnect() {
    this.attempt = this.wcOpts.reconnectAttempts + 1;
  }




  /************ EVENTS **************/
  /**
   * Catch NodeJS process events and disconnect the client.
   * For example disconnect on crtl+c or on uncaught exception.
   */
  onProcessEvents() {
    process.on('cleanup', this.disconnect.bind(this));

    process.on('exit', () => {
      process.emit('cleanup');
    });

    // catch ctrl+c event and exit normally
    process.on('SIGINT', () => {
      process.exit(2);
    });

    // catch uncaught exceptions, log, then exit normally
    process.on('uncaughtException', (err) => {
      console.log(err.stack.cliBoja('red'));
      process.exit();
    });

    process.on('unhandledRejection', (err) => {
      console.log(err.stack.cliBoja('red'));
      process.exit();
    });
  }


  /**
   * Socket events. According to https://nodejs.org/api/net.html#net_class_net_socket.
   */
  onEvents() {
    this.clientRequest.on('socket', socket => {
      socket.on('connect', () => {
        console.log(`WS Connection opened`.cliBoja('blue'));
        this.attempt = 1;
      });


      // hadError determine if the socket is closed due to emitted 'error' event
      socket.on('close', hadError => {
        console.log(`WS Connection closed`.cliBoja('blue'));
        delete this.clientRequest;
        delete this.socket;
        delete this.socketID;
        // if (hadError) { this.reconnect(); } // prevent reconnection when socket is destroyed by the server
        this.reconnect();
        this.eventEmitter.emit('disconnected', hadError);
      });


      socket.on('error', (err) => {
        let errMsg = err.stack;
        if (/ECONNREFUSED/.test(err.stack)) {
          errMsg = `No connection to server ${this.wcOpts.wsURL}`;
        } else {
          this.wcOpts.reconnectAttempts = 0; // do not reconnect
          this.disconnect();
        }
        console.log(errMsg.cliBoja('red'));
      });


    });
  }



  /**
   * When "Connection: Upgrade" header is sent from the server.
   * https://nodejs.org/api/http.html#http_event_upgrade
   * Notice: 'res.socket' is same as 'socket'
   */
  onUpgrade() {
    this.clientRequest.on('upgrade', async (res, socket, firstDataChunk) => {
      // console.log('isSame:::', res.socket === socket); // true

      this.resHeaders = res.headers;
      /*res.headers:: {
          connection: 'Upgrade',
          upgrade: 'Websocket',
          'sec-websocket-accept': 'ZPDSZnqDz3a54R5E3LM8k9xMEkw=',
          'sec-websocket-version': '13',
          'sec-websocket-protocol': 'jsonRWS',
          'sec-websocket-server-version': '1.1.9',
          'sec-websocket-socketid': '210714060202279680',
          'sec-websocket-timeout': '604800000'
        }*/

      try {
        this.socket = socket;
        handshake.forClient(this.resHeaders, this.wsKey, this.wcOpts.subprotocols);
        // this.socketID = this.resHeaders['sec-websocket-socketid'];

        const subprotocol_header = this.resHeaders['sec-websocket-protocol']; // subprotocol supported by the server
        if (subprotocol_header === 'raw') { this.subprotocolLib = raw; }
        if (subprotocol_header === 'jsonRWS') { this.subprotocolLib = jsonRWS; }
        else { this.subprotocolLib = raw; }

        console.log(`
  - socketID: ${this.socketID},
  - subprotocol(handshaked): "${subprotocol_header}"
  - timeout(inactivity): ${this.resHeaders['sec-websocket-timeout']}ms
  - client(IP:PORT): ${socket.localAddress}:${socket.localPort} --> tcpdump -i any port ${socket.localPort}
        `.cliBoja('blue'));


        this.eventEmitter.emit('connected', socket);
        this.onMessage(); // emits the messages to eventEmitter
      } catch (err) {
        socket.emit('error', err);
      }
    });
  }


  /************* RECEIVERS ************/
  /**
   * Receive the message as buffer and convert it in the appropriate subprotocol format.
   * If toEmit is true push it to eventEmitter as 'message' event.
   */
  onMessage() {
    const subprotocol = this.resHeaders['sec-websocket-protocol']; // jsonRWS || raw
    let msgBUFarr = [];

    this.socket.on('data', msgBUFchunk => {
      try {
        msgBUFarr.push(msgBUFchunk);
        let msgBUF = Buffer.concat(msgBUFarr);
        let msgSTR = this.incoming(msgBUF); // convert buffer to string

        let msg;
        if (/OPCODE 0x/.test(msgSTR)) {
          this.opcodes(msgSTR);
        } else {
          /**
           * Test if the message contains the delimiter.
           * Delimiter is important because the network is splitting large message in the chunks of data so we need to know when the message reached the end and new message is starting.
           * A TCP network chunk is around 1500 bytes. To check it use linux command: $ ifconfig | grep -i MTU
           * Related terms are TCP MTU (Maximum Transmission Unit) and TCP MSS (Maximum Segment Size) --> (MSS = MTU - TCPHdrLen - IPHdrLen)
           */
          const delimiter_reg = new RegExp(this.subprotocolLib.delimiter);
          if (!delimiter_reg.test(msgSTR)) { return; }

          msg = this.subprotocolLib.incoming(msgSTR);
        }

        // dispatch
        if (msg.cmd === 'route' && subprotocol === 'jsonRWS') { this.eventEmitter.emit('route', msg, msgSTR, msgBUF); }
        else if (msg.cmd === 'server-error' && subprotocol === 'jsonRWS') { this.blockReconnect(); this.eventEmitter.emit('server-error', msg, msgSTR, msgBUF); }
        else if (/^question\//.test(msg.cmd) && subprotocol === 'jsonRWS') { this.eventEmitter.emit('question', msg, msgSTR, msgBUF); }
        else { this.eventEmitter.emit('message', msg, msgSTR, msgBUF); }

        // reset
        msgBUFarr = [];
        msgBUF = undefined;
        msgSTR = '';
        msg = null;

      } catch (err) {
        this.eventEmitter.emit('message-error', err);
      }
    });

  }


  /**
   * Parse websocket operation codes according to https://tools.ietf.org/html/rfc6455#section-5.1
   * @param {string} msgSTR - received message converted from buffer to string
   */
  opcodes(msgSTR) {
    if (msgSTR === 'OPCODE 0x8 CLOSE') {
      console.log('Opcode 0x8: Server closed the websocket connection'.cliBoja('yellow'));
      this.eventEmitter.emit('closed-by-server', msgSTR);
    } else if (msgSTR === 'OPCODE 0x9 PING') {
      this.debugger('Opcode 0x9: PING received');
      this.eventEmitter.emit('ping', msgSTR);
      this.pong(); // send PONG to the server
    } else if (msgSTR === 'OPCODE 0xA PONG') {
      this.debugger('Opcode 0xA: PONG received');
      this.eventEmitter.emit('pong', msgSTR);
    }
  }


  /************* SENDERS ************/
  /**
   * Send message to the websocket server after the message is processed by subprotocol and DataParser.
   * @param {number|number[]} to - final destination: 210201164339351900
   * @param {string} cmd - command
   * @param {any} payload - message payload
   * @return {object} message object {id, from, to, cmd, payload}
   */
  async carryOut(to, cmd, payload) {
    // DDoS protection (protect from sending too many messages in short period time)
    const autodelay = await new Promise((resolve, reject) => {
      let ms = 0;
      const startTime = process.hrtime(); // time when event loop tick strted
      process.nextTick(() => {
        const diff = process.hrtime(startTime); // the difference between time when event loop tick started and ended
        const ns = diff[0] * 1e9 + diff[1]; // nanoseconds
        ms = ns / 1000000; // miliseconds
        if (ms > 100) { resolve(-1); }
        if (ms > 10) { resolve(-2); }
        else { resolve(ms * 1000); }
      });
    });
    this.debugger(`autodelay: ${autodelay}`.cliBoja('yellow'));
    if (autodelay === -1) { this.debugger(`DDoS attack - disconnect the client`.cliBoja('red')); this.disconnect(); process.exit(); }
    if (autodelay === -2) { this.debugger(`DDoS attack - block message`.cliBoja('red')); return; }
    else { await new Promise(r => setTimeout(r, autodelay)); }

    const id = helper.generateID(); // the message ID
    const from = +this.socketID; // the sender ID
    if (!to) { to = 0; } // server ID is 0
    const msg = { id, from, to, cmd, payload };
    const msgSTR = jsonRWS.outgoing(msg);

    // the message must be defined and client must be connected to the server
    if (!!msgSTR) {
      const msgBUF = this.outgoing(msgSTR, 1);
      await this.socketWrite(msgBUF);
      return msg;
    } else {
      this.debugger('The message is not defined.');
    }
  }


  /**
   * Check if socket is writable and not closed (https://developer.mozilla.org/en-US/docs/Web/API/WebSocket/readyState)
   * and send message in buffer format.
   * @param {Buffer} msgBUF - message to server
   */
  async socketWrite(msgBUF) {
    if (!!this.socket && this.socket.writable && this.socket.readyState === 'open') {
      this.socket.write(msgBUF);
    } else {
      this.debugger('Socket is not writeble or doesn\'t exist');
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
    const to = 0;
    const cmd = 'socket/broadcast';
    const payload = msg;
    await this.carryOut(to, cmd, payload);
  }

  /**
   * Send message (payload) to all clients and the sender.
   * @param {any} msg - message sent to the clients
   */
  async sendAll(msg) {
    const to = 0;
    const cmd = 'socket/sendall';
    const payload = msg;
    await this.carryOut(to, cmd, payload);
  }


  /**
   * Send PING to server n times, every ms miliseconds
   * @param {number} ms - sending interval
   * @param {number} n - how many times to send ping (if 0 or undefined send infinitely)
   */
  async ping(ms, n) {
    if (!!n) {
      for (let i = 1; i <= n; i++) {
        const pingBUF = this.ctrlPing();
        await this.socketWrite(pingBUF);
        await helper.sleep(ms);
      }
    } else {
      const pingBUF = this.ctrlPing();
      await this.socketWrite(pingBUF);
      await helper.sleep(ms);
      await this.ping(ms);
    }
  }


  /**
   * When PING is received from the server send PONG back.
   */
  async pong() {
    const pongBUF = this.ctrlPong();
    await this.socketWrite(pongBUF);
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
    this.socketID = +answer.payload;
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
    const to = 0;
    const cmd = 'room/enter';
    const payload = roomName;
    await this.carryOut(to, cmd, payload);
  }

  /**
   * Unsubscribe from the room.
   * @param {string} roomName
   */
  async roomExit(roomName) {
    const to = 0;
    const cmd = 'room/exit';
    const payload = roomName;
    await this.carryOut(to, cmd, payload);
  }

  /**
   * Unsubscribe from all rooms.
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
    const to = 0;
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
    const to = 0;
    const cmd = 'route';
    const payload = { uri, body };
    return await this.carryOut(to, cmd, payload);
  }




  /*********** LISTENERS ************/
  /**
   * Listen the event.
   * * NOTICE: event 'message-error' - error in the received message, usually when message doen't conform the jsonRWS subprotocol
   * @param {string} eventName - event name: 'connected', 'disconnected', 'closed-by-server', 'ping', 'pong', 'message', 'message-error', 'question', 'route', 'server-error'
   * @param {Function} listener - callback function
   */
  on(eventName, listener) {
    return this.eventEmitter.on(eventName, listener);
  }

  /**
   * Listen the event only one time.
   * @param {string} eventName - event name: 'connected', 'disconnected', 'closed-by-server', 'ping', 'pong', 'message', 'message-error', 'question', 'route', 'server-error'
   * @param {Function} listener - callback function
   */
  once(eventName, listener) {
    return this.eventEmitter.once(eventName, listener);
  }

  /**
   * Stop listening the event.
   * @param {string} eventName - event name: 'connected', 'disconnected', 'closed-by-server', 'ping', 'pong', 'message', 'message-error', 'question', 'route', 'server-error'
   * @param {Function} listener - callback function
   */
  off(eventName, listener) {
    return this.eventEmitter.off(eventName, listener);
  }





  /******* OTHER ********/
  /**
   * Debugger. Use it as this.debugger(var1, var2, var3)
   */
  debugger(...textParts) {
    const text = textParts.join(' ');
    if (this.wcOpts.debug) { console.log(text.cliBoja('yellow')); }
  }




  /**
   * 1) Automatic delay of too fast websocket messages which can cause to block the NodeJS event loop.
   * 2) Stop DDoS attacks caused by very fast messages. When the event loop tick duration is >10ms.
   * @param {string} debugTxt - a text which helps to debug
   * @returns {boolean} - if false block the message
   */
  async _autodelay(debugTxt) {

  }



}




module.exports = Client13jsonRWS;
