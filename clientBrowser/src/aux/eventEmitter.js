/**
 * The EventEmitter based on window CustomEvent. Inspired by the NodeJS event lib.
 * Used in:
 * - regoch-spa / lib
 * - regoch-websocket / clientBrowser/src/aux
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
      const detailValues = this._getDetailValues(listener, event.detail);
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
      const detailValues = this._getDetailValues(listener, event.detail);
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
   * @param {Function} listener - callback function
   * @param {object} detail - event.detail object, for example {msg, msgSTR}
   * @returns {Array} - an array of the detail values (selected by the listener arguments)
   */
  _getDetailValues(listener, detail) {
    if (!listener) { throw new Error('eventEmitter._getDetailValues Error: listener is not defined'); }
    // console.log('\n------ _getDetailValues() ------');
    // console.log('listener::', listener.toString());

    // get listener function arguments
    const reg1 = /\((.*)\)\s*\=\>/; // (msg) =>
    const reg2 = /(.+)\s*\=\>/; // msg =>
    const reg3 = /function\s*\((.*)\)/; // function(msg)

    const listenerStr = listener.toString();

    let matched = listenerStr.match(reg1);
    if (!matched) { matched = listenerStr.match(reg2); }
    if (!matched) { matched = listenerStr.match(reg3); }
    if (!matched) { console.error(`_getDetailValues Err:: The listener is not valid ! listener:: ${listener.toString()}`); return; }

    // console.log('matched:::', matched);
    const args_str = matched[1];
    const args = args_str.split(',').map(arg => arg.trim()); // ['msg', 'msgSTR']

    // get detail values
    const detailValues = args.map(arg => detail[arg]);
    // console.log('detailValues:::', detailValues);

    return detailValues;
  }





}


module.exports = new EventEmitter();
