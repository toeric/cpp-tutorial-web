/**
 * storage.js — localStorage wrapper with QuotaExceededError handling
 * All keys are namespaced with cpp_tutorial__
 */

const NS = 'cpp_tutorial__';

var storage = {
  get(key, fallback = null) {
    try {
      const raw = localStorage.getItem(NS + key);
      return raw === null ? fallback : JSON.parse(raw);
    } catch {
      return fallback;
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(NS + key, JSON.stringify(value));
      return true;
    } catch (e) {
      if (e.name === 'QuotaExceededError') {
        console.warn('[storage] QuotaExceededError — could not save:', key);
      }
      return false;
    }
  },

  update(key, updater, fallback = {}) {
    const current = this.get(key, fallback);
    const next = updater(current);
    return this.set(key, next);
  },

  remove(key) {
    try {
      localStorage.removeItem(NS + key);
      return true;
    } catch {
      return false;
    }
  },

  clear() {
    try {
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(NS)) keysToRemove.push(k);
      }
      keysToRemove.forEach(k => localStorage.removeItem(k));
    } catch { /* ignore */ }
  }
};
