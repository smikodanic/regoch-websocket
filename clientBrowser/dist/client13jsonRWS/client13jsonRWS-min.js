!function(){return function t(e,r,n){function o(s,f){if(!r[s]){if(!e[s]){var a="function"==typeof require&&require;if(!f&&a)return a(s,!0);if(i)return i(s,!0);var u=new Error("Cannot find module '"+s+"'");throw u.code="MODULE_NOT_FOUND",u}var c=r[s]={exports:{}};e[s][0].call(c.exports,function(t){return o(e[s][1][t]||t)},c,c.exports,t,e,r,n)}return r[s].exports}for(var i="function"==typeof require&&require,s=0;s<n.length;s++)o(n[s]);return o}}()({1:[function(t,e,r){"use strict";r.byteLength=function(t){var e=u(t),r=e[0],n=e[1];return 3*(r+n)/4-n},r.toByteArray=function(t){var e,r,n=u(t),s=n[0],f=n[1],a=new i(function(t,e,r){return 3*(e+r)/4-r}(0,s,f)),c=0,h=f>0?s-4:s;for(r=0;r<h;r+=4)e=o[t.charCodeAt(r)]<<18|o[t.charCodeAt(r+1)]<<12|o[t.charCodeAt(r+2)]<<6|o[t.charCodeAt(r+3)],a[c++]=e>>16&255,a[c++]=e>>8&255,a[c++]=255&e;2===f&&(e=o[t.charCodeAt(r)]<<2|o[t.charCodeAt(r+1)]>>4,a[c++]=255&e);1===f&&(e=o[t.charCodeAt(r)]<<10|o[t.charCodeAt(r+1)]<<4|o[t.charCodeAt(r+2)]>>2,a[c++]=e>>8&255,a[c++]=255&e);return a},r.fromByteArray=function(t){for(var e,r=t.length,o=r%3,i=[],s=0,f=r-o;s<f;s+=16383)i.push(c(t,s,s+16383>f?f:s+16383));1===o?(e=t[r-1],i.push(n[e>>2]+n[e<<4&63]+"==")):2===o&&(e=(t[r-2]<<8)+t[r-1],i.push(n[e>>10]+n[e>>4&63]+n[e<<2&63]+"="));return i.join("")};for(var n=[],o=[],i="undefined"!=typeof Uint8Array?Uint8Array:Array,s="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",f=0,a=s.length;f<a;++f)n[f]=s[f],o[s.charCodeAt(f)]=f;function u(t){var e=t.length;if(e%4>0)throw new Error("Invalid string. Length must be a multiple of 4");var r=t.indexOf("=");return-1===r&&(r=e),[r,r===e?0:4-r%4]}function c(t,e,r){for(var o,i,s=[],f=e;f<r;f+=3)o=(t[f]<<16&16711680)+(t[f+1]<<8&65280)+(255&t[f+2]),s.push(n[(i=o)>>18&63]+n[i>>12&63]+n[i>>6&63]+n[63&i]);return s.join("")}o["-".charCodeAt(0)]=62,o["_".charCodeAt(0)]=63},{}],2:[function(t,e,r){(function(e){(function(){"use strict";var e=t("base64-js"),n=t("ieee754");r.Buffer=s,r.SlowBuffer=function(t){+t!=t&&(t=0);return s.alloc(+t)},r.INSPECT_MAX_BYTES=50;var o=2147483647;function i(t){if(t>o)throw new RangeError('The value "'+t+'" is invalid for option "size"');var e=new Uint8Array(t);return e.__proto__=s.prototype,e}function s(t,e,r){if("number"==typeof t){if("string"==typeof e)throw new TypeError('The "string" argument must be of type string. Received type number');return u(t)}return f(t,e,r)}function f(t,e,r){if("string"==typeof t)return function(t,e){"string"==typeof e&&""!==e||(e="utf8");if(!s.isEncoding(e))throw new TypeError("Unknown encoding: "+e);var r=0|l(t,e),n=i(r),o=n.write(t,e);o!==r&&(n=n.slice(0,o));return n}(t,e);if(ArrayBuffer.isView(t))return c(t);if(null==t)throw TypeError("The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type "+typeof t);if(j(t,ArrayBuffer)||t&&j(t.buffer,ArrayBuffer))return function(t,e,r){if(e<0||t.byteLength<e)throw new RangeError('"offset" is outside of buffer bounds');if(t.byteLength<e+(r||0))throw new RangeError('"length" is outside of buffer bounds');var n;n=void 0===e&&void 0===r?new Uint8Array(t):void 0===r?new Uint8Array(t,e):new Uint8Array(t,e,r);return n.__proto__=s.prototype,n}(t,e,r);if("number"==typeof t)throw new TypeError('The "value" argument must not be of type number. Received type number');var n=t.valueOf&&t.valueOf();if(null!=n&&n!==t)return s.from(n,e,r);var o=function(t){if(s.isBuffer(t)){var e=0|h(t.length),r=i(e);return 0===r.length?r:(t.copy(r,0,0,e),r)}if(void 0!==t.length)return"number"!=typeof t.length||P(t.length)?i(0):c(t);if("Buffer"===t.type&&Array.isArray(t.data))return c(t.data)}(t);if(o)return o;if("undefined"!=typeof Symbol&&null!=Symbol.toPrimitive&&"function"==typeof t[Symbol.toPrimitive])return s.from(t[Symbol.toPrimitive]("string"),e,r);throw new TypeError("The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type "+typeof t)}function a(t){if("number"!=typeof t)throw new TypeError('"size" argument must be of type number');if(t<0)throw new RangeError('The value "'+t+'" is invalid for option "size"')}function u(t){return a(t),i(t<0?0:0|h(t))}function c(t){for(var e=t.length<0?0:0|h(t.length),r=i(e),n=0;n<e;n+=1)r[n]=255&t[n];return r}function h(t){if(t>=o)throw new RangeError("Attempt to allocate Buffer larger than maximum size: 0x"+o.toString(16)+" bytes");return 0|t}function l(t,e){if(s.isBuffer(t))return t.length;if(ArrayBuffer.isView(t)||j(t,ArrayBuffer))return t.byteLength;if("string"!=typeof t)throw new TypeError('The "string" argument must be one of type string, Buffer, or ArrayBuffer. Received type '+typeof t);var r=t.length,n=arguments.length>2&&!0===arguments[2];if(!n&&0===r)return 0;for(var o=!1;;)switch(e){case"ascii":case"latin1":case"binary":return r;case"utf8":case"utf-8":return D(t).length;case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return 2*r;case"hex":return r>>>1;case"base64":return N(t).length;default:if(o)return n?-1:D(t).length;e=(""+e).toLowerCase(),o=!0}}function p(t,e,r){var n=t[e];t[e]=t[r],t[r]=n}function y(t,e,r,n,o){if(0===t.length)return-1;if("string"==typeof r?(n=r,r=0):r>2147483647?r=2147483647:r<-2147483648&&(r=-2147483648),P(r=+r)&&(r=o?0:t.length-1),r<0&&(r=t.length+r),r>=t.length){if(o)return-1;r=t.length-1}else if(r<0){if(!o)return-1;r=0}if("string"==typeof e&&(e=s.from(e,n)),s.isBuffer(e))return 0===e.length?-1:g(t,e,r,n,o);if("number"==typeof e)return e&=255,"function"==typeof Uint8Array.prototype.indexOf?o?Uint8Array.prototype.indexOf.call(t,e,r):Uint8Array.prototype.lastIndexOf.call(t,e,r):g(t,[e],r,n,o);throw new TypeError("val must be string, number or Buffer")}function g(t,e,r,n,o){var i,s=1,f=t.length,a=e.length;if(void 0!==n&&("ucs2"===(n=String(n).toLowerCase())||"ucs-2"===n||"utf16le"===n||"utf-16le"===n)){if(t.length<2||e.length<2)return-1;s=2,f/=2,a/=2,r/=2}function u(t,e){return 1===s?t[e]:t.readUInt16BE(e*s)}if(o){var c=-1;for(i=r;i<f;i++)if(u(t,i)===u(e,-1===c?0:i-c)){if(-1===c&&(c=i),i-c+1===a)return c*s}else-1!==c&&(i-=i-c),c=-1}else for(r+a>f&&(r=f-a),i=r;i>=0;i--){for(var h=!0,l=0;l<a;l++)if(u(t,i+l)!==u(e,l)){h=!1;break}if(h)return i}return-1}function d(t,e,r,n){r=Number(r)||0;var o=t.length-r;n?(n=Number(n))>o&&(n=o):n=o;var i=e.length;n>i/2&&(n=i/2);for(var s=0;s<n;++s){var f=parseInt(e.substr(2*s,2),16);if(P(f))return s;t[r+s]=f}return s}function w(t,e,r,n){return q(D(e,t.length-r),t,r,n)}function m(t,e,r,n){return q(function(t){for(var e=[],r=0;r<t.length;++r)e.push(255&t.charCodeAt(r));return e}(e),t,r,n)}function v(t,e,r,n){return m(t,e,r,n)}function b(t,e,r,n){return q(N(e),t,r,n)}function E(t,e,r,n){return q(function(t,e){for(var r,n,o,i=[],s=0;s<t.length&&!((e-=2)<0);++s)r=t.charCodeAt(s),n=r>>8,o=r%256,i.push(o),i.push(n);return i}(e,t.length-r),t,r,n)}function A(t,r,n){return 0===r&&n===t.length?e.fromByteArray(t):e.fromByteArray(t.slice(r,n))}function B(t,e,r){r=Math.min(t.length,r);for(var n=[],o=e;o<r;){var i,s,f,a,u=t[o],c=null,h=u>239?4:u>223?3:u>191?2:1;if(o+h<=r)switch(h){case 1:u<128&&(c=u);break;case 2:128==(192&(i=t[o+1]))&&(a=(31&u)<<6|63&i)>127&&(c=a);break;case 3:i=t[o+1],s=t[o+2],128==(192&i)&&128==(192&s)&&(a=(15&u)<<12|(63&i)<<6|63&s)>2047&&(a<55296||a>57343)&&(c=a);break;case 4:i=t[o+1],s=t[o+2],f=t[o+3],128==(192&i)&&128==(192&s)&&128==(192&f)&&(a=(15&u)<<18|(63&i)<<12|(63&s)<<6|63&f)>65535&&a<1114112&&(c=a)}null===c?(c=65533,h=1):c>65535&&(c-=65536,n.push(c>>>10&1023|55296),c=56320|1023&c),n.push(c),o+=h}return function(t){var e=t.length;if(e<=k)return String.fromCharCode.apply(String,t);var r="",n=0;for(;n<e;)r+=String.fromCharCode.apply(String,t.slice(n,n+=k));return r}(n)}r.kMaxLength=o,s.TYPED_ARRAY_SUPPORT=function(){try{var t=new Uint8Array(1);return t.__proto__={__proto__:Uint8Array.prototype,foo:function(){return 42}},42===t.foo()}catch(t){return!1}}(),s.TYPED_ARRAY_SUPPORT||"undefined"==typeof console||"function"!=typeof console.error||console.error("This browser lacks typed array (Uint8Array) support which is required by `buffer` v5.x. Use `buffer` v4.x if you require old browser support."),Object.defineProperty(s.prototype,"parent",{enumerable:!0,get:function(){if(s.isBuffer(this))return this.buffer}}),Object.defineProperty(s.prototype,"offset",{enumerable:!0,get:function(){if(s.isBuffer(this))return this.byteOffset}}),"undefined"!=typeof Symbol&&null!=Symbol.species&&s[Symbol.species]===s&&Object.defineProperty(s,Symbol.species,{value:null,configurable:!0,enumerable:!1,writable:!1}),s.poolSize=8192,s.from=function(t,e,r){return f(t,e,r)},s.prototype.__proto__=Uint8Array.prototype,s.__proto__=Uint8Array,s.alloc=function(t,e,r){return function(t,e,r){return a(t),t<=0?i(t):void 0!==e?"string"==typeof r?i(t).fill(e,r):i(t).fill(e):i(t)}(t,e,r)},s.allocUnsafe=function(t){return u(t)},s.allocUnsafeSlow=function(t){return u(t)},s.isBuffer=function(t){return null!=t&&!0===t._isBuffer&&t!==s.prototype},s.compare=function(t,e){if(j(t,Uint8Array)&&(t=s.from(t,t.offset,t.byteLength)),j(e,Uint8Array)&&(e=s.from(e,e.offset,e.byteLength)),!s.isBuffer(t)||!s.isBuffer(e))throw new TypeError('The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array');if(t===e)return 0;for(var r=t.length,n=e.length,o=0,i=Math.min(r,n);o<i;++o)if(t[o]!==e[o]){r=t[o],n=e[o];break}return r<n?-1:n<r?1:0},s.isEncoding=function(t){switch(String(t).toLowerCase()){case"hex":case"utf8":case"utf-8":case"ascii":case"latin1":case"binary":case"base64":case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return!0;default:return!1}},s.concat=function(t,e){if(!Array.isArray(t))throw new TypeError('"list" argument must be an Array of Buffers');if(0===t.length)return s.alloc(0);var r;if(void 0===e)for(e=0,r=0;r<t.length;++r)e+=t[r].length;var n=s.allocUnsafe(e),o=0;for(r=0;r<t.length;++r){var i=t[r];if(j(i,Uint8Array)&&(i=s.from(i)),!s.isBuffer(i))throw new TypeError('"list" argument must be an Array of Buffers');i.copy(n,o),o+=i.length}return n},s.byteLength=l,s.prototype._isBuffer=!0,s.prototype.swap16=function(){var t=this.length;if(t%2!=0)throw new RangeError("Buffer size must be a multiple of 16-bits");for(var e=0;e<t;e+=2)p(this,e,e+1);return this},s.prototype.swap32=function(){var t=this.length;if(t%4!=0)throw new RangeError("Buffer size must be a multiple of 32-bits");for(var e=0;e<t;e+=4)p(this,e,e+3),p(this,e+1,e+2);return this},s.prototype.swap64=function(){var t=this.length;if(t%8!=0)throw new RangeError("Buffer size must be a multiple of 64-bits");for(var e=0;e<t;e+=8)p(this,e,e+7),p(this,e+1,e+6),p(this,e+2,e+5),p(this,e+3,e+4);return this},s.prototype.toString=function(){var t=this.length;return 0===t?"":0===arguments.length?B(this,0,t):function(t,e,r){var n=!1;if((void 0===e||e<0)&&(e=0),e>this.length)return"";if((void 0===r||r>this.length)&&(r=this.length),r<=0)return"";if((r>>>=0)<=(e>>>=0))return"";for(t||(t="utf8");;)switch(t){case"hex":return x(this,e,r);case"utf8":case"utf-8":return B(this,e,r);case"ascii":return S(this,e,r);case"latin1":case"binary":return O(this,e,r);case"base64":return A(this,e,r);case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return I(this,e,r);default:if(n)throw new TypeError("Unknown encoding: "+t);t=(t+"").toLowerCase(),n=!0}}.apply(this,arguments)},s.prototype.toLocaleString=s.prototype.toString,s.prototype.equals=function(t){if(!s.isBuffer(t))throw new TypeError("Argument must be a Buffer");return this===t||0===s.compare(this,t)},s.prototype.inspect=function(){var t="",e=r.INSPECT_MAX_BYTES;return t=this.toString("hex",0,e).replace(/(.{2})/g,"$1 ").trim(),this.length>e&&(t+=" ... "),"<Buffer "+t+">"},s.prototype.compare=function(t,e,r,n,o){if(j(t,Uint8Array)&&(t=s.from(t,t.offset,t.byteLength)),!s.isBuffer(t))throw new TypeError('The "target" argument must be one of type Buffer or Uint8Array. Received type '+typeof t);if(void 0===e&&(e=0),void 0===r&&(r=t?t.length:0),void 0===n&&(n=0),void 0===o&&(o=this.length),e<0||r>t.length||n<0||o>this.length)throw new RangeError("out of range index");if(n>=o&&e>=r)return 0;if(n>=o)return-1;if(e>=r)return 1;if(this===t)return 0;for(var i=(o>>>=0)-(n>>>=0),f=(r>>>=0)-(e>>>=0),a=Math.min(i,f),u=this.slice(n,o),c=t.slice(e,r),h=0;h<a;++h)if(u[h]!==c[h]){i=u[h],f=c[h];break}return i<f?-1:f<i?1:0},s.prototype.includes=function(t,e,r){return-1!==this.indexOf(t,e,r)},s.prototype.indexOf=function(t,e,r){return y(this,t,e,r,!0)},s.prototype.lastIndexOf=function(t,e,r){return y(this,t,e,r,!1)},s.prototype.write=function(t,e,r,n){if(void 0===e)n="utf8",r=this.length,e=0;else if(void 0===r&&"string"==typeof e)n=e,r=this.length,e=0;else{if(!isFinite(e))throw new Error("Buffer.write(string, encoding, offset[, length]) is no longer supported");e>>>=0,isFinite(r)?(r>>>=0,void 0===n&&(n="utf8")):(n=r,r=void 0)}var o=this.length-e;if((void 0===r||r>o)&&(r=o),t.length>0&&(r<0||e<0)||e>this.length)throw new RangeError("Attempt to write outside buffer bounds");n||(n="utf8");for(var i=!1;;)switch(n){case"hex":return d(this,t,e,r);case"utf8":case"utf-8":return w(this,t,e,r);case"ascii":return m(this,t,e,r);case"latin1":case"binary":return v(this,t,e,r);case"base64":return b(this,t,e,r);case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return E(this,t,e,r);default:if(i)throw new TypeError("Unknown encoding: "+n);n=(""+n).toLowerCase(),i=!0}},s.prototype.toJSON=function(){return{type:"Buffer",data:Array.prototype.slice.call(this._arr||this,0)}};var k=4096;function S(t,e,r){var n="";r=Math.min(t.length,r);for(var o=e;o<r;++o)n+=String.fromCharCode(127&t[o]);return n}function O(t,e,r){var n="";r=Math.min(t.length,r);for(var o=e;o<r;++o)n+=String.fromCharCode(t[o]);return n}function x(t,e,r){var n=t.length;(!e||e<0)&&(e=0),(!r||r<0||r>n)&&(r=n);for(var o="",i=e;i<r;++i)o+=M(t[i]);return o}function I(t,e,r){for(var n=t.slice(e,r),o="",i=0;i<n.length;i+=2)o+=String.fromCharCode(n[i]+256*n[i+1]);return o}function T(t,e,r){if(t%1!=0||t<0)throw new RangeError("offset is not uint");if(t+e>r)throw new RangeError("Trying to access beyond buffer length")}function U(t,e,r,n,o,i){if(!s.isBuffer(t))throw new TypeError('"buffer" argument must be a Buffer instance');if(e>o||e<i)throw new RangeError('"value" argument is out of bounds');if(r+n>t.length)throw new RangeError("Index out of range")}function R(t,e,r,n,o,i){if(r+n>t.length)throw new RangeError("Index out of range");if(r<0)throw new RangeError("Index out of range")}function L(t,e,r,o,i){return e=+e,r>>>=0,i||R(t,0,r,4),n.write(t,e,r,o,23,4),r+4}function _(t,e,r,o,i){return e=+e,r>>>=0,i||R(t,0,r,8),n.write(t,e,r,o,52,8),r+8}s.prototype.slice=function(t,e){var r=this.length;(t=~~t)<0?(t+=r)<0&&(t=0):t>r&&(t=r),(e=void 0===e?r:~~e)<0?(e+=r)<0&&(e=0):e>r&&(e=r),e<t&&(e=t);var n=this.subarray(t,e);return n.__proto__=s.prototype,n},s.prototype.readUIntLE=function(t,e,r){t>>>=0,e>>>=0,r||T(t,e,this.length);for(var n=this[t],o=1,i=0;++i<e&&(o*=256);)n+=this[t+i]*o;return n},s.prototype.readUIntBE=function(t,e,r){t>>>=0,e>>>=0,r||T(t,e,this.length);for(var n=this[t+--e],o=1;e>0&&(o*=256);)n+=this[t+--e]*o;return n},s.prototype.readUInt8=function(t,e){return t>>>=0,e||T(t,1,this.length),this[t]},s.prototype.readUInt16LE=function(t,e){return t>>>=0,e||T(t,2,this.length),this[t]|this[t+1]<<8},s.prototype.readUInt16BE=function(t,e){return t>>>=0,e||T(t,2,this.length),this[t]<<8|this[t+1]},s.prototype.readUInt32LE=function(t,e){return t>>>=0,e||T(t,4,this.length),(this[t]|this[t+1]<<8|this[t+2]<<16)+16777216*this[t+3]},s.prototype.readUInt32BE=function(t,e){return t>>>=0,e||T(t,4,this.length),16777216*this[t]+(this[t+1]<<16|this[t+2]<<8|this[t+3])},s.prototype.readIntLE=function(t,e,r){t>>>=0,e>>>=0,r||T(t,e,this.length);for(var n=this[t],o=1,i=0;++i<e&&(o*=256);)n+=this[t+i]*o;return n>=(o*=128)&&(n-=Math.pow(2,8*e)),n},s.prototype.readIntBE=function(t,e,r){t>>>=0,e>>>=0,r||T(t,e,this.length);for(var n=e,o=1,i=this[t+--n];n>0&&(o*=256);)i+=this[t+--n]*o;return i>=(o*=128)&&(i-=Math.pow(2,8*e)),i},s.prototype.readInt8=function(t,e){return t>>>=0,e||T(t,1,this.length),128&this[t]?-1*(255-this[t]+1):this[t]},s.prototype.readInt16LE=function(t,e){t>>>=0,e||T(t,2,this.length);var r=this[t]|this[t+1]<<8;return 32768&r?4294901760|r:r},s.prototype.readInt16BE=function(t,e){t>>>=0,e||T(t,2,this.length);var r=this[t+1]|this[t]<<8;return 32768&r?4294901760|r:r},s.prototype.readInt32LE=function(t,e){return t>>>=0,e||T(t,4,this.length),this[t]|this[t+1]<<8|this[t+2]<<16|this[t+3]<<24},s.prototype.readInt32BE=function(t,e){return t>>>=0,e||T(t,4,this.length),this[t]<<24|this[t+1]<<16|this[t+2]<<8|this[t+3]},s.prototype.readFloatLE=function(t,e){return t>>>=0,e||T(t,4,this.length),n.read(this,t,!0,23,4)},s.prototype.readFloatBE=function(t,e){return t>>>=0,e||T(t,4,this.length),n.read(this,t,!1,23,4)},s.prototype.readDoubleLE=function(t,e){return t>>>=0,e||T(t,8,this.length),n.read(this,t,!0,52,8)},s.prototype.readDoubleBE=function(t,e){return t>>>=0,e||T(t,8,this.length),n.read(this,t,!1,52,8)},s.prototype.writeUIntLE=function(t,e,r,n){(t=+t,e>>>=0,r>>>=0,n)||U(this,t,e,r,Math.pow(2,8*r)-1,0);var o=1,i=0;for(this[e]=255&t;++i<r&&(o*=256);)this[e+i]=t/o&255;return e+r},s.prototype.writeUIntBE=function(t,e,r,n){(t=+t,e>>>=0,r>>>=0,n)||U(this,t,e,r,Math.pow(2,8*r)-1,0);var o=r-1,i=1;for(this[e+o]=255&t;--o>=0&&(i*=256);)this[e+o]=t/i&255;return e+r},s.prototype.writeUInt8=function(t,e,r){return t=+t,e>>>=0,r||U(this,t,e,1,255,0),this[e]=255&t,e+1},s.prototype.writeUInt16LE=function(t,e,r){return t=+t,e>>>=0,r||U(this,t,e,2,65535,0),this[e]=255&t,this[e+1]=t>>>8,e+2},s.prototype.writeUInt16BE=function(t,e,r){return t=+t,e>>>=0,r||U(this,t,e,2,65535,0),this[e]=t>>>8,this[e+1]=255&t,e+2},s.prototype.writeUInt32LE=function(t,e,r){return t=+t,e>>>=0,r||U(this,t,e,4,4294967295,0),this[e+3]=t>>>24,this[e+2]=t>>>16,this[e+1]=t>>>8,this[e]=255&t,e+4},s.prototype.writeUInt32BE=function(t,e,r){return t=+t,e>>>=0,r||U(this,t,e,4,4294967295,0),this[e]=t>>>24,this[e+1]=t>>>16,this[e+2]=t>>>8,this[e+3]=255&t,e+4},s.prototype.writeIntLE=function(t,e,r,n){if(t=+t,e>>>=0,!n){var o=Math.pow(2,8*r-1);U(this,t,e,r,o-1,-o)}var i=0,s=1,f=0;for(this[e]=255&t;++i<r&&(s*=256);)t<0&&0===f&&0!==this[e+i-1]&&(f=1),this[e+i]=(t/s>>0)-f&255;return e+r},s.prototype.writeIntBE=function(t,e,r,n){if(t=+t,e>>>=0,!n){var o=Math.pow(2,8*r-1);U(this,t,e,r,o-1,-o)}var i=r-1,s=1,f=0;for(this[e+i]=255&t;--i>=0&&(s*=256);)t<0&&0===f&&0!==this[e+i+1]&&(f=1),this[e+i]=(t/s>>0)-f&255;return e+r},s.prototype.writeInt8=function(t,e,r){return t=+t,e>>>=0,r||U(this,t,e,1,127,-128),t<0&&(t=255+t+1),this[e]=255&t,e+1},s.prototype.writeInt16LE=function(t,e,r){return t=+t,e>>>=0,r||U(this,t,e,2,32767,-32768),this[e]=255&t,this[e+1]=t>>>8,e+2},s.prototype.writeInt16BE=function(t,e,r){return t=+t,e>>>=0,r||U(this,t,e,2,32767,-32768),this[e]=t>>>8,this[e+1]=255&t,e+2},s.prototype.writeInt32LE=function(t,e,r){return t=+t,e>>>=0,r||U(this,t,e,4,2147483647,-2147483648),this[e]=255&t,this[e+1]=t>>>8,this[e+2]=t>>>16,this[e+3]=t>>>24,e+4},s.prototype.writeInt32BE=function(t,e,r){return t=+t,e>>>=0,r||U(this,t,e,4,2147483647,-2147483648),t<0&&(t=4294967295+t+1),this[e]=t>>>24,this[e+1]=t>>>16,this[e+2]=t>>>8,this[e+3]=255&t,e+4},s.prototype.writeFloatLE=function(t,e,r){return L(this,t,e,!0,r)},s.prototype.writeFloatBE=function(t,e,r){return L(this,t,e,!1,r)},s.prototype.writeDoubleLE=function(t,e,r){return _(this,t,e,!0,r)},s.prototype.writeDoubleBE=function(t,e,r){return _(this,t,e,!1,r)},s.prototype.copy=function(t,e,r,n){if(!s.isBuffer(t))throw new TypeError("argument should be a Buffer");if(r||(r=0),n||0===n||(n=this.length),e>=t.length&&(e=t.length),e||(e=0),n>0&&n<r&&(n=r),n===r)return 0;if(0===t.length||0===this.length)return 0;if(e<0)throw new RangeError("targetStart out of bounds");if(r<0||r>=this.length)throw new RangeError("Index out of range");if(n<0)throw new RangeError("sourceEnd out of bounds");n>this.length&&(n=this.length),t.length-e<n-r&&(n=t.length-e+r);var o=n-r;if(this===t&&"function"==typeof Uint8Array.prototype.copyWithin)this.copyWithin(e,r,n);else if(this===t&&r<e&&e<n)for(var i=o-1;i>=0;--i)t[i+e]=this[i+r];else Uint8Array.prototype.set.call(t,this.subarray(r,n),e);return o},s.prototype.fill=function(t,e,r,n){if("string"==typeof t){if("string"==typeof e?(n=e,e=0,r=this.length):"string"==typeof r&&(n=r,r=this.length),void 0!==n&&"string"!=typeof n)throw new TypeError("encoding must be a string");if("string"==typeof n&&!s.isEncoding(n))throw new TypeError("Unknown encoding: "+n);if(1===t.length){var o=t.charCodeAt(0);("utf8"===n&&o<128||"latin1"===n)&&(t=o)}}else"number"==typeof t&&(t&=255);if(e<0||this.length<e||this.length<r)throw new RangeError("Out of range index");if(r<=e)return this;var i;if(e>>>=0,r=void 0===r?this.length:r>>>0,t||(t=0),"number"==typeof t)for(i=e;i<r;++i)this[i]=t;else{var f=s.isBuffer(t)?t:s.from(t,n),a=f.length;if(0===a)throw new TypeError('The value "'+t+'" is invalid for argument "value"');for(i=0;i<r-e;++i)this[i+e]=f[i%a]}return this};var C=/[^+/0-9A-Za-z-_]/g;function M(t){return t<16?"0"+t.toString(16):t.toString(16)}function D(t,e){var r;e=e||1/0;for(var n=t.length,o=null,i=[],s=0;s<n;++s){if((r=t.charCodeAt(s))>55295&&r<57344){if(!o){if(r>56319){(e-=3)>-1&&i.push(239,191,189);continue}if(s+1===n){(e-=3)>-1&&i.push(239,191,189);continue}o=r;continue}if(r<56320){(e-=3)>-1&&i.push(239,191,189),o=r;continue}r=65536+(o-55296<<10|r-56320)}else o&&(e-=3)>-1&&i.push(239,191,189);if(o=null,r<128){if((e-=1)<0)break;i.push(r)}else if(r<2048){if((e-=2)<0)break;i.push(r>>6|192,63&r|128)}else if(r<65536){if((e-=3)<0)break;i.push(r>>12|224,r>>6&63|128,63&r|128)}else{if(!(r<1114112))throw new Error("Invalid code point");if((e-=4)<0)break;i.push(r>>18|240,r>>12&63|128,r>>6&63|128,63&r|128)}}return i}function N(t){return e.toByteArray(function(t){if((t=(t=t.split("=")[0]).trim().replace(C,"")).length<2)return"";for(;t.length%4!=0;)t+="=";return t}(t))}function q(t,e,r,n){for(var o=0;o<n&&!(o+r>=e.length||o>=t.length);++o)e[o+r]=t[o];return o}function j(t,e){return t instanceof e||null!=t&&null!=t.constructor&&null!=t.constructor.name&&t.constructor.name===e.name}function P(t){return t!=t}}).call(this)}).call(this,t("buffer").Buffer)},{"base64-js":1,buffer:2,ieee754:3}],3:[function(t,e,r){r.read=function(t,e,r,n,o){var i,s,f=8*o-n-1,a=(1<<f)-1,u=a>>1,c=-7,h=r?o-1:0,l=r?-1:1,p=t[e+h];for(h+=l,i=p&(1<<-c)-1,p>>=-c,c+=f;c>0;i=256*i+t[e+h],h+=l,c-=8);for(s=i&(1<<-c)-1,i>>=-c,c+=n;c>0;s=256*s+t[e+h],h+=l,c-=8);if(0===i)i=1-u;else{if(i===a)return s?NaN:1/0*(p?-1:1);s+=Math.pow(2,n),i-=u}return(p?-1:1)*s*Math.pow(2,i-n)},r.write=function(t,e,r,n,o,i){var s,f,a,u=8*i-o-1,c=(1<<u)-1,h=c>>1,l=23===o?Math.pow(2,-24)-Math.pow(2,-77):0,p=n?0:i-1,y=n?1:-1,g=e<0||0===e&&1/e<0?1:0;for(e=Math.abs(e),isNaN(e)||e===1/0?(f=isNaN(e)?1:0,s=c):(s=Math.floor(Math.log(e)/Math.LN2),e*(a=Math.pow(2,-s))<1&&(s--,a*=2),(e+=s+h>=1?l/a:l*Math.pow(2,1-h))*a>=2&&(s++,a/=2),s+h>=c?(f=0,s=c):s+h>=1?(f=(e*a-1)*Math.pow(2,o),s+=h):(f=e*Math.pow(2,h-1)*Math.pow(2,o),s=0));o>=8;t[r+p]=255&f,p+=y,f/=256,o-=8);for(s=s<<o|f,u+=o;u>0;t[r+p]=255&s,p+=y,s/=256,u-=8);t[r+p-y]|=128*g}},{}],4:[function(t,e,r){const n=t("./aux/eventEmitter"),o=t("../../lib/subprotocol/jsonRWS"),i=t("../../lib/helper");class s{constructor(t){this.wcOpts=t,this.wsocket,this.socketID,this.attempt=1}connect(){const t=this.wcOpts.wsURL;return this.wsocket=new WebSocket(t,this.wcOpts.subprotocols),this.onEvents(),new Promise(t=>{n.once("connected",()=>{t(this.wsocket)})})}disconnect(){this.wsocket&&this.wsocket.close(),this.blockReconnect()}async reconnect(){const t=this.wcOpts.reconnectAttempts,e=this.wcOpts.reconnectDelay;this.attempt<=t&&(await i.sleep(e),this.connect(),console.log(`Reconnect attempt #${this.attempt} of ${t} in ${e}ms`),this.attempt++)}blockReconnect(){this.attempt=this.wcOpts.reconnectAttempts+1}onEvents(){this.wsocket.onopen=(async t=>{this.onMessage(),console.log("WS Connection opened"),this.attempt=1,this.socketID=await this.infoSocketId(),console.log(`socketID: ${this.socketID}`),n.emit("connected")}),this.wsocket.onclose=(t=>{console.log("WS Connection closed"),delete this.wsocket,delete this.socketID,this.reconnect()}),this.wsocket.onerror=(t=>{})}onMessage(){this.wsocket.onmessage=(t=>{try{const e=t.data;this.debugger("Received::",e);const r=o.incoming(e),i={msg:r,msgSTR:e};"route"===r.cmd?n.emit("route",i):"info/socket/id"===r.cmd?n.emit("question",i):"info/socket/list"===r.cmd?n.emit("question",i):"info/room/list"===r.cmd?n.emit("question",i):"info/room/listmy"===r.cmd?n.emit("question",i):n.emit("message",i)}catch(t){console.error(t)}})}question(t){const e=this.socketID;return this.carryOut(e,t,void 0),new Promise(async(e,r)=>{this.once("question",async(n,o)=>{n.cmd===t?e(n):r(new Error("Received cmd is not same as sent cmd."))}),await i.sleep(this.wcOpts.questionTimeout),r(new Error(`No answer for the question: ${t}`))})}async infoSocketId(){const t=await this.question("info/socket/id");return this.socketID=+t.payload,this.socketID}async infoSocketList(){return(await this.question("info/socket/list")).payload}async infoRoomList(){return(await this.question("info/room/list")).payload}async infoRoomListmy(){return(await this.question("info/room/listmy")).payload}async carryOut(t,e,r){t||(t=0);const n={id:i.generateID(),from:+this.socketID,to:t,cmd:e,payload:r},s=o.outgoing(n);if(this.debugger("Sent::",s),!s||!this.wsocket||1!==this.wsocket.readyState)throw new Error("The message is not defined or the client is disconnected.");await new Promise(t=>setTimeout(t,10)),await this.wsocket.send(s)}async sendOne(t,e){const r=e;await this.carryOut(t,"socket/sendone",r)}async send(t,e){const r=e;await this.carryOut(t,"socket/send",r)}async broadcast(t){const e=t;await this.carryOut(0,"socket/broadcast",e)}async sendAll(t){const e=t;await this.carryOut(0,"socket/sendall",e)}async roomEnter(t){const e=t;await this.carryOut(0,"room/enter",e)}async roomExit(t){const e=t;await this.carryOut(0,"room/exit",e)}async roomExitAll(){await this.carryOut(0,"room/exitall",void 0)}async roomSend(t,e){const r=t,n=e;await this.carryOut(r,"room/send",n)}async setNick(t){const e=t;await this.carryOut(0,"socket/nick",e)}async route(t,e){const r={uri:t,body:e};await this.carryOut(0,"route",r)}on(t,e){return n.on(t,t=>{e.call(null,t.detail.msg,t.detail.msgSTR)})}once(t,e){return n.on(t,t=>{e.call(null,t.detail.msg,t.detail.msgSTR)})}off(t){return n.off(t)}debugger(...t){const e=t.join("");this.wcOpts.debug&&console.log(e)}}window.regochWebsocket={Client13jsonRWS:s},e.exports=s},{"../../lib/helper":6,"../../lib/subprotocol/jsonRWS":7,"./aux/eventEmitter":5}],5:[function(t,e,r){e.exports=new class{constructor(){this.activeOns=[]}emit(t,e){const r=new CustomEvent(t,{detail:e});window.dispatchEvent(r)}on(t,e){const r=t=>{e(t)};let n=0;for(const e of this.activeOns)e.eventName===t&&e.listenerCB.toString()===r.toString()&&(window.removeEventListener(t,e.listenerCB),this.activeOns.splice(n,1)),n++;this.activeOns.push({eventName:t,listenerCB:r}),window.addEventListener(t,r)}once(t,e){const r=n=>{e(n),window.removeEventListener(t,r)};window.addEventListener(t,r,{once:!0})}off(t){let e=0;for(const r of this.activeOns)r.eventName===t&&(window.removeEventListener(t,r.listenerCB),this.activeOns.splice(e,1)),e++}getListeners(){return{...this.activeOns}}}},{}],6:[function(t,e,r){(function(t){(function(){e.exports=new class{getMessageSize(e){return+t.byteLength(e,"utf8")}getMessageSizeFromBlob(t){return+new Blob([t]).size}generateID(){const t=1e3*Math.random(),e=Math.floor(t);return+((new Date).toISOString().replace(/^20/,"").replace(/\-/g,"").replace(/\:/g,"").replace("T","").replace("Z","").replace(".","")+e)}nowTime(){const t=new Date;return new Intl.DateTimeFormat("en-us",{weekday:"long",year:"numeric",month:"numeric",day:"numeric",hour:"numeric",minute:"numeric",second:"numeric",fractionalSecondDigits:3,hour12:!1,timeZone:"UTC"}).format(t)}async sleep(t){await new Promise(e=>setTimeout(e,t))}printBuffer(t){console.log(t.toString("hex").match(/../g).join(" "))}}}).call(this)}).call(this,t("buffer").Buffer)},{buffer:2}],7:[function(t,e,r){e.exports=new class{constructor(){this.delimiter="<<!END!>>"}incoming(t){let e,r=!1;try{t=t.replace(this.delimiter,""),e=JSON.parse(t);const n=Object.keys(e);r=this._testFields(n)}catch(t){r=!1}if(r)return e;throw new Error(`Incoming message doesn't have valid "jsonRWS" subprotocol format. msg:: "${t}"`)}outgoing(t){const e=Object.keys(t);if(this._testFields(e))return JSON.stringify(t)+this.delimiter;throw new Error(`Outgoing message doesn't have valid "jsonRWS" subprotocol format. msg:: ${JSON.stringify(t)}`)}async process(t,e,r,n,o){t.id,t.from;const i=t.to,s=t.cmd,f=t.payload;if("socket/sendone"===s){const e=+t.to,o=await n.findOne({id:e});r.sendOne(t,o)}else if("socket/send"===s){const e=i.map(t=>+t),o=await n.find({id:{$in:e}});r.send(t,o)}else if("socket/broadcast"===s)r.broadcast(t,e);else if("socket/sendall"===s)r.sendAll(t);else if("socket/nick"===s){const r=t.payload;try{await n.setNick(e,r),t.payload=e.extension.nickname}catch(e){t.cmd="error",t.payload=e.message}e.extension.sendSelf(t)}else if("room/enter"===s){const r=f;n.roomEnter(e,r),t.payload=`Entered in the room '${r}'`,e.extension.sendSelf(t)}else if("room/exit"===s){const r=f;n.roomExit(e,f),t.payload=`Exited from the room '${r}'`,e.extension.sendSelf(t)}else if("room/exitall"===s)n.roomExitAll(e),t.payload="Exited from all rooms",e.extension.sendSelf(t);else if("room/send"===s){const n=i;r.sendRoom(t,e,n)}else if("route"===s)o.emit("route",t,e,r,n,o);else if("info/socket/id"===s)t.payload=e.extension.id,e.extension.sendSelf(t);else if("info/socket/list"===s){const r=(await n.find()).map(t=>({id:t.extension.id,nickname:t.extension.nickname}));t.payload=r,e.extension.sendSelf(t)}else if("info/room/list"===s){const r=await n.roomList();t.payload=r,e.extension.sendSelf(t)}else if("info/room/listmy"===s){const r=await n.roomListOf(t.from);t.payload=r,e.extension.sendSelf(t)}}_testFields(t){const e=["id","from","to","cmd","payload"],r=["id","from","to","cmd"];let n=!0;for(const r of t)if(-1===e.indexOf(r)){n=!1;break}for(const e of r)if(-1===t.indexOf(e)){n=!1;break}return n}}},{}]},{},[4]);
//# sourceMappingURL=client13jsonRWS-min.js.map
