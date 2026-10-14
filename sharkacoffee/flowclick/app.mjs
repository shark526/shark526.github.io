export const UUID = {
  service: 'a8f10001-7c3e-4b8a-9a62-5f10c04c0001',
  config: 'a8f10002-7c3e-4b8a-9a62-5f10c04c0001',
  status: 'a8f10003-7c3e-4b8a-9a62-5f10c04c0001'
};
export const defaultFrame = () => Uint8Array.of(2, 0, 0, 0, 1, 8, 11, 0, 1, 12, 14, 0, 1, 0, 40, 0, 1, 1, 40, 0);
export const idleSleepSeconds = frame => frame[2] | frame[3] << 8;
export function setIdleSleepSeconds(frame, seconds) {
  if (!Number.isInteger(seconds) || (seconds !== 0 && (seconds < 30 || seconds > 3600))) throw new Error('Idle sleep must be disabled or between 30 and 3600 seconds.');
  frame[2] = seconds & 255;
  frame[3] = seconds >> 8;
  return frame;
}
export function validateFrame(frame) {
  if (frame.length !== 20 || frame[0] !== 2) throw new Error('Unsupported configuration frame. Update the device firmware and reload the page.');
  const seconds = idleSleepSeconds(frame);
  if (seconds !== 0 && (seconds < 30 || seconds > 3600)) throw new Error('Invalid idle sleep timeout.');
  for (let offset = 4; offset < 20; offset += 4) {
    if (frame[offset] > 1 || frame[offset + 2] < 4 || frame[offset + 2] > 0x52 || frame[offset + 3]) throw new Error('Invalid key mapping.');
  }
  return frame;
}
const bytes = value => new Uint8Array(value.buffer, value.byteOffset, value.byteLength).slice();
const errors = ['Saved', 'Invalid configuration.', 'Configuration window closed. Hold VOICE + ALLOW for three seconds.', 'Device is busy. Read the current mapping before retrying.', 'Device storage failed. The previous mapping remains active.'];

export class GattClient {
  constructor({ timeout = 8000, onDisconnect = () => {}, onStatus = () => {} } = {}) {
    this.timeout = timeout;
    this.onDisconnect = onDisconnect;
    this.onStatus = onStatus;
    this.queue = Promise.resolve();
    this.transaction = 0;
    this.pending = null;
    this.device = null;
    this.config = null;
    this.status = null;
    this.handleStatus = event => {
      const data = bytes(event.target.value);
      if (data.length !== 4 || data[0] !== 1 || data[2] > 4 || data[3] > 1) return;
      this.onStatus(Boolean(data[3]));
      if (this.pending && data[1] === this.pending.transaction) {
        if (data[2] === 0) this.pending.resolve();
        else this.pending.reject(new Error(errors[data[2]]));
      }
    };
    this.handleDisconnect = () => {
      this.clear(new Error('Device disconnected. Save outcome is unknown; reconnect and read.'));
      this.onDisconnect();
    };
  }
  clear(error) {
    this.pending?.reject(error);
    this.pending = null;
    this.status?.removeEventListener('characteristicvaluechanged', this.handleStatus);
    this.device?.removeEventListener('gattserverdisconnected', this.handleDisconnect);
    this.config = null;
    this.status = null;
  }
  disconnect() {
    const device = this.device;
    this.clear(new Error('Disconnected. Save outcome is unknown; reconnect and read.'));
    this.device = null;
    device?.gatt.disconnect();
    this.onDisconnect();
  }
  async connect(device) {
    this.disconnect();
    this.device = device;
    device.addEventListener('gattserverdisconnected', this.handleDisconnect);
    try {
      const server = await device.gatt.connect();
      const service = await server.getPrimaryService(UUID.service);
      this.config = await service.getCharacteristic(UUID.config);
      this.status = await service.getCharacteristic(UUID.status);
      this.status.addEventListener('characteristicvaluechanged', this.handleStatus);
      await this.status.startNotifications();
      const status = bytes(await this.status.readValue());
      if (status.length !== 4 || status[0] !== 1 || status[2] > 4 || status[3] > 1) throw new Error('Unsupported device status.');
      this.onStatus(Boolean(status[3]));
      return await this.read();
    } catch (error) {
      this.disconnect();
      throw error;
    }
  }
  enqueue(work) {
    const operation = this.queue.then(work, work);
    this.queue = operation.catch(() => {});
    return operation;
  }
  async readCurrent() {
    if (!this.config) throw new Error('Connect to FlowClick first.');
    const characteristic = this.config;
    const value = await characteristic.readValue();
    if (characteristic !== this.config) throw new Error('Device disconnected during read. Reconnect and read again.');
    const frame = validateFrame(bytes(value));
    this.transaction = frame[1];
    return frame;
  }
  read() { return this.enqueue(() => this.readCurrent()); }
  save(input) {
    const frame = validateFrame(input.slice());
    return this.enqueue(async () => {
      if (!this.config) throw new Error('Connect to FlowClick first.');
      this.transaction = this.transaction % 255 + 1;
      frame[1] = this.transaction;
      let timer;
      const acknowledgement = new Promise((resolve, reject) => {
        this.pending = { transaction: frame[1], resolve, reject };
        timer = setTimeout(() => reject(new Error('Save timed out. Outcome is unknown; read the device before retrying.')), this.timeout);
      });
      try {
        await Promise.all([acknowledgement, this.config.writeValueWithResponse(frame)]);
        const committed = await this.readCurrent();
        if (!committed.every((value, index) => value === frame[index])) throw new Error('Save readback mismatch. Read the device before retrying.');
        return committed;
      } finally {
        clearTimeout(timer);
        this.pending = null;
      }
    });
  }
}

