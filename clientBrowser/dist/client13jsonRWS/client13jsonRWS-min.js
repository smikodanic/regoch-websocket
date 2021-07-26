!function(){return function e(t,o,s){function n(c,r){if(!o[c]){if(!t[c]){var a="function"==typeof require&&require;if(!r&&a)return a(c,!0);if(i)return i(c,!0);var l=new Error("Cannot find module '"+c+"'");throw l.code="MODULE_NOT_FOUND",l}var d=o[c]={exports:{}};t[c][0].call(d.exports,function(e){return n(t[c][1][e]||e)},d,d.exports,e,t,o,s)}return o[c].exports}for(var i="function"==typeof require&&require,c=0;c<s.length;c++)n(s[c]);return n}}()({1:[function(e,t,o){const s=e("./aux/eventEmitter"),n=e("../../lib/subprotocol/jsonRWS"),i=e("../../lib/helper");class c{constructor(e){this.wcOpts=e,this.wsocket,this.socketID,this.attempt=1}connect(){const e=this.wcOpts.wsURL;return this.wsocket=new WebSocket(e,this.wcOpts.subprotocols),this.onEvents(),new Promise(e=>{s.once("connected",()=>{e(this.wsocket)})})}disconnect(){this.wsocket&&this.wsocket.close(),this.blockReconnect()}async reconnect(){const e=this.wcOpts.reconnectAttempts,t=this.wcOpts.reconnectDelay;this.attempt<=e&&(await i.sleep(t),this.connect(),console.log(`Reconnect attempt #${this.attempt} of ${e} in ${t}ms`),this.attempt++)}blockReconnect(){this.attempt=this.wcOpts.reconnectAttempts+1}onEvents(){this.wsocket.onopen=(async e=>{this.onMessage(),console.log("WS Connection opened"),this.attempt=1,this.socketID=await this.infoSocketId(),console.log(`socketID: ${this.socketID}`),s.emit("connected")}),this.wsocket.onclose=(e=>{console.log("WS Connection closed"),delete this.wsocket,delete this.socketID,this.reconnect()}),this.wsocket.onerror=(e=>{})}onMessage(){this.wsocket.onmessage=(e=>{try{const t=e.data;this.debugger("Received::",t);const o=n.incoming(t),i={msg:o,msgSTR:t};"route"===o.cmd?s.emit("route",i):"info/socket/id"===o.cmd?s.emit("question",i):"info/socket/list"===o.cmd?s.emit("question",i):"info/room/list"===o.cmd?s.emit("question",i):"info/room/listmy"===o.cmd?s.emit("question",i):s.emit("message",i)}catch(e){console.error(e)}})}question(e){const t=this.socketID;return this.carryOut(t,e,void 0),new Promise(async(t,o)=>{this.once("question",async(s,n)=>{s.cmd===e?t(s):o(new Error("Received cmd is not same as sent cmd."))}),await i.sleep(this.wcOpts.questionTimeout),o(new Error(`No answer for the question: ${e}`))})}async infoSocketId(){const e=await this.question("info/socket/id");return this.socketID=+e.payload,this.socketID}async infoSocketList(){return(await this.question("info/socket/list")).payload}async infoRoomList(){return(await this.question("info/room/list")).payload}async infoRoomListmy(){return(await this.question("info/room/listmy")).payload}async carryOut(e,t,o){e||(e=0);const s={id:i.generateID(),from:+this.socketID,to:e,cmd:t,payload:o},c=n.outgoing(s);if(this.debugger("Sent::",c),!c||!this.wsocket||1!==this.wsocket.readyState)throw new Error("The message is not defined or the client is disconnected.");await new Promise(e=>setTimeout(e,0)),await this.wsocket.send(c)}async sendOne(e,t){const o=t;await this.carryOut(e,"socket/sendone",o)}async send(e,t){const o=t;await this.carryOut(e,"socket/send",o)}async broadcast(e){const t=e;await this.carryOut(0,"socket/broadcast",t)}async sendAll(e){const t=e;await this.carryOut(0,"socket/sendall",t)}async roomEnter(e){const t=e;await this.carryOut(0,"room/enter",t)}async roomExit(e){const t=e;await this.carryOut(0,"room/exit",t)}async roomExitAll(){await this.carryOut(0,"room/exitall",void 0)}async roomSend(e,t){const o=e,s=t;await this.carryOut(o,"room/send",s)}async setNick(e){const t=e;await this.carryOut(0,"socket/nick",t)}async route(e,t){const o={uri:e,body:t};await this.carryOut(0,"route",o)}on(e,t){return s.on(e,e=>{t.call(null,e.detail.msg,e.detail.msgSTR)})}once(e,t){return s.on(e,e=>{t.call(null,e.detail.msg,e.detail.msgSTR)})}off(e){return s.off(e)}debugger(...e){const t=e.join("");this.wcOpts.debug&&console.log(t)}}window.regochWebsocket={Client13jsonRWS:c},t.exports=c},{"../../lib/helper":3,"../../lib/subprotocol/jsonRWS":4,"./aux/eventEmitter":2}],2:[function(e,t,o){t.exports=new class{constructor(){this.activeOns=[]}emit(e,t){const o=new CustomEvent(e,{detail:t});window.dispatchEvent(o)}on(e,t){const o=e=>{t(e)};let s=0;for(const t of this.activeOns)t.eventName===e&&t.listenerCB.toString()===o.toString()&&(window.removeEventListener(e,t.listenerCB),this.activeOns.splice(s,1)),s++;this.activeOns.push({eventName:e,listenerCB:o}),window.addEventListener(e,o)}once(e,t){const o=s=>{t(s),window.removeEventListener(e,o)};window.addEventListener(e,o,{once:!0})}off(e){let t=0;for(const o of this.activeOns)o.eventName===e&&(window.removeEventListener(e,o.listenerCB),this.activeOns.splice(t,1)),t++}getListeners(){return{...this.activeOns}}}},{}],3:[function(e,t,o){t.exports=new class{generateID(){const e=1e3*Math.random(),t=Math.floor(e);return+((new Date).toISOString().replace(/^20/,"").replace(/\-/g,"").replace(/\:/g,"").replace("T","").replace("Z","").replace(".","")+t)}nowTime(){const e=new Date;return new Intl.DateTimeFormat("en-us",{weekday:"long",year:"numeric",month:"numeric",day:"numeric",hour:"numeric",minute:"numeric",second:"numeric",fractionalSecondDigits:3,hour12:!1,timeZone:"UTC"}).format(e)}async sleep(e){await new Promise(t=>setTimeout(t,e))}printBuffer(e){console.log(e.toString("hex").match(/../g).join(" "))}}},{}],4:[function(e,t,o){t.exports=new class{constructor(){this.delimiter="<<!END!>>"}incoming(e){let t,o=!1;try{e=e.replace(this.delimiter,""),t=JSON.parse(e);const s=Object.keys(t);o=this._testFields(s)}catch(e){o=!1}if(o)return t;throw new Error(`Incoming message doesn't have valid "jsonRWS" subprotocol format. msg:: "${e}"`)}outgoing(e){const t=Object.keys(e);if(this._testFields(t))return JSON.stringify(e)+this.delimiter;throw new Error(`Outgoing message doesn't have valid "jsonRWS" subprotocol format. msg:: ${JSON.stringify(e)}`)}async process(e,t,o,s,n){e.id,e.from;const i=e.to,c=e.cmd,r=e.payload;if("socket/sendone"===c){const t=+e.to,n=await s.findOne({id:t});o.sendOne(e,n)}else if("socket/send"===c){const t=i.map(e=>+e),n=await s.find({id:{$in:t}});o.send(e,n)}else if("socket/broadcast"===c)o.broadcast(e,t);else if("socket/sendall"===c)o.sendAll(e);else if("socket/nick"===c){const o=e.payload;try{await s.setNick(t,o),e.payload=t.extension.nickname}catch(t){e.cmd="error",e.payload=t.message}t.extension.sendSelf(e)}else if("room/enter"===c){const o=r;s.roomEnter(t,o),e.payload=`Entered in the room '${o}'`,t.extension.sendSelf(e)}else if("room/exit"===c){const o=r;s.roomExit(t,r),e.payload=`Exited from the room '${o}'`,t.extension.sendSelf(e)}else if("room/exitall"===c)s.roomExitAll(t),e.payload="Exited from all rooms",t.extension.sendSelf(e);else if("room/send"===c){const s=i;o.sendRoom(e,t,s)}else if("route"===c)n.emit("route",e,t,o,s,n);else if("info/socket/id"===c)e.payload=t.extension.id,t.extension.sendSelf(e);else if("info/socket/list"===c){const o=(await s.find()).map(e=>({id:e.extension.id,nickname:e.extension.nickname}));e.payload=o,t.extension.sendSelf(e)}else if("info/room/list"===c){const o=await s.roomList();e.payload=o,t.extension.sendSelf(e)}else if("info/room/listmy"===c){const o=await s.roomListOf(e.from);e.payload=o,t.extension.sendSelf(e)}}_testFields(e){const t=["id","from","to","cmd","payload"],o=["id","from","to","cmd"];let s=!0;for(const o of e)if(-1===t.indexOf(o)){s=!1;break}for(const t of o)if(-1===e.indexOf(t)){s=!1;break}return s}}},{}]},{},[1]);
//# sourceMappingURL=client13jsonRWS-min.js.map
