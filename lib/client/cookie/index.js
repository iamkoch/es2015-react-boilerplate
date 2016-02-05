import { Buffer } from 'buffer';

function createCookie(name, value, days) {
  let expires = '';
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    expires = `; expires=${date.toGMTString()}`;
  }

  document.cookie = `${name}=${value}${expires}; path=/`;
}

function readCookie(name) {
  const nameEQ = `${name}=`;
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') {
      c = c.substring(1, c.length);
    }
    if (c.indexOf(nameEQ) === 0) {
      return c.substring(nameEQ.length, c.length);
    }
  }
  return null;
}

function encode(str) {
  return new Buffer(str).toString('base64');
}

function decode(str) {
  return new Buffer(str, 'base64').toString();
}

function eraseCookie(name) {
  createCookie(name, '', -1);
}

export default class Session {
  save(key, value, days) {
    const val = (typeof value !== 'object' ? value : JSON.stringify(value));

    createCookie(key, encode(val), days);
  }

  get(key, returnAsObject) {
    const result = readCookie(key);
    if (result === null) {
      return null;
    }

    const decoded = decode(result);

    if (returnAsObject) {
      return JSON.parse(decoded);
    }

    return decoded;
  }

  remove(key) {
    eraseCookie(key);
  }
}