export const keyOptions = (() => {
  const options = [];
  for (let index = 0; index < 26; ++index) options.push([4 + index, String.fromCharCode(65 + index)]);
  for (let index = 0; index < 10; ++index) options.push([30 + index, String((index + 1) % 10)]);
  ['Enter', 'Escape', 'Backspace', 'Tab', 'Space', '-', '=', '[', ']', 'Backslash', 'ISO #', ';', "'", 'Grave', ',', '.', '/', 'Caps Lock'].forEach((name, index) => options.push([40 + index, name]));
  for (let index = 0; index < 12; ++index) options.push([58 + index, `F${index + 1}`]);
  ['Print Screen', 'Scroll Lock', 'Pause', 'Insert', 'Home', 'Page Up', 'Delete', 'End', 'Page Down', 'Right', 'Left', 'Down', 'Up'].forEach((name, index) => options.push([70 + index, name]));
  return options;
})();

if (typeof document !== 'undefined') {
  const byId = id => document.getElementById(id);
  let draft = defaultFrame();
  let committed = null;
  let busy = false;
  let connected = false;
  let configuring = false;
  let known = false;
  let outcome = 'Not loaded';
  const names = ['VOICE', 'MUTE', 'ENTER', 'ALLOW'];
  const icons = ['mic', 'mic-off', 'corner-down-left', 'shield-check'];
  const modifiers = [['Ctrl', 1], ['Shift', 2], ['Alt', 4], ['Win', 8], ['R Ctrl', 16], ['R Shift', 32], ['R Alt', 64], ['R Win', 128]];
  function dirty() { return !committed || !draft.slice(2).every((value, index) => value === committed[index + 2]); }
  function render() {
    byId('connection-state').textContent = connected ? 'Connected' : 'Disconnected';
    byId('connection-state').classList.toggle('connected', connected);
    byId('mode').textContent = connected ? (configuring ? 'Configuration open' : 'Keyboard mode') : 'No device';
    byId('connect').disabled = busy || connected;
    byId('disconnect').disabled = !connected;
    byId('read').disabled = busy || !connected;
    byId('reset').disabled = busy || !connected || !configuring || !known;
    byId('save').disabled = busy || !connected || !configuring || !known || !dirty();
    byId('save-state').textContent = busy ? 'Working...' : (known && dirty() ? 'Unsaved changes' : outcome);
    byId('mappings').querySelectorAll('input, select').forEach(control => { control.disabled = busy || !connected || !configuring || !known; });
  }
  function fill() {
    const idleSleep = byId('idle-sleep');
    const seconds = idleSleepSeconds(draft);
    if (![...idleSleep.options].some(option => Number(option.value) === seconds)) idleSleep.add(new Option(`${seconds} seconds`, seconds));
    idleSleep.value = seconds;
    byId('rows').replaceChildren();
    names.forEach((name, index) => {
      const offset = 4 + index * 4;
      const row = document.createElement('div');
      row.className = 'key-row';
      row.innerHTML = `<div class="key-label"><span class="keycap"><i data-lucide="${icons[index]}" aria-hidden="true"></i></span><div><strong class="key-name">${name}</strong><span class="pin">KEY ${index + 1} / GPIO ${index + 3}</span></div></div><div class="modifiers"></div><select class="key-select" aria-label="${name} main key"></select><label class="active"><input type="checkbox" aria-label="${name} active"></label>`;
      modifiers.forEach(([label, bit]) => {
        const modifier = document.createElement('label');
        modifier.className = 'modifier';
        modifier.innerHTML = `<input type="checkbox" aria-label="${name} ${label}"><span>${label}</span>`;
        const input = modifier.querySelector('input');
        input.checked = Boolean(draft[offset + 1] & bit);
        input.addEventListener('change', () => { draft[offset + 1] = input.checked ? draft[offset + 1] | bit : draft[offset + 1] & ~bit; render(); });
        row.querySelector('.modifiers').append(modifier);
      });
      const select = row.querySelector('select');
      if (index === 0) select.title = 'Short press mapping; hold VOICE 2s to clear the entire focused field';
      keyOptions.forEach(([usage, label]) => select.add(new Option(label, usage)));
      select.value = draft[offset + 2];
      select.addEventListener('change', () => { draft[offset + 2] = Number(select.value); render(); });
      const active = row.querySelector('.active input');
      active.checked = Boolean(draft[offset]);
      active.addEventListener('change', () => { draft[offset] = Number(active.checked); render(); });
      byId('rows').append(row);
    });
    globalThis.lucide?.createIcons();
    render();
  }
  function showError(error) { byId('message').hidden = false; byId('message').textContent = error.message; }
  async function perform(work) {
    busy = true;
    byId('message').hidden = true;
    render();
    try { await work(); } catch (error) { showError(error); } finally { busy = false; render(); }
  }
  function load(frame) { committed = frame.slice(); draft = frame.slice(); known = true; outcome = 'Synced with device'; fill(); }
  function confirm(title, text) {
    byId('confirm-title').textContent = title;
    byId('confirm-text').textContent = text;
    const dialog = byId('confirm-dialog');
    dialog.returnValue = 'cancel';
    return new Promise(resolve => {
      dialog.addEventListener('close', () => resolve(dialog.returnValue === 'confirm'), { once: true });
      dialog.showModal();
    });
  }
  const client = new GattClient({
    onDisconnect: () => { connected = false; configuring = false; known = false; outcome = 'Disconnected / not synced'; render(); },
    onStatus: open => { configuring = open; render(); }
  });
  byId('connect').addEventListener('click', () => perform(async () => {
    if (!globalThis.isSecureContext || !navigator.bluetooth) throw new Error('Web Bluetooth requires desktop Chrome/Edge over HTTPS or localhost.');
    const device = await navigator.bluetooth.requestDevice({ filters: [{ name: 'FlowClick' }, { services: [UUID.service] }], optionalServices: [UUID.service] });
    const frame = await client.connect(device);
    connected = true;
    load(frame);
  }));
  byId('disconnect').addEventListener('click', () => client.disconnect());
  byId('read').addEventListener('click', () => perform(async () => {
    if (known && dirty() && !await confirm('Discard changes?', 'Replace unsaved edits with the current device mapping?')) return;
    load(await client.read());
  }));
  byId('save').addEventListener('click', () => perform(async () => {
    try { load(await client.save(draft)); outcome = 'Saved to device'; }
    catch (error) { known = false; outcome = 'Save not confirmed / read required'; throw error; }
  }));
  byId('reset').addEventListener('click', () => perform(async () => {
    if (!await confirm('Restore defaults?', 'Restore all four key mappings and disable idle sleep?')) return;
    try { load(await client.save(defaultFrame())); outcome = 'Defaults saved'; }
    catch (error) { known = false; outcome = 'Save not confirmed / read required'; throw error; }
  }));
  byId('mappings').addEventListener('submit', event => event.preventDefault());
  byId('idle-sleep').addEventListener('change', event => {
    setIdleSleepSeconds(draft, Number(event.target.value));
    render();
  });
  addEventListener('beforeunload', event => { if (known && dirty()) { event.preventDefault(); event.returnValue = ''; } });
  fill();
  if (!globalThis.isSecureContext || !navigator.bluetooth) showError(new Error('Web Bluetooth requires desktop Chrome/Edge over HTTPS or localhost.'));
}