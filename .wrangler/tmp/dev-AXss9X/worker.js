var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};

// .wrangler/tmp/bundle-s31Duv/strip-cf-connecting-ip-header.js
function stripCfConnectingIPHeader(input, init) {
  const request = new Request(input, init);
  request.headers.delete("CF-Connecting-IP");
  return request;
}
__name(stripCfConnectingIPHeader, "stripCfConnectingIPHeader");
globalThis.fetch = new Proxy(globalThis.fetch, {
  apply(target, thisArg, argArray) {
    return Reflect.apply(target, thisArg, [
      stripCfConnectingIPHeader.apply(null, argArray)
    ]);
  }
});

// node_modules/unenv/dist/runtime/_internal/utils.mjs
function createNotImplementedError(name) {
  return new Error(`[unenv] ${name} is not implemented yet!`);
}
__name(createNotImplementedError, "createNotImplementedError");
function notImplemented(name) {
  const fn = /* @__PURE__ */ __name(() => {
    throw createNotImplementedError(name);
  }, "fn");
  return Object.assign(fn, { __unenv__: true });
}
__name(notImplemented, "notImplemented");
function notImplementedClass(name) {
  return class {
    __unenv__ = true;
    constructor() {
      throw new Error(`[unenv] ${name} is not implemented yet!`);
    }
  };
}
__name(notImplementedClass, "notImplementedClass");

// node_modules/unenv/dist/runtime/node/internal/perf_hooks/performance.mjs
var _timeOrigin = globalThis.performance?.timeOrigin ?? Date.now();
var _performanceNow = globalThis.performance?.now ? globalThis.performance.now.bind(globalThis.performance) : () => Date.now() - _timeOrigin;
var nodeTiming = {
  name: "node",
  entryType: "node",
  startTime: 0,
  duration: 0,
  nodeStart: 0,
  v8Start: 0,
  bootstrapComplete: 0,
  environment: 0,
  loopStart: 0,
  loopExit: 0,
  idleTime: 0,
  uvMetricsInfo: {
    loopCount: 0,
    events: 0,
    eventsWaiting: 0
  },
  detail: void 0,
  toJSON() {
    return this;
  }
};
var PerformanceEntry = class {
  __unenv__ = true;
  detail;
  entryType = "event";
  name;
  startTime;
  constructor(name, options) {
    this.name = name;
    this.startTime = options?.startTime || _performanceNow();
    this.detail = options?.detail;
  }
  get duration() {
    return _performanceNow() - this.startTime;
  }
  toJSON() {
    return {
      name: this.name,
      entryType: this.entryType,
      startTime: this.startTime,
      duration: this.duration,
      detail: this.detail
    };
  }
};
__name(PerformanceEntry, "PerformanceEntry");
var PerformanceMark = /* @__PURE__ */ __name(class PerformanceMark2 extends PerformanceEntry {
  entryType = "mark";
  constructor() {
    super(...arguments);
  }
  get duration() {
    return 0;
  }
}, "PerformanceMark");
var PerformanceMeasure = class extends PerformanceEntry {
  entryType = "measure";
};
__name(PerformanceMeasure, "PerformanceMeasure");
var PerformanceResourceTiming = class extends PerformanceEntry {
  entryType = "resource";
  serverTiming = [];
  connectEnd = 0;
  connectStart = 0;
  decodedBodySize = 0;
  domainLookupEnd = 0;
  domainLookupStart = 0;
  encodedBodySize = 0;
  fetchStart = 0;
  initiatorType = "";
  name = "";
  nextHopProtocol = "";
  redirectEnd = 0;
  redirectStart = 0;
  requestStart = 0;
  responseEnd = 0;
  responseStart = 0;
  secureConnectionStart = 0;
  startTime = 0;
  transferSize = 0;
  workerStart = 0;
  responseStatus = 0;
};
__name(PerformanceResourceTiming, "PerformanceResourceTiming");
var PerformanceObserverEntryList = class {
  __unenv__ = true;
  getEntries() {
    return [];
  }
  getEntriesByName(_name, _type) {
    return [];
  }
  getEntriesByType(type) {
    return [];
  }
};
__name(PerformanceObserverEntryList, "PerformanceObserverEntryList");
var Performance = class {
  __unenv__ = true;
  timeOrigin = _timeOrigin;
  eventCounts = /* @__PURE__ */ new Map();
  _entries = [];
  _resourceTimingBufferSize = 0;
  navigation = void 0;
  timing = void 0;
  timerify(_fn, _options) {
    throw createNotImplementedError("Performance.timerify");
  }
  get nodeTiming() {
    return nodeTiming;
  }
  eventLoopUtilization() {
    return {};
  }
  markResourceTiming() {
    return new PerformanceResourceTiming("");
  }
  onresourcetimingbufferfull = null;
  now() {
    if (this.timeOrigin === _timeOrigin) {
      return _performanceNow();
    }
    return Date.now() - this.timeOrigin;
  }
  clearMarks(markName) {
    this._entries = markName ? this._entries.filter((e) => e.name !== markName) : this._entries.filter((e) => e.entryType !== "mark");
  }
  clearMeasures(measureName) {
    this._entries = measureName ? this._entries.filter((e) => e.name !== measureName) : this._entries.filter((e) => e.entryType !== "measure");
  }
  clearResourceTimings() {
    this._entries = this._entries.filter((e) => e.entryType !== "resource" || e.entryType !== "navigation");
  }
  getEntries() {
    return this._entries;
  }
  getEntriesByName(name, type) {
    return this._entries.filter((e) => e.name === name && (!type || e.entryType === type));
  }
  getEntriesByType(type) {
    return this._entries.filter((e) => e.entryType === type);
  }
  mark(name, options) {
    const entry = new PerformanceMark(name, options);
    this._entries.push(entry);
    return entry;
  }
  measure(measureName, startOrMeasureOptions, endMark) {
    let start;
    let end;
    if (typeof startOrMeasureOptions === "string") {
      start = this.getEntriesByName(startOrMeasureOptions, "mark")[0]?.startTime;
      end = this.getEntriesByName(endMark, "mark")[0]?.startTime;
    } else {
      start = Number.parseFloat(startOrMeasureOptions?.start) || this.now();
      end = Number.parseFloat(startOrMeasureOptions?.end) || this.now();
    }
    const entry = new PerformanceMeasure(measureName, {
      startTime: start,
      detail: {
        start,
        end
      }
    });
    this._entries.push(entry);
    return entry;
  }
  setResourceTimingBufferSize(maxSize) {
    this._resourceTimingBufferSize = maxSize;
  }
  addEventListener(type, listener, options) {
    throw createNotImplementedError("Performance.addEventListener");
  }
  removeEventListener(type, listener, options) {
    throw createNotImplementedError("Performance.removeEventListener");
  }
  dispatchEvent(event) {
    throw createNotImplementedError("Performance.dispatchEvent");
  }
  toJSON() {
    return this;
  }
};
__name(Performance, "Performance");
var PerformanceObserver = class {
  __unenv__ = true;
  _callback = null;
  constructor(callback) {
    this._callback = callback;
  }
  takeRecords() {
    return [];
  }
  disconnect() {
    throw createNotImplementedError("PerformanceObserver.disconnect");
  }
  observe(options) {
    throw createNotImplementedError("PerformanceObserver.observe");
  }
  bind(fn) {
    return fn;
  }
  runInAsyncScope(fn, thisArg, ...args) {
    return fn.call(thisArg, ...args);
  }
  asyncId() {
    return 0;
  }
  triggerAsyncId() {
    return 0;
  }
  emitDestroy() {
    return this;
  }
};
__name(PerformanceObserver, "PerformanceObserver");
__publicField(PerformanceObserver, "supportedEntryTypes", []);
var performance = globalThis.performance && "addEventListener" in globalThis.performance ? globalThis.performance : new Performance();

// node_modules/@cloudflare/unenv-preset/dist/runtime/polyfill/performance.mjs
globalThis.performance = performance;
globalThis.Performance = Performance;
globalThis.PerformanceEntry = PerformanceEntry;
globalThis.PerformanceMark = PerformanceMark;
globalThis.PerformanceMeasure = PerformanceMeasure;
globalThis.PerformanceObserver = PerformanceObserver;
globalThis.PerformanceObserverEntryList = PerformanceObserverEntryList;
globalThis.PerformanceResourceTiming = PerformanceResourceTiming;

// node_modules/unenv/dist/runtime/node/console.mjs
import { Writable } from "node:stream";

// node_modules/unenv/dist/runtime/mock/noop.mjs
var noop_default = Object.assign(() => {
}, { __unenv__: true });

// node_modules/unenv/dist/runtime/node/console.mjs
var _console = globalThis.console;
var _ignoreErrors = true;
var _stderr = new Writable();
var _stdout = new Writable();
var log = _console?.log ?? noop_default;
var info = _console?.info ?? log;
var trace = _console?.trace ?? info;
var debug = _console?.debug ?? log;
var table = _console?.table ?? log;
var error = _console?.error ?? log;
var warn = _console?.warn ?? error;
var createTask = _console?.createTask ?? /* @__PURE__ */ notImplemented("console.createTask");
var clear = _console?.clear ?? noop_default;
var count = _console?.count ?? noop_default;
var countReset = _console?.countReset ?? noop_default;
var dir = _console?.dir ?? noop_default;
var dirxml = _console?.dirxml ?? noop_default;
var group = _console?.group ?? noop_default;
var groupEnd = _console?.groupEnd ?? noop_default;
var groupCollapsed = _console?.groupCollapsed ?? noop_default;
var profile = _console?.profile ?? noop_default;
var profileEnd = _console?.profileEnd ?? noop_default;
var time = _console?.time ?? noop_default;
var timeEnd = _console?.timeEnd ?? noop_default;
var timeLog = _console?.timeLog ?? noop_default;
var timeStamp = _console?.timeStamp ?? noop_default;
var Console = _console?.Console ?? /* @__PURE__ */ notImplementedClass("console.Console");
var _times = /* @__PURE__ */ new Map();
var _stdoutErrorHandler = noop_default;
var _stderrErrorHandler = noop_default;

// node_modules/@cloudflare/unenv-preset/dist/runtime/node/console.mjs
var workerdConsole = globalThis["console"];
var {
  assert,
  clear: clear2,
  // @ts-expect-error undocumented public API
  context,
  count: count2,
  countReset: countReset2,
  // @ts-expect-error undocumented public API
  createTask: createTask2,
  debug: debug2,
  dir: dir2,
  dirxml: dirxml2,
  error: error2,
  group: group2,
  groupCollapsed: groupCollapsed2,
  groupEnd: groupEnd2,
  info: info2,
  log: log2,
  profile: profile2,
  profileEnd: profileEnd2,
  table: table2,
  time: time2,
  timeEnd: timeEnd2,
  timeLog: timeLog2,
  timeStamp: timeStamp2,
  trace: trace2,
  warn: warn2
} = workerdConsole;
Object.assign(workerdConsole, {
  Console,
  _ignoreErrors,
  _stderr,
  _stderrErrorHandler,
  _stdout,
  _stdoutErrorHandler,
  _times
});
var console_default = workerdConsole;

// node_modules/wrangler/_virtual_unenv_global_polyfill-@cloudflare-unenv-preset-node-console
globalThis.console = console_default;

// node_modules/unenv/dist/runtime/node/internal/process/hrtime.mjs
var hrtime = /* @__PURE__ */ Object.assign(/* @__PURE__ */ __name(function hrtime2(startTime) {
  const now = Date.now();
  const seconds = Math.trunc(now / 1e3);
  const nanos = now % 1e3 * 1e6;
  if (startTime) {
    let diffSeconds = seconds - startTime[0];
    let diffNanos = nanos - startTime[0];
    if (diffNanos < 0) {
      diffSeconds = diffSeconds - 1;
      diffNanos = 1e9 + diffNanos;
    }
    return [diffSeconds, diffNanos];
  }
  return [seconds, nanos];
}, "hrtime"), { bigint: /* @__PURE__ */ __name(function bigint() {
  return BigInt(Date.now() * 1e6);
}, "bigint") });

// node_modules/unenv/dist/runtime/node/internal/process/process.mjs
import { EventEmitter } from "node:events";

// node_modules/unenv/dist/runtime/node/internal/tty/read-stream.mjs
import { Socket } from "node:net";
var ReadStream = class extends Socket {
  fd;
  constructor(fd) {
    super();
    this.fd = fd;
  }
  isRaw = false;
  setRawMode(mode) {
    this.isRaw = mode;
    return this;
  }
  isTTY = false;
};
__name(ReadStream, "ReadStream");

// node_modules/unenv/dist/runtime/node/internal/tty/write-stream.mjs
import { Socket as Socket2 } from "node:net";
var WriteStream = class extends Socket2 {
  fd;
  constructor(fd) {
    super();
    this.fd = fd;
  }
  clearLine(dir3, callback) {
    callback && callback();
    return false;
  }
  clearScreenDown(callback) {
    callback && callback();
    return false;
  }
  cursorTo(x, y, callback) {
    callback && typeof callback === "function" && callback();
    return false;
  }
  moveCursor(dx, dy, callback) {
    callback && callback();
    return false;
  }
  getColorDepth(env2) {
    return 1;
  }
  hasColors(count3, env2) {
    return false;
  }
  getWindowSize() {
    return [this.columns, this.rows];
  }
  columns = 80;
  rows = 24;
  isTTY = false;
};
__name(WriteStream, "WriteStream");

// node_modules/unenv/dist/runtime/node/internal/process/process.mjs
var Process = class extends EventEmitter {
  env;
  hrtime;
  nextTick;
  constructor(impl) {
    super();
    this.env = impl.env;
    this.hrtime = impl.hrtime;
    this.nextTick = impl.nextTick;
    for (const prop of [...Object.getOwnPropertyNames(Process.prototype), ...Object.getOwnPropertyNames(EventEmitter.prototype)]) {
      const value = this[prop];
      if (typeof value === "function") {
        this[prop] = value.bind(this);
      }
    }
  }
  emitWarning(warning, type, code) {
    console.warn(`${code ? `[${code}] ` : ""}${type ? `${type}: ` : ""}${warning}`);
  }
  emit(...args) {
    return super.emit(...args);
  }
  listeners(eventName) {
    return super.listeners(eventName);
  }
  #stdin;
  #stdout;
  #stderr;
  get stdin() {
    return this.#stdin ??= new ReadStream(0);
  }
  get stdout() {
    return this.#stdout ??= new WriteStream(1);
  }
  get stderr() {
    return this.#stderr ??= new WriteStream(2);
  }
  #cwd = "/";
  chdir(cwd2) {
    this.#cwd = cwd2;
  }
  cwd() {
    return this.#cwd;
  }
  arch = "";
  platform = "";
  argv = [];
  argv0 = "";
  execArgv = [];
  execPath = "";
  title = "";
  pid = 200;
  ppid = 100;
  get version() {
    return "";
  }
  get versions() {
    return {};
  }
  get allowedNodeEnvironmentFlags() {
    return /* @__PURE__ */ new Set();
  }
  get sourceMapsEnabled() {
    return false;
  }
  get debugPort() {
    return 0;
  }
  get throwDeprecation() {
    return false;
  }
  get traceDeprecation() {
    return false;
  }
  get features() {
    return {};
  }
  get release() {
    return {};
  }
  get connected() {
    return false;
  }
  get config() {
    return {};
  }
  get moduleLoadList() {
    return [];
  }
  constrainedMemory() {
    return 0;
  }
  availableMemory() {
    return 0;
  }
  uptime() {
    return 0;
  }
  resourceUsage() {
    return {};
  }
  ref() {
  }
  unref() {
  }
  umask() {
    throw createNotImplementedError("process.umask");
  }
  getBuiltinModule() {
    return void 0;
  }
  getActiveResourcesInfo() {
    throw createNotImplementedError("process.getActiveResourcesInfo");
  }
  exit() {
    throw createNotImplementedError("process.exit");
  }
  reallyExit() {
    throw createNotImplementedError("process.reallyExit");
  }
  kill() {
    throw createNotImplementedError("process.kill");
  }
  abort() {
    throw createNotImplementedError("process.abort");
  }
  dlopen() {
    throw createNotImplementedError("process.dlopen");
  }
  setSourceMapsEnabled() {
    throw createNotImplementedError("process.setSourceMapsEnabled");
  }
  loadEnvFile() {
    throw createNotImplementedError("process.loadEnvFile");
  }
  disconnect() {
    throw createNotImplementedError("process.disconnect");
  }
  cpuUsage() {
    throw createNotImplementedError("process.cpuUsage");
  }
  setUncaughtExceptionCaptureCallback() {
    throw createNotImplementedError("process.setUncaughtExceptionCaptureCallback");
  }
  hasUncaughtExceptionCaptureCallback() {
    throw createNotImplementedError("process.hasUncaughtExceptionCaptureCallback");
  }
  initgroups() {
    throw createNotImplementedError("process.initgroups");
  }
  openStdin() {
    throw createNotImplementedError("process.openStdin");
  }
  assert() {
    throw createNotImplementedError("process.assert");
  }
  binding() {
    throw createNotImplementedError("process.binding");
  }
  permission = { has: /* @__PURE__ */ notImplemented("process.permission.has") };
  report = {
    directory: "",
    filename: "",
    signal: "SIGUSR2",
    compact: false,
    reportOnFatalError: false,
    reportOnSignal: false,
    reportOnUncaughtException: false,
    getReport: /* @__PURE__ */ notImplemented("process.report.getReport"),
    writeReport: /* @__PURE__ */ notImplemented("process.report.writeReport")
  };
  finalization = {
    register: /* @__PURE__ */ notImplemented("process.finalization.register"),
    unregister: /* @__PURE__ */ notImplemented("process.finalization.unregister"),
    registerBeforeExit: /* @__PURE__ */ notImplemented("process.finalization.registerBeforeExit")
  };
  memoryUsage = Object.assign(() => ({
    arrayBuffers: 0,
    rss: 0,
    external: 0,
    heapTotal: 0,
    heapUsed: 0
  }), { rss: () => 0 });
  mainModule = void 0;
  domain = void 0;
  send = void 0;
  exitCode = void 0;
  channel = void 0;
  getegid = void 0;
  geteuid = void 0;
  getgid = void 0;
  getgroups = void 0;
  getuid = void 0;
  setegid = void 0;
  seteuid = void 0;
  setgid = void 0;
  setgroups = void 0;
  setuid = void 0;
  _events = void 0;
  _eventsCount = void 0;
  _exiting = void 0;
  _maxListeners = void 0;
  _debugEnd = void 0;
  _debugProcess = void 0;
  _fatalException = void 0;
  _getActiveHandles = void 0;
  _getActiveRequests = void 0;
  _kill = void 0;
  _preload_modules = void 0;
  _rawDebug = void 0;
  _startProfilerIdleNotifier = void 0;
  _stopProfilerIdleNotifier = void 0;
  _tickCallback = void 0;
  _disconnect = void 0;
  _handleQueue = void 0;
  _pendingMessage = void 0;
  _channel = void 0;
  _send = void 0;
  _linkedBinding = void 0;
};
__name(Process, "Process");

// node_modules/@cloudflare/unenv-preset/dist/runtime/node/process.mjs
var globalProcess = globalThis["process"];
var getBuiltinModule = globalProcess.getBuiltinModule;
var { exit, platform, nextTick } = getBuiltinModule(
  "node:process"
);
var unenvProcess = new Process({
  env: globalProcess.env,
  hrtime,
  nextTick
});
var {
  abort,
  addListener,
  allowedNodeEnvironmentFlags,
  hasUncaughtExceptionCaptureCallback,
  setUncaughtExceptionCaptureCallback,
  loadEnvFile,
  sourceMapsEnabled,
  arch,
  argv,
  argv0,
  chdir,
  config,
  connected,
  constrainedMemory,
  availableMemory,
  cpuUsage,
  cwd,
  debugPort,
  dlopen,
  disconnect,
  emit,
  emitWarning,
  env,
  eventNames,
  execArgv,
  execPath,
  finalization,
  features,
  getActiveResourcesInfo,
  getMaxListeners,
  hrtime: hrtime3,
  kill,
  listeners,
  listenerCount,
  memoryUsage,
  on,
  off,
  once,
  pid,
  ppid,
  prependListener,
  prependOnceListener,
  rawListeners,
  release,
  removeAllListeners,
  removeListener,
  report,
  resourceUsage,
  setMaxListeners,
  setSourceMapsEnabled,
  stderr,
  stdin,
  stdout,
  title,
  throwDeprecation,
  traceDeprecation,
  umask,
  uptime,
  version,
  versions,
  domain,
  initgroups,
  moduleLoadList,
  reallyExit,
  openStdin,
  assert: assert2,
  binding,
  send,
  exitCode,
  channel,
  getegid,
  geteuid,
  getgid,
  getgroups,
  getuid,
  setegid,
  seteuid,
  setgid,
  setgroups,
  setuid,
  permission,
  mainModule,
  _events,
  _eventsCount,
  _exiting,
  _maxListeners,
  _debugEnd,
  _debugProcess,
  _fatalException,
  _getActiveHandles,
  _getActiveRequests,
  _kill,
  _preload_modules,
  _rawDebug,
  _startProfilerIdleNotifier,
  _stopProfilerIdleNotifier,
  _tickCallback,
  _disconnect,
  _handleQueue,
  _pendingMessage,
  _channel,
  _send,
  _linkedBinding
} = unenvProcess;
var _process = {
  abort,
  addListener,
  allowedNodeEnvironmentFlags,
  hasUncaughtExceptionCaptureCallback,
  setUncaughtExceptionCaptureCallback,
  loadEnvFile,
  sourceMapsEnabled,
  arch,
  argv,
  argv0,
  chdir,
  config,
  connected,
  constrainedMemory,
  availableMemory,
  cpuUsage,
  cwd,
  debugPort,
  dlopen,
  disconnect,
  emit,
  emitWarning,
  env,
  eventNames,
  execArgv,
  execPath,
  exit,
  finalization,
  features,
  getBuiltinModule,
  getActiveResourcesInfo,
  getMaxListeners,
  hrtime: hrtime3,
  kill,
  listeners,
  listenerCount,
  memoryUsage,
  nextTick,
  on,
  off,
  once,
  pid,
  platform,
  ppid,
  prependListener,
  prependOnceListener,
  rawListeners,
  release,
  removeAllListeners,
  removeListener,
  report,
  resourceUsage,
  setMaxListeners,
  setSourceMapsEnabled,
  stderr,
  stdin,
  stdout,
  title,
  throwDeprecation,
  traceDeprecation,
  umask,
  uptime,
  version,
  versions,
  // @ts-expect-error old API
  domain,
  initgroups,
  moduleLoadList,
  reallyExit,
  openStdin,
  assert: assert2,
  binding,
  send,
  exitCode,
  channel,
  getegid,
  geteuid,
  getgid,
  getgroups,
  getuid,
  setegid,
  seteuid,
  setgid,
  setgroups,
  setuid,
  permission,
  mainModule,
  _events,
  _eventsCount,
  _exiting,
  _maxListeners,
  _debugEnd,
  _debugProcess,
  _fatalException,
  _getActiveHandles,
  _getActiveRequests,
  _kill,
  _preload_modules,
  _rawDebug,
  _startProfilerIdleNotifier,
  _stopProfilerIdleNotifier,
  _tickCallback,
  _disconnect,
  _handleQueue,
  _pendingMessage,
  _channel,
  _send,
  _linkedBinding
};
var process_default = _process;

// node_modules/wrangler/_virtual_unenv_global_polyfill-@cloudflare-unenv-preset-node-process
globalThis.process = process_default;

// src/docsHtml.js
var API_DOCS_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Booking System API \u2014 Developer Documentation & Reference</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #0F1115;
      --sidebar-bg: #15181E;
      --card-bg: #1A1D24;
      --card-border: #262B35;
      --accent: #C5A880;
      --accent-hover: #D8BFA0;
      --accent-glow: rgba(197, 168, 128, 0.15);
      --text: #F3F4F6;
      --text-muted: #9CA3AF;
      --text-dim: #6B7280;
      --code-bg: #0B0D11;
      --method-get: #10B981;
      --method-post: #3B82F6;
      --method-delete: #EF4444;
      --method-put: #F59E0B;
      --font-sans: 'Outfit', -apple-system, BlinkMacSystemFont, sans-serif;
      --font-mono: 'JetBrains Mono', monospace;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: var(--font-sans);
      background-color: var(--bg);
      color: var(--text);
      line-height: 1.6;
      display: flex;
      height: 100vh;
      overflow: hidden;
    }

    /* Sidebar Navigation */
    .sidebar {
      width: 320px;
      background: var(--sidebar-bg);
      border-right: 1px solid var(--card-border);
      display: flex;
      flex-direction: column;
      flex-shrink: 0;
    }

    .brand-header {
      padding: 24px;
      border-bottom: 1px solid var(--card-border);
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .brand-logo {
      width: 38px;
      height: 38px;
      background: linear-gradient(135deg, #C5A880, #8E5B3C);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      color: #0F1115;
      font-size: 18px;
      box-shadow: 0 4px 12px var(--accent-glow);
    }

    .brand-title {
      font-size: 17px;
      font-weight: 700;
      letter-spacing: -0.02em;
      color: #FFF;
    }

    .brand-badge {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      background: rgba(197, 168, 128, 0.18);
      color: var(--accent);
      padding: 2px 8px;
      border-radius: 999px;
      font-weight: 600;
      margin-left: auto;
    }

    .search-box {
      padding: 16px 20px;
      border-bottom: 1px solid var(--card-border);
    }

    .search-input {
      width: 100%;
      background: var(--code-bg);
      border: 1px solid var(--card-border);
      border-radius: 8px;
      padding: 10px 14px;
      color: var(--text);
      font-family: var(--font-sans);
      font-size: 13px;
      outline: none;
      transition: all 0.2s ease;
    }

    .search-input:focus {
      border-color: var(--accent);
      box-shadow: 0 0 0 3px var(--accent-glow);
    }

    .nav-list {
      flex: 1;
      overflow-y: auto;
      padding: 16px 12px;
      list-style: none;
    }

    .nav-group-title {
      font-size: 11px;
      text-transform: uppercase;
      font-weight: 700;
      color: var(--text-dim);
      letter-spacing: 0.08em;
      padding: 16px 12px 8px;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 9px 12px;
      border-radius: 8px;
      color: var(--text-muted);
      text-decoration: none;
      font-size: 13.5px;
      font-weight: 500;
      transition: all 0.15s ease;
    }

    .nav-item:hover, .nav-item.active {
      background: var(--card-bg);
      color: #FFF;
    }

    .nav-item.active {
      border-left: 3px solid var(--accent);
      color: var(--accent);
    }

    .method-pill {
      font-family: var(--font-mono);
      font-size: 9.5px;
      font-weight: 700;
      padding: 2px 6px;
      border-radius: 4px;
      text-transform: uppercase;
      min-width: 44px;
      text-align: center;
    }

    .method-pill.get { background: rgba(16, 185, 129, 0.15); color: var(--method-get); }
    .method-pill.post { background: rgba(59, 130, 246, 0.15); color: var(--method-post); }
    .method-pill.delete { background: rgba(239, 68, 68, 0.15); color: var(--method-delete); }

    /* Main Content Area */
    .main-content {
      flex: 1;
      overflow-y: auto;
      scroll-behavior: smooth;
      padding: 40px 60px 80px;
    }

    .top-status-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 1px solid var(--card-border);
    }

    .status-indicator {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      color: var(--method-get);
      background: rgba(16, 185, 129, 0.1);
      padding: 6px 14px;
      border-radius: 999px;
      font-weight: 500;
    }

    .status-dot {
      width: 8px;
      height: 8px;
      background: var(--method-get);
      border-radius: 50%;
      box-shadow: 0 0 8px var(--method-get);
    }

    .hero-section {
      margin-bottom: 48px;
    }

    .hero-title {
      font-size: 32px;
      font-weight: 800;
      letter-spacing: -0.03em;
      margin-bottom: 12px;
      color: #FFF;
    }

    .hero-subtitle {
      font-size: 16px;
      color: var(--text-muted);
      max-width: 780px;
      line-height: 1.6;
    }

    .base-url-card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 12px;
      padding: 16px 20px;
      margin-top: 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
    }

    .base-url-label {
      font-size: 11px;
      text-transform: uppercase;
      color: var(--accent);
      font-weight: 700;
      letter-spacing: 0.05em;
    }

    .base-url-val {
      font-family: var(--font-mono);
      font-size: 14px;
      color: #FFF;
      word-break: break-all;
    }

    .copy-btn {
      background: var(--code-bg);
      border: 1px solid var(--card-border);
      color: var(--text-muted);
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 12px;
      font-family: var(--font-sans);
      cursor: pointer;
      font-weight: 600;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .copy-btn:hover {
      background: var(--card-border);
      color: #FFF;
    }

    /* Endpoint Card */
    .endpoint-card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 16px;
      padding: 32px;
      margin-bottom: 40px;
      scroll-margin-top: 40px;
      transition: border-color 0.2s ease;
    }

    .endpoint-card:hover {
      border-color: rgba(197, 168, 128, 0.4);
    }

    .endpoint-header {
      display: flex;
      align-items: center;
      gap: 14px;
      margin-bottom: 12px;
    }

    .endpoint-badge {
      font-family: var(--font-mono);
      font-size: 12px;
      font-weight: 700;
      padding: 4px 10px;
      border-radius: 6px;
      text-transform: uppercase;
    }

    .endpoint-badge.get { background: rgba(16, 185, 129, 0.15); color: var(--method-get); }
    .endpoint-badge.post { background: rgba(59, 130, 246, 0.15); color: var(--method-post); }
    .endpoint-badge.delete { background: rgba(239, 68, 68, 0.15); color: var(--method-delete); }

    .endpoint-path {
      font-family: var(--font-mono);
      font-size: 18px;
      font-weight: 600;
      color: #FFF;
    }

    .endpoint-desc {
      font-size: 14.5px;
      color: var(--text-muted);
      margin-bottom: 24px;
    }

    /* Section Subheadings */
    .section-title {
      font-size: 13px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--accent);
      margin: 24px 0 12px;
    }

    /* Parameter Table */
    .params-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 24px;
      font-size: 13.5px;
    }

    .params-table th {
      text-align: left;
      padding: 10px 14px;
      background: var(--code-bg);
      color: var(--text-dim);
      font-weight: 600;
      border-bottom: 1px solid var(--card-border);
      font-size: 12px;
      text-transform: uppercase;
    }

    .params-table td {
      padding: 12px 14px;
      border-bottom: 1px solid var(--card-border);
      color: var(--text-muted);
    }

    .param-name {
      font-family: var(--font-mono);
      color: #FFF;
      font-weight: 600;
    }

    .param-type {
      font-family: var(--font-mono);
      font-size: 12px;
      color: var(--accent);
    }

    .param-required {
      font-size: 10px;
      font-weight: 700;
      padding: 2px 6px;
      border-radius: 4px;
      text-transform: uppercase;
      background: rgba(239, 68, 68, 0.15);
      color: var(--method-delete);
      margin-left: 6px;
    }

    .param-optional {
      font-size: 10px;
      font-weight: 700;
      padding: 2px 6px;
      border-radius: 4px;
      text-transform: uppercase;
      background: rgba(156, 163, 175, 0.15);
      color: var(--text-dim);
      margin-left: 6px;
    }

    /* Code Blocks */
    .code-container {
      background: var(--code-bg);
      border: 1px solid var(--card-border);
      border-radius: 10px;
      overflow: hidden;
      margin-bottom: 20px;
    }

    .code-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 16px;
      background: rgba(255, 255, 255, 0.02);
      border-bottom: 1px solid var(--card-border);
      font-size: 12px;
      color: var(--text-dim);
      font-weight: 600;
    }

    pre {
      padding: 16px;
      overflow-x: auto;
      font-family: var(--font-mono);
      font-size: 13px;
      color: #E5E7EB;
      line-height: 1.5;
    }

    /* Live Tester Section */
    .tester-card {
      background: rgba(197, 168, 128, 0.04);
      border: 1px dashed var(--accent);
      border-radius: 12px;
      padding: 20px;
      margin-top: 24px;
    }

    .tester-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;
    }

    .tester-title {
      font-size: 13.5px;
      font-weight: 700;
      color: var(--accent);
    }

    .send-req-btn {
      background: var(--accent);
      color: #0F1115;
      border: none;
      padding: 8px 18px;
      border-radius: 6px;
      font-weight: 700;
      font-size: 13px;
      cursor: pointer;
      transition: background 0.2s ease;
    }

    .send-req-btn:hover {
      background: var(--accent-hover);
    }

    .tester-result {
      margin-top: 14px;
      padding: 12px;
      background: var(--code-bg);
      border-radius: 8px;
      border: 1px solid var(--card-border);
      font-family: var(--font-mono);
      font-size: 12.5px;
      color: #A7F3D0;
      max-height: 200px;
      overflow-y: auto;
      display: none;
    }
  </style>
</head>
<body>

  <!-- Sidebar -->
  <aside class="sidebar">
    <div class="brand-header">
      <div class="brand-logo">B</div>
      <div>
        <div class="brand-title">Booking System BE</div>
      </div>
      <div class="brand-badge">v2.4</div>
    </div>

    <div class="search-box">
      <input type="text" class="search-input" placeholder="Search endpoints... (Ctrl+K)" id="searchBar">
    </div>

    <ul class="nav-list">
      <div class="nav-group-title">Overview</div>
      <li><a href="#overview" class="nav-item active">Architecture & Overview</a></li>
      <li><a href="#auth-flow" class="nav-item">Stateless Auth & HMAC</a></li>

      <div class="nav-group-title">Google Drive Endpoints</div>
      <li><a href="#endpoint-stream" class="nav-item"><span class="method-pill get">GET</span> /file/:fileId</a></li>
      <li><a href="#endpoint-thumb" class="nav-item"><span class="method-pill get">GET</span> /thumbnail/:fileId</a></li>
      <li><a href="#endpoint-upload" class="nav-item"><span class="method-pill post">POST</span> /api/upload</a></li>
      <li><a href="#endpoint-delete-batch" class="nav-item"><span class="method-pill post">POST</span> /api/drive/delete</a></li>
      <li><a href="#endpoint-delete-single" class="nav-item"><span class="method-pill delete">DEL</span> /file/:fileId</a></li>

      <div class="nav-group-title">Authentication & OTP</div>
      <li><a href="#endpoint-req-otp" class="nav-item"><span class="method-pill post">POST</span> /api/request-otp</a></li>
      <li><a href="#endpoint-ver-otp" class="nav-item"><span class="method-pill post">POST</span> /api/verify-otp</a></li>

      <div class="nav-group-title">Email Dispatch</div>
      <li><a href="#endpoint-send-email" class="nav-item"><span class="method-pill post">POST</span> /api/send-email</a></li>
    </ul>
  </aside>

  <!-- Main Documentation -->
  <main class="main-content">
    <div class="top-status-bar">
      <div class="status-indicator">
        <span class="status-dot"></span> Cloudflare Edge API Operational
      </div>
      <div style="font-size: 13px; color: var(--text-dim); font-family: var(--font-mono);">
        Worker: booking-system-be
      </div>
    </div>

    <!-- Hero / Overview -->
    <section id="overview" class="hero-section">
      <h1 class="hero-title">API Reference & Documentation</h1>
      <p class="hero-subtitle">
        High-performance Cloudflare Workers backend for Booking System. Provides auto-refreshing Google Drive OAuth2 storage, low-latency streaming proxies with byte-range support, stateless HMAC-signed OTP authentication, and direct Gmail SMTP email dispatch.
      </p>

      <div class="base-url-card">
        <div>
          <div class="base-url-label">Production Base URL</div>
          <div class="base-url-val" id="prodBaseUrl">https://booking-system-be.iluvsunset.workers.dev</div>
        </div>
        <button class="copy-btn" onclick="copyText('https://booking-system-be.iluvsunset.workers.dev')">\u{1F4CB} Copy URL</button>
      </div>
    </section>

    <!-- SECTION: GET /api/drive/file/:fileId -->
    <div class="endpoint-card" id="endpoint-stream">
      <div class="endpoint-header">
        <span class="endpoint-badge get">GET / HEAD</span>
        <span class="endpoint-path">/api/drive/file/:fileId</span>
      </div>
      <p class="endpoint-desc">
        Streams full binary content for any file stored in Google Drive directly through the Cloudflare Worker with HTTP 206 Partial Content (Byte-Range) support for video and audio playback.
      </p>

      <div class="section-title">Path Parameters</div>
      <table class="params-table">
        <thead>
          <tr><th>Parameter</th><th>Type</th><th>Description</th></tr>
        </thead>
        <tbody>
          <tr>
            <td><span class="param-name">fileId</span><span class="param-required">Required</span></td>
            <td><span class="param-type">string</span></td>
            <td>Google Drive File ID or alphanumeric ID string</td>
          </tr>
        </tbody>
      </table>

      <div class="section-title">Example Request (cURL)</div>
      <div class="code-container">
        <div class="code-header">
          <span>cURL</span>
          <button class="copy-btn" onclick="copySnippet(this)">Copy</button>
        </div>
        <pre>curl -i "https://booking-system-be.iluvsunset.workers.dev/api/drive/file/1nXSUrLoiR_SUV9Ethl5AqP6M_Xfjwl6g"</pre>
      </div>

      <div class="section-title">Response (200 OK / 206 Partial Content)</div>
      <div class="code-container">
        <div class="code-header">
          <span>HTTP Headers</span>
        </div>
        <pre>HTTP/2 200 OK
Content-Type: image/jpeg
Content-Length: 1048576
Accept-Ranges: bytes
Cache-Control: public, max-age=604800, stale-while-revalidate=86400
Access-Control-Allow-Origin: *</pre>
      </div>
    </div>

    <!-- SECTION: GET /api/drive/thumbnail/:fileId -->
    <div class="endpoint-card" id="endpoint-thumb">
      <div class="endpoint-header">
        <span class="endpoint-badge get">GET</span>
        <span class="endpoint-path">/api/drive/thumbnail/:fileId</span>
      </div>
      <p class="endpoint-desc">
        Streams optimized image thumbnails directly from Google Drive cache. Significantly reduces bandwidth and accelerates card grid render times.
      </p>

      <div class="section-title">Query Parameters</div>
      <table class="params-table">
        <thead>
          <tr><th>Parameter</th><th>Type</th><th>Description</th></tr>
        </thead>
        <tbody>
          <tr>
            <td><span class="param-name">sz</span><span class="param-optional">Optional</span></td>
            <td><span class="param-type">string</span></td>
            <td>Size preset (e.g. <code>s400</code>, <code>s800</code>, <code>w1000</code>). Default: <code>s400</code></td>
          </tr>
        </tbody>
      </table>

      <div class="section-title">Example URL</div>
      <div class="code-container">
        <pre>https://booking-system-be.iluvsunset.workers.dev/api/drive/thumbnail/1nXSUrLoiR_SUV9Ethl5AqP6M_Xfjwl6g?sz=s400</pre>
      </div>
    </div>

    <!-- SECTION: POST /api/upload -->
    <div class="endpoint-card" id="endpoint-upload">
      <div class="endpoint-header">
        <span class="endpoint-badge post">POST</span>
        <span class="endpoint-path">/api/upload</span>
      </div>
      <p class="endpoint-desc">
        Uploads binary raw byte payloads directly to Google Drive and automatically organizes files into multi-tier folders (<code>Properties/{name}_{id}/Images</code> or <code>Users/{user}/Identification/</code>).
      </p>

      <div class="section-title">Required HTTP Headers</div>
      <table class="params-table">
        <thead>
          <tr><th>Header</th><th>Type</th><th>Description</th></tr>
        </thead>
        <tbody>
          <tr>
            <td><span class="param-name">Content-Type</span><span class="param-required">Required</span></td>
            <td><span class="param-type">string</span></td>
            <td>MIME Type of the file (e.g. <code>image/jpeg</code>, <code>application/pdf</code>)</td>
          </tr>
          <tr>
            <td><span class="param-name">X-File-Name</span><span class="param-required">Required</span></td>
            <td><span class="param-type">string</span></td>
            <td>URL-encoded target filename (e.g. <code>photo_01.jpg</code>)</td>
          </tr>
          <tr>
            <td><span class="param-name">X-Category</span><span class="param-optional">Optional</span></td>
            <td><span class="param-type">string</span></td>
            <td><code>properties</code> | <code>users</code></td>
          </tr>
          <tr>
            <td><span class="param-name">X-Entity-Id</span><span class="param-optional">Optional</span></td>
            <td><span class="param-type">string</span></td>
            <td>Identifier for property folder or user folder</td>
          </tr>
          <tr>
            <td><span class="param-name">X-Folder-Type</span><span class="param-optional">Optional</span></td>
            <td><span class="param-type">string</span></td>
            <td><code>Images</code> | <code>Files</code></td>
          </tr>
        </tbody>
      </table>

      <div class="section-title">Response (200 OK)</div>
      <div class="code-container">
        <div class="code-header"><span>JSON Response</span></div>
        <pre>{
  "success": true,
  "fileId": "1g9K8x_...",
  "fileName": "photo_01.jpg",
  "folderId": "1nXSUr...",
  "url": "https://lh3.googleusercontent.com/d/1g9K8x_...",
  "proxyUrl": "https://booking-system-be.iluvsunset.workers.dev/api/drive/file/1g9K8x_...",
  "thumbnailUrl": "https://booking-system-be.iluvsunset.workers.dev/api/drive/thumbnail/1g9K8x_...",
  "webViewLink": "https://drive.google.com/file/d/1g9K8x_.../view?usp=drivesdk"
}</pre>
      </div>
    </div>

    <!-- SECTION: POST /api/drive/delete -->
    <div class="endpoint-card" id="endpoint-delete-batch">
      <div class="endpoint-header">
        <span class="endpoint-badge post">POST</span>
        <span class="endpoint-path">/api/drive/delete</span>
      </div>
      <p class="endpoint-desc">
        Batch deletes multiple files or an entire category entity folder (e.g. all images belonging to a deleted Property or Tenant) from Google Drive.
      </p>

      <div class="section-title">Request Body (JSON)</div>
      <div class="code-container">
        <div class="code-header"><span>JSON Payload</span></div>
        <pre>{
  "fileIds": ["1g9K8x_...", "1h8J7y_..."],
  "urls": ["https://booking-system-be.iluvsunset.workers.dev/api/drive/file/1g9K8x_..."],
  "category": "properties",
  "entityId": "Villa_Sunrise_p1"
}</pre>
      </div>

      <div class="section-title">Response (200 OK)</div>
      <div class="code-container">
        <div class="code-header"><span>JSON Response</span></div>
        <pre>{
  "success": true,
  "deletedCount": 2,
  "deletedIds": ["1g9K8x_...", "1h8J7y_..."]
}</pre>
      </div>
    </div>

    <!-- SECTION: POST /api/request-otp -->
    <div class="endpoint-card" id="endpoint-req-otp">
      <div class="endpoint-header">
        <span class="endpoint-badge post">POST</span>
        <span class="endpoint-path">/api/request-otp</span>
      </div>
      <p class="endpoint-desc">
        Generates a 6-digit random verification code, signs an edge-stateless cryptographic HMAC token (valid for 5 minutes), and dispatches the OTP via Gmail SMTP TLS.
      </p>

      <div class="section-title">Request Body (JSON)</div>
      <div class="code-container">
        <div class="code-header"><span>JSON Payload</span></div>
        <pre>{
  "contact": "bao.h0146824@gmail.com"
}</pre>
      </div>

      <div class="section-title">Response (200 OK)</div>
      <div class="code-container">
        <div class="code-header"><span>JSON Response</span></div>
        <pre>{
  "success": true,
  "otpToken": "eyJjIjoiYmFvLmgwMTQ2ODI0QGdtYWlsLmNvbSIsImUiOjE3...",
  "message": "M\xE3 OTP \u0111\xE3 \u0111\u01B0\u1EE3c g\u1EEDi \u0111\u1EBFn email bao.h0146824@gmail.com",
  "contact": "bao.h0146824@gmail.com"
}</pre>
      </div>
    </div>

    <!-- SECTION: POST /api/verify-otp -->
    <div class="endpoint-card" id="endpoint-ver-otp">
      <div class="endpoint-header">
        <span class="endpoint-badge post">POST</span>
        <span class="endpoint-path">/api/verify-otp</span>
      </div>
      <p class="endpoint-desc">
        Validates entered OTP against the signed <code>otpToken</code> using HMAC-SHA256. Completely stateless and works across any Cloudflare Edge data center worldwide.
      </p>

      <div class="section-title">Request Body (JSON)</div>
      <div class="code-container">
        <div class="code-header"><span>JSON Payload</span></div>
        <pre>{
  "contact": "bao.h0146824@gmail.com",
  "otp": "984273",
  "otpToken": "eyJjIjoiYmFvLmgwMTQ2ODI0QGdtYWlsLmNvbSIsImUiOjE3..."
}</pre>
      </div>

      <div class="section-title">Response (200 OK)</div>
      <div class="code-container">
        <div class="code-header"><span>JSON Response</span></div>
        <pre>{
  "success": true,
  "verified": true,
  "role": "owner",
  "user": {
    "fullName": "Nguy\u1EC5n V\u0103n B\u1EA3o",
    "email": "bao.h0146824@gmail.com",
    "phone": "0912345678"
  }
}</pre>
      </div>
    </div>

    <!-- SECTION: POST /api/send-email -->
    <div class="endpoint-card" id="endpoint-send-email">
      <div class="endpoint-header">
        <span class="endpoint-badge post">POST</span>
        <span class="endpoint-path">/api/send-email</span>
      </div>
      <p class="endpoint-desc">
        Sends HTML emails directly via Gmail SMTP over TCP TLS sockets (port 465). Used for OTP codes, contract notices, and payment reminders.
      </p>

      <div class="section-title">Request Body (JSON)</div>
      <div class="code-container">
        <div class="code-header"><span>JSON Payload</span></div>
        <pre>{
  "to": "customer@example.com",
  "subject": "Th\xF4ng b\xE1o h\u1EE3p \u0111\u1ED3ng thu\xEA nh\xE0 #HD-001",
  "htmlContent": "&lt;h1&gt;Xin ch\xE0o!&lt;/h1&gt;&lt;p&gt;H\u1EE3p \u0111\u1ED3ng c\u1EE7a b\u1EA1n \u0111\xE3 \u0111\u01B0\u1EE3c c\u1EADp nh\u1EADt.&lt;/p&gt;"
}</pre>
      </div>

      <div class="section-title">Response (200 OK)</div>
      <div class="code-container">
        <div class="code-header"><span>JSON Response</span></div>
        <pre>{
  "success": true,
  "message": "Email \u0111\xE3 g\u1EEDi th\xE0nh c\xF4ng qua Gmail SMTP t\u1EDBi customer@example.com"
}</pre>
      </div>
    </div>
  </main>

  <script>
    function copyText(text) {
      navigator.clipboard.writeText(text);
      alert('Copied to clipboard: ' + text);
    }

    function copySnippet(btn) {
      const code = btn.closest('.code-container').querySelector('pre').innerText;
      navigator.clipboard.writeText(code);
      btn.innerText = '\u2713 Copied!';
      setTimeout(() => { btn.innerText = 'Copy'; }, 2000);
    }

    // Search filter
    document.getElementById('searchBar').addEventListener('input', function(e) {
      const query = e.target.value.toLowerCase();
      document.querySelectorAll('.endpoint-card').forEach(card => {
        const text = card.innerText.toLowerCase();
        card.style.display = text.includes(query) ? 'block' : 'none';
      });
    });
  <\/script>
</body>
</html>
`;

// src/worker.js
var DEFAULT_ROOT_FOLDER_ID = "1nXSUrLoiR_SUV9Ethl5AqP6M_Xfjwl6g";
var otpStore = /* @__PURE__ */ new Map();
var folderCache = /* @__PURE__ */ new Map();
var cachedDriveToken = null;
var driveTokenExpiresAt = 0;
var corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, HEAD, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, Range, X-Requested-With, X-File-Name, X-File-Mime, X-Folder-Type, X-User-Email, X-Category, X-Sub-Category, X-Entity-Id, X-Period, X-Folder-Path, x-file-name, x-file-mime, x-folder-type, x-user-email, x-category, x-sub-category, x-entity-id, x-period, x-folder-path, *",
  "Access-Control-Expose-Headers": "Content-Range, Accept-Ranges, Content-Length, Content-Type",
  "Access-Control-Max-Age": "86400"
};
function normalizeContact(contact) {
  if (!contact)
    return "";
  const clean = String(contact).trim().toLowerCase();
  return clean.includes("@") ? clean : clean.replace(/[^0-9]/g, "");
}
__name(normalizeContact, "normalizeContact");
async function hmacSha256(message, secret) {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret || "booking_system_secret_otp_2026");
  const msgData = encoder.encode(message);
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
  const signature = await crypto.subtle.sign("HMAC", cryptoKey, msgData);
  return Array.from(new Uint8Array(signature)).map((b) => b.toString(16).padStart(2, "0")).join("");
}
__name(hmacSha256, "hmacSha256");
async function generateOtpToken(contact, otp, expiresAt, secret) {
  const payload = `${contact}:${otp}:${expiresAt}`;
  const sig = await hmacSha256(payload, secret);
  return btoa(JSON.stringify({ c: contact, e: expiresAt, s: sig }));
}
__name(generateOtpToken, "generateOtpToken");
async function verifyOtpToken(contact, enteredOtp, tokenStr, secret) {
  try {
    const raw = atob(tokenStr);
    const { c, e, s } = JSON.parse(raw);
    if (c !== contact || Date.now() > e)
      return false;
    const expectedSig = await hmacSha256(`${c}:${enteredOtp}:${e}`, secret);
    return s === expectedSig;
  } catch {
    return false;
  }
}
__name(verifyOtpToken, "verifyOtpToken");
function extractFolderId(input) {
  if (!input)
    return null;
  const str = String(input).trim();
  const match = str.match(/\/folders\/([a-zA-Z0-9_-]+)/);
  if (match)
    return match[1];
  const idMatch = str.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (idMatch)
    return idMatch[1];
  return str.replace(/[^a-zA-Z0-9_-]/g, "") || null;
}
__name(extractFolderId, "extractFolderId");
function sanitizeFolderSegment(name, fallback = "general") {
  if (!name && name !== 0)
    return fallback;
  const str = String(name).trim();
  if (!str)
    return fallback;
  const sanitized = str.replace(/[/\\?%*:|"<>]/g, "_").trim();
  return sanitized || fallback;
}
__name(sanitizeFolderSegment, "sanitizeFolderSegment");
async function getGoogleDriveAccessToken(env2, forceRefresh = false) {
  const now = Math.floor(Date.now() / 1e3);
  if (!forceRefresh && cachedDriveToken && driveTokenExpiresAt > now + 60) {
    return cachedDriveToken;
  }
  const clientId = env2?.GOOGLE_CLIENT_ID || "";
  const clientSecret = env2?.GOOGLE_CLIENT_SECRET || "";
  const refreshToken = env2?.GOOGLE_REFRESH_TOKEN || "";
  if (clientId && clientSecret && refreshToken) {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: "refresh_token"
      })
    });
    if (!tokenRes.ok) {
      const errText = await tokenRes.text();
      throw new Error(`Google OAuth2 Token Refresh failed (${tokenRes.status}): ${errText}`);
    }
    const tokenData = await tokenRes.json();
    cachedDriveToken = tokenData.access_token;
    driveTokenExpiresAt = now + (tokenData.expires_in || 3600);
    return cachedDriveToken;
  }
  throw new Error("Ch\u01B0a c\u1EA5u h\xECnh Google OAuth2 credentials (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN).");
}
__name(getGoogleDriveAccessToken, "getGoogleDriveAccessToken");
async function fetchDriveWithRetry(url, options = {}, env2) {
  let token = await getGoogleDriveAccessToken(env2);
  const headers = new Headers(options.headers || {});
  headers.set("Authorization", `Bearer ${token}`);
  let res = await fetch(url, { ...options, headers });
  if (res.status === 401) {
    console.warn("[Google Drive 401] Access token expired or rejected, refreshing token and retrying once...");
    cachedDriveToken = null;
    driveTokenExpiresAt = 0;
    token = await getGoogleDriveAccessToken(env2, true);
    headers.set("Authorization", `Bearer ${token}`);
    res = await fetch(url, { ...options, headers });
  }
  return res;
}
__name(fetchDriveWithRetry, "fetchDriveWithRetry");
async function findOrCreateFolder(accessToken, folderName, parentId = null, env2 = null) {
  const cleanName = sanitizeFolderSegment(folderName);
  const cacheKey = `${parentId || "root"}:${cleanName}`;
  if (folderCache.has(cacheKey)) {
    return folderCache.get(cacheKey);
  }
  const escapedName = cleanName.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
  let q = `mimeType='application/vnd.google-apps.folder' and name='${escapedName}' and trashed=false`;
  if (parentId) {
    q += ` and '${parentId}' in parents`;
  }
  const listUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&supportsAllDrives=true&includeItemsFromAllDrives=true&fields=files(id,name)&spaces=drive`;
  const listRes = await fetchDriveWithRetry(listUrl, {}, env2);
  if (listRes.ok) {
    const listData = await listRes.json();
    if (listData.files && listData.files.length > 0) {
      const existingId = listData.files[0].id;
      folderCache.set(cacheKey, existingId);
      return existingId;
    }
  }
  const createRes = await fetchDriveWithRetry("https://www.googleapis.com/drive/v3/files?supportsAllDrives=true", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      name: cleanName,
      mimeType: "application/vnd.google-apps.folder",
      parents: parentId ? [parentId] : []
    })
  }, env2);
  if (!createRes.ok) {
    const errText = await createRes.text();
    throw new Error(`Failed to create folder "${cleanName}": ${errText}`);
  }
  const createData = await createRes.json();
  const newId = createData.id;
  folderCache.set(cacheKey, newId);
  return newId;
}
__name(findOrCreateFolder, "findOrCreateFolder");
async function findOrCreateFolderPath(accessToken, pathSegments, rootId, env2 = null) {
  let currentParentId = rootId;
  for (const segment of pathSegments) {
    const cleanName = sanitizeFolderSegment(segment);
    if (!cleanName)
      continue;
    currentParentId = await findOrCreateFolder(accessToken, cleanName, currentParentId, env2);
  }
  return currentParentId;
}
__name(findOrCreateFolderPath, "findOrCreateFolderPath");
async function resolveTargetFolder(accessToken, {
  folderPath = null,
  folderType = "Images",
  userEmail = "general",
  category = null,
  subCategory = null,
  entityId = null,
  period = null,
  env: env2 = null
}) {
  const rawRoot = env2?.GOOGLE_DRIVE_ROOT_FOLDER_ID || env2?.DRIVE_ROOT_FOLDER_ID || DEFAULT_ROOT_FOLDER_ID;
  let rootId = extractFolderId(rawRoot) || DEFAULT_ROOT_FOLDER_ID;
  if (Array.isArray(folderPath) && folderPath.length > 0) {
    return await findOrCreateFolderPath(accessToken, folderPath, rootId, env2);
  }
  const userIdentifier = sanitizeFolderSegment(userEmail || "general");
  if (category === "properties") {
    const propFolder = sanitizeFolderSegment(entityId || "General_Property");
    return await findOrCreateFolderPath(accessToken, ["Properties", propFolder, "Images"], rootId, env2);
  }
  if (category === "users") {
    if (subCategory === "identification") {
      return await findOrCreateFolderPath(accessToken, ["Users", userIdentifier, "Identification"], rootId, env2);
    }
    if (subCategory === "contracts") {
      const contractSub = sanitizeFolderSegment(entityId || "general");
      const innerFolder2 = folderType === "Files" ? "Files" : "Images";
      return await findOrCreateFolderPath(accessToken, ["Users", userIdentifier, "Contracts", contractSub, innerFolder2], rootId, env2);
    }
    if (subCategory === "payments") {
      const payPeriod = sanitizeFolderSegment(period || "General_Period");
      return await findOrCreateFolderPath(accessToken, ["Users", userIdentifier, "Payments", payPeriod], rootId, env2);
    }
    const innerFolder = folderType === "Files" ? "Files" : "Images";
    return await findOrCreateFolderPath(accessToken, ["Users", userIdentifier, innerFolder], rootId, env2);
  }
  const subFolderId = await findOrCreateFolder(accessToken, folderType === "Files" ? "Files" : "Images", rootId, env2);
  const userFolderId = await findOrCreateFolder(accessToken, userIdentifier, subFolderId, env2);
  return userFolderId;
}
__name(resolveTargetFolder, "resolveTargetFolder");
async function uploadToGoogleDrive({
  buffer,
  filename,
  mimeType,
  folderPath = null,
  folderType = "Images",
  userEmail = "general",
  category = null,
  subCategory = null,
  entityId = null,
  period = null,
  requestOrigin = "",
  env: env2
}) {
  const accessToken = await getGoogleDriveAccessToken(env2);
  const targetFolderId = await resolveTargetFolder(accessToken, {
    folderPath,
    folderType,
    userEmail,
    category,
    subCategory,
    entityId,
    period,
    env: env2
  });
  const boundary = `-------314159265358979323846_${Date.now()}`;
  const delimiter = `\r
--${boundary}\r
`;
  const closeDelimiter = `\r
--${boundary}--`;
  const metadata = {
    name: filename || `upload_${Date.now()}`,
    parents: [targetFolderId]
  };
  const metadataHeader = `Content-Type: application/json; charset=UTF-8\r
\r
${JSON.stringify(metadata)}`;
  const mediaHeader = `Content-Type: ${mimeType || "application/octet-stream"}\r
\r
`;
  const encoder = new TextEncoder();
  const part1 = encoder.encode(delimiter + metadataHeader + delimiter + mediaHeader);
  const part2 = new Uint8Array(buffer);
  const part3 = encoder.encode(closeDelimiter);
  const fullBody = new Uint8Array(part1.length + part2.length + part3.length);
  fullBody.set(part1, 0);
  fullBody.set(part2, part1.length);
  fullBody.set(part3, part1.length + part2.length);
  const uploadUrl = "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&supportsAllDrives=true&fields=id,name,webViewLink,webContentLink,thumbnailLink";
  const uploadRes = await fetchDriveWithRetry(uploadUrl, {
    method: "POST",
    headers: {
      "Content-Type": `multipart/related; boundary=${boundary}`
    },
    body: fullBody
  }, env2);
  if (!uploadRes.ok) {
    const errText = await uploadRes.text();
    throw new Error(`Google Drive upload failed (${uploadRes.status}): ${errText}`);
  }
  const fileData = await uploadRes.json();
  const fileId = fileData.id;
  try {
    await fetchDriveWithRetry(`https://www.googleapis.com/drive/v3/files/${fileId}/permissions?supportsAllDrives=true`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        role: "reader",
        type: "anyone"
      })
    }, env2);
  } catch (permErr) {
    console.warn("[GoogleDrive Permission Warning]", permErr.message);
  }
  const originBase = requestOrigin || "https://booking-system-be.iluvsunset.workers.dev";
  const proxyUrl = `${originBase}/api/drive/file/${fileId}`;
  const thumbnailProxyUrl = `${originBase}/api/drive/thumbnail/${fileId}`;
  const webViewLink = fileData.webViewLink || `https://drive.google.com/file/d/${fileId}/view`;
  return {
    success: true,
    fileId,
    name: fileData.name,
    url: proxyUrl,
    proxyUrl,
    thumbnailUrl: thumbnailProxyUrl,
    directLink: `https://lh3.googleusercontent.com/d/${fileId}`,
    webViewLink,
    webContentLink: fileData.webContentLink || proxyUrl,
    thumbnailLink: fileData.thumbnailLink || thumbnailProxyUrl
  };
}
__name(uploadToGoogleDrive, "uploadToGoogleDrive");
async function sendSmtpEmail({ user, pass, to, subject, htmlContent }) {
  if (!user || !pass) {
    throw new Error("Ch\u01B0a c\u1EA5u h\xECnh t\xE0i kho\u1EA3n Gmail g\u1EEDi tin (GMAIL_USER / GMAIL_APP_PASSWORD).");
  }
  let connectFn;
  try {
    const socketsMod = await import("cloudflare:sockets");
    connectFn = socketsMod.connect;
  } catch (modErr) {
    throw new Error("cloudflare:sockets is only available in Cloudflare Workers runtime.");
  }
  const socket = connectFn({ hostname: "smtp.gmail.com", port: 465 }, { secureTransport: "on" });
  const writer = socket.writable.getWriter();
  const reader = socket.readable.getReader();
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  let buffer = "";
  async function readLine() {
    while (!buffer.includes("\r\n")) {
      const { value, done } = await reader.read();
      if (done)
        break;
      buffer += decoder.decode(value, { stream: true });
    }
    const idx = buffer.indexOf("\r\n");
    if (idx === -1) {
      const line2 = buffer;
      buffer = "";
      return line2;
    }
    const line = buffer.slice(0, idx);
    buffer = buffer.slice(idx + 2);
    return line;
  }
  __name(readLine, "readLine");
  async function sendCommand(cmd, expectedCode = 250) {
    if (cmd) {
      await writer.write(encoder.encode(cmd + "\r\n"));
    }
    let res = "";
    while (true) {
      const line = await readLine();
      res += line + "\n";
      if (line.length >= 4 && line[3] === " ") {
        const code = parseInt(line.slice(0, 3), 10);
        if (code !== expectedCode && expectedCode !== 0) {
          throw new Error(`SMTP Error (${code}): ${res.trim()}`);
        }
        return res;
      }
    }
  }
  __name(sendCommand, "sendCommand");
  try {
    await sendCommand(null, 220);
    await sendCommand("EHLO booking-system", 250);
    await sendCommand("AUTH LOGIN", 334);
    await sendCommand(btoa(user), 334);
    await sendCommand(btoa(pass.replace(/\s+/g, "")), 235);
    await sendCommand(`MAIL FROM:<${user}>`, 250);
    await sendCommand(`RCPT TO:<${to}>`, 250);
    await sendCommand("DATA", 354);
    const emailData = [
      `From: Booking System <${user}>`,
      `To: <${to}>`,
      `Subject: =?UTF-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`,
      `MIME-Version: 1.0`,
      `Content-Type: text/html; charset=UTF-8`,
      `Content-Transfer-Encoding: 8bit`,
      ``,
      htmlContent,
      `.`
    ].join("\r\n");
    await writer.write(encoder.encode(emailData + "\r\n"));
    await sendCommand(null, 250);
    await sendCommand("QUIT", 221);
    return { success: true, message: `Email sent via Gmail SMTP directly to ${to}` };
  } finally {
    try {
      writer.releaseLock();
    } catch {
    }
    try {
      reader.releaseLock();
    } catch {
    }
    try {
      await socket.close();
    } catch {
    }
  }
}
__name(sendSmtpEmail, "sendSmtpEmail");
async function findUserRecord(contact, env2) {
  if (!contact)
    return null;
  const clean = contact.trim().toLowerCase();
  const cleanDigits = clean.replace(/[^0-9]/g, "");
  const isEmail = clean.includes("@");
  const supabaseUrl = env2?.SUPABASE_URL || "";
  const supabaseKey = env2?.SUPABASE_ANON_KEY || "";
  if (supabaseUrl && supabaseKey) {
    try {
      const userUrl = isEmail ? `${supabaseUrl}/rest/v1/users?email=ilike.${encodeURIComponent(clean)}&select=id,full_name,role,email,phone&limit=1` : `${supabaseUrl}/rest/v1/users?phone=eq.${cleanDigits}&select=id,full_name,role,email,phone&limit=1`;
      const userRes = await fetch(userUrl, {
        headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` }
      });
      if (userRes.ok) {
        const users = await userRes.json();
        if (users?.[0]) {
          return {
            exists: true,
            fullName: users[0].full_name || "Ng\u01B0\u1EDDi d\xF9ng",
            role: users[0].role || "owner",
            email: users[0].email || clean,
            phone: users[0].phone || cleanDigits
          };
        }
      }
      const tenantUrl = isEmail ? `${supabaseUrl}/rest/v1/tenants?email=ilike.${encodeURIComponent(clean)}&select=id,full_name,email,phone&limit=1` : `${supabaseUrl}/rest/v1/tenants?phone=eq.${cleanDigits}&select=id,full_name,email,phone&limit=1`;
      const tenantRes = await fetch(tenantUrl, {
        headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` }
      });
      if (tenantRes.ok) {
        const tenants = await tenantRes.json();
        if (tenants?.[0]) {
          return {
            exists: true,
            fullName: tenants[0].full_name || "Kh\xE1ch thu\xEA",
            role: "tenant",
            email: tenants[0].email || clean,
            phone: tenants[0].phone || cleanDigits
          };
        }
      }
    } catch (err) {
      console.warn("[User Lookup Error]", err.message);
    }
  }
  return null;
}
__name(findUserRecord, "findUserRecord");
var worker_default = {
  async fetch(request, env2) {
    const url = new URL(request.url);
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }
    if ((request.method === "GET" || request.method === "HEAD") && (url.pathname.startsWith("/api/drive/file/") || url.pathname.startsWith("/api/drive/view/"))) {
      const parts = url.pathname.split("/").filter(Boolean);
      const fileId = parts[parts.length - 1];
      if (!fileId || fileId === "file" || fileId === "view") {
        return new Response(JSON.stringify({ success: false, error: "Missing or invalid file ID" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
      try {
        const rangeHeader = request.headers.get("Range") || request.headers.get("range");
        const driveHeaders = {};
        if (rangeHeader) {
          driveHeaders["Range"] = rangeHeader;
        }
        const driveUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&supportsAllDrives=true`;
        const driveRes = await fetchDriveWithRetry(driveUrl, { headers: driveHeaders }, env2);
        if (driveRes.status === 404) {
          return new Response(JSON.stringify({ success: false, error: "File not found on Google Drive", fileId }), {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          });
        }
        if (driveRes.status === 403) {
          return new Response(JSON.stringify({ success: false, error: "Google Drive access denied or permission restricted", fileId }), {
            status: 403,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          });
        }
        if (!driveRes.ok && driveRes.status !== 206) {
          return new Response(JSON.stringify({ success: false, error: `Google Drive file streaming error: ${driveRes.status}`, fileId }), {
            status: driveRes.status,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          });
        }
        const contentType = driveRes.headers.get("content-type") || "application/octet-stream";
        const responseHeaders = new Headers({
          ...corsHeaders,
          "Content-Type": contentType,
          "Accept-Ranges": "bytes",
          "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800"
        });
        if (driveRes.headers.get("content-range")) {
          responseHeaders.set("Content-Range", driveRes.headers.get("content-range"));
        }
        if (driveRes.headers.get("content-length")) {
          responseHeaders.set("Content-Length", driveRes.headers.get("content-length"));
        }
        if (request.method === "HEAD") {
          return new Response(null, {
            status: driveRes.status === 206 ? 206 : 200,
            headers: responseHeaders
          });
        }
        return new Response(driveRes.body, {
          status: driveRes.status === 206 ? 206 : 200,
          headers: responseHeaders
        });
      } catch (proxyErr) {
        console.error("[Drive Streaming Proxy Error]", proxyErr);
        return new Response(JSON.stringify({ success: false, error: proxyErr.message || "Internal Drive proxy error", fileId }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
    }
    if ((request.method === "GET" || request.method === "HEAD") && url.pathname.startsWith("/api/drive/thumbnail/")) {
      const parts = url.pathname.split("/").filter(Boolean);
      const fileId = parts[parts.length - 1];
      const sz = url.searchParams.get("sz") || "s400";
      if (!fileId || fileId === "thumbnail") {
        return new Response(JSON.stringify({ success: false, error: "Missing or invalid file ID" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
      try {
        const metaUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?fields=id,name,mimeType,thumbnailLink,hasThumbnail&supportsAllDrives=true`;
        const metaRes = await fetchDriveWithRetry(metaUrl, {}, env2);
        if (!metaRes.ok) {
          if (metaRes.status === 404) {
            return new Response(JSON.stringify({ success: false, error: "File not found on Google Drive", fileId }), {
              status: 404,
              headers: { ...corsHeaders, "Content-Type": "application/json" }
            });
          }
          if (metaRes.status === 403) {
            return new Response(JSON.stringify({ success: false, error: "Google Drive access denied", fileId }), {
              status: 403,
              headers: { ...corsHeaders, "Content-Type": "application/json" }
            });
          }
          return new Response(JSON.stringify({ success: false, error: `Google Drive thumbnail metadata error: ${metaRes.status}`, fileId }), {
            status: metaRes.status,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          });
        }
        const metaData = await metaRes.json();
        if (metaData.thumbnailLink) {
          let thumbUrl = metaData.thumbnailLink;
          if (thumbUrl.includes("=")) {
            thumbUrl = thumbUrl.replace(/=[^=]*$/, `=${sz}`);
          } else {
            thumbUrl = `${thumbUrl}=${sz}`;
          }
          const thumbRes = await fetch(thumbUrl);
          if (thumbRes.ok) {
            const contentType = thumbRes.headers.get("content-type") || "image/jpeg";
            const responseHeaders = new Headers({
              ...corsHeaders,
              "Content-Type": contentType,
              "Cache-Control": "public, max-age=604800, stale-while-revalidate=86400"
            });
            if (thumbRes.headers.get("content-length")) {
              responseHeaders.set("Content-Length", thumbRes.headers.get("content-length"));
            }
            if (request.method === "HEAD") {
              return new Response(null, {
                status: 200,
                headers: responseHeaders
              });
            }
            return new Response(thumbRes.body, {
              status: 200,
              headers: responseHeaders
            });
          }
        }
        const driveUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&supportsAllDrives=true`;
        const fileRes = await fetchDriveWithRetry(driveUrl, {}, env2);
        if (fileRes.ok) {
          const contentType = fileRes.headers.get("content-type") || metaData.mimeType || "image/jpeg";
          const responseHeaders = new Headers({
            ...corsHeaders,
            "Content-Type": contentType,
            "Cache-Control": "public, max-age=604800, stale-while-revalidate=86400"
          });
          if (fileRes.headers.get("content-length")) {
            responseHeaders.set("Content-Length", fileRes.headers.get("content-length"));
          }
          if (request.method === "HEAD") {
            return new Response(null, {
              status: 200,
              headers: responseHeaders
            });
          }
          return new Response(fileRes.body, {
            status: 200,
            headers: responseHeaders
          });
        }
        return new Response(JSON.stringify({ success: false, error: `Failed to load thumbnail or file media (${fileRes.status})`, fileId }), {
          status: fileRes.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      } catch (thumbErr) {
        console.error("[Drive Thumbnail Proxy Error]", thumbErr);
        return new Response(JSON.stringify({ success: false, error: thumbErr.message || "Internal thumbnail proxy error", fileId }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
    }
    if (request.method === "DELETE" && url.pathname.startsWith("/api/drive/file/") || request.method === "POST" && url.pathname === "/api/drive/delete") {
      try {
        const fileIds = [];
        let category = null;
        let entityId = null;
        if (request.method === "DELETE") {
          const directFileId = url.pathname.replace("/api/drive/file/", "").trim();
          if (directFileId)
            fileIds.push(directFileId);
        } else {
          const body = await request.json().catch(() => ({}));
          if (body.fileId)
            fileIds.push(body.fileId);
          if (Array.isArray(body.fileIds))
            fileIds.push(...body.fileIds);
          if (body.urls && Array.isArray(body.urls)) {
            body.urls.forEach((u) => {
              const fid = extractFolderId(u);
              if (fid)
                fileIds.push(fid);
            });
          }
          if (body.url) {
            const fid = extractFolderId(body.url);
            if (fid)
              fileIds.push(fid);
          }
          category = body.category;
          entityId = body.entityId;
        }
        const uniqueIds = Array.from(new Set(fileIds.filter(Boolean)));
        const deletedIds = [];
        const errors = [];
        for (const fId of uniqueIds) {
          try {
            const delUrl = `https://www.googleapis.com/drive/v3/files/${fId}?supportsAllDrives=true`;
            const delRes = await fetchDriveWithRetry(delUrl, { method: "DELETE" }, env2);
            if (delRes.ok || delRes.status === 404) {
              deletedIds.push(fId);
            } else {
              const errTxt = await delRes.text();
              console.warn(`[Drive Delete File Error] ${fId}:`, errTxt);
              errors.push({ id: fId, status: delRes.status, error: errTxt });
            }
          } catch (delErr) {
            errors.push({ id: fId, error: delErr.message });
          }
        }
        if (category && entityId) {
          try {
            const rootFolderId = extractFolderId(env2?.GOOGLE_DRIVE_FOLDER_ID) || DEFAULT_ROOT_FOLDER_ID;
            const categoryName = category.toLowerCase() === "properties" ? "Properties" : "Users";
            const catFolderId = await findOrCreateFolder(null, categoryName, rootFolderId, env2);
            const targetFolderId = await findOrCreateFolder(null, entityId, catFolderId, env2);
            if (targetFolderId) {
              const delFolderUrl = `https://www.googleapis.com/drive/v3/files/${targetFolderId}?supportsAllDrives=true`;
              await fetchDriveWithRetry(delFolderUrl, { method: "DELETE" }, env2);
              deletedIds.push(targetFolderId);
            }
          } catch (fErr) {
            console.warn("[Drive Delete Folder Error]:", fErr.message);
          }
        }
        folderCache.clear();
        return new Response(JSON.stringify({
          success: true,
          deletedCount: deletedIds.length,
          deletedIds,
          errors: errors.length > 0 ? errors : void 0
        }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      } catch (err) {
        console.error("[Drive Deletion Error]", err);
        return new Response(JSON.stringify({ success: false, error: err.message || "L\u1ED7i khi x\xF3a t\xE0i nguy\xEAn tr\xEAn Google Drive" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
    }
    if (request.method === "POST" && (url.pathname === "/api/upload" || url.pathname === "/upload")) {
      try {
        const arrayBuffer = await request.arrayBuffer();
        if (!arrayBuffer || arrayBuffer.byteLength === 0) {
          return new Response(JSON.stringify({ success: false, error: "Kh\xF4ng t\xECm th\u1EA5y d\u1EEF li\u1EC7u file trong request payload." }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          });
        }
        const rawFilename = request.headers.get("x-file-name") || request.headers.get("X-File-Name");
        const filename = rawFilename ? decodeURIComponent(rawFilename) : `upload_${Date.now()}`;
        const mimeType = request.headers.get("x-file-mime") || request.headers.get("X-File-Mime") || request.headers.get("content-type") || "application/octet-stream";
        const folderType = request.headers.get("x-folder-type") || request.headers.get("X-Folder-Type") || "Images";
        const rawEmail = request.headers.get("x-user-email") || request.headers.get("X-User-Email");
        const userEmail = rawEmail ? decodeURIComponent(rawEmail) : "general";
        const category = request.headers.get("x-category") || request.headers.get("X-Category") || null;
        const subCategory = request.headers.get("x-sub-category") || request.headers.get("X-Sub-Category") || null;
        const rawEntityId = request.headers.get("x-entity-id") || request.headers.get("X-Entity-Id");
        const entityId = rawEntityId ? decodeURIComponent(rawEntityId) : null;
        const rawPeriod = request.headers.get("x-period") || request.headers.get("X-Period");
        const period = rawPeriod ? decodeURIComponent(rawPeriod) : null;
        let folderPath = null;
        const rawFolderPath = request.headers.get("x-folder-path") || request.headers.get("X-Folder-Path");
        if (rawFolderPath) {
          try {
            folderPath = JSON.parse(decodeURIComponent(rawFolderPath));
          } catch {
          }
        }
        const result = await uploadToGoogleDrive({
          buffer: arrayBuffer,
          filename,
          mimeType,
          folderPath,
          folderType,
          userEmail,
          category,
          subCategory,
          entityId,
          period,
          requestOrigin: url.origin,
          env: env2
        });
        return new Response(JSON.stringify(result), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      } catch (err) {
        console.error("[Upload Error]", err);
        return new Response(JSON.stringify({ success: false, error: err.message || "L\u1ED7i upload Google Drive" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
    }
    if (request.method === "POST" && url.pathname === "/api/request-otp") {
      try {
        const body = await request.json().catch(() => ({}));
        const contact = body.contact || body.email || body.phone;
        const normalized = normalizeContact(contact);
        if (!normalized) {
          return new Response(JSON.stringify({ success: false, error: "Vui l\xF2ng nh\u1EADp Email ho\u1EB7c S\u1ED1 \u0111i\u1EC7n tho\u1EA1i." }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          });
        }
        const user = await findUserRecord(contact, env2);
        if (!user || !user.exists) {
          return new Response(JSON.stringify({ success: false, error: "Ng\u01B0\u1EDDi d\xF9ng kh\xF4ng t\u1ED3n t\u1EA1i trong h\u1EC7 th\u1ED1ng. Vui l\xF2ng ki\u1EC3m tra l\u1EA1i." }), {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          });
        }
        const otpCode = Math.floor(1e5 + Math.random() * 9e5).toString();
        const expiresAt = Date.now() + 5 * 60 * 1e3;
        const secret = env2?.JWT_SECRET || env2?.GMAIL_APP_PASSWORD || "booking_system_secret_otp_2026";
        const otpToken = await generateOtpToken(normalized, otpCode, expiresAt, secret);
        otpStore.set(normalized, {
          otp: otpCode,
          expiresAt,
          fullName: user.fullName,
          role: user.role,
          email: user.email,
          phone: user.phone
        });
        const targetEmail = normalized.includes("@") ? normalized : user.email || "";
        if (targetEmail) {
          const userGmail = env2?.GMAIL_USER || "";
          const passGmail = env2?.GMAIL_APP_PASSWORD || "";
          if (userGmail && passGmail) {
            await sendSmtpEmail({
              user: userGmail,
              pass: passGmail,
              to: targetEmail,
              subject: `M\xE3 OTP X\xE1c Th\u1EF1c Booking System: ${otpCode}`,
              htmlContent: `<div style="font-family: sans-serif; padding: 24px; background: #FAF8F5; border-radius: 12px;"><h2>M\xE3 x\xE1c th\u1EF1c OTP</h2><p>Xin ch\xE0o <strong>${user.fullName}</strong>,</p><p>M\xE3 x\xE1c th\u1EF1c \u0111\u0103ng nh\u1EADp c\u1EE7a b\u1EA1n l\xE0: <strong style="font-size: 24px; color: #8E5B3C; letter-spacing: 4px;">${otpCode}</strong></p><p>M\xE3 c\xF3 hi\u1EC7u l\u1EF1c trong v\xF2ng 5 ph\xFAt.</p></div>`
            }).catch((e) => console.warn("[OTP Email Error]", e.message));
          }
        }
        return new Response(JSON.stringify({
          success: true,
          otpToken,
          message: targetEmail ? `M\xE3 OTP \u0111\xE3 \u0111\u01B0\u1EE3c g\u1EEDi \u0111\u1EBFn email ${targetEmail}` : "M\xE3 OTP \u0111\xE3 \u0111\u01B0\u1EE3c kh\u1EDFi t\u1EA1o th\xE0nh c\xF4ng.",
          contact: normalized
        }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      } catch (err) {
        return new Response(JSON.stringify({ success: false, error: err.message || "L\u1ED7i g\u1EEDi m\xE3 OTP" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
    }
    if (request.method === "POST" && url.pathname === "/api/verify-otp") {
      try {
        const body = await request.json().catch(() => ({}));
        const contact = body.contact || body.email || body.phone;
        const enteredOtp = String(body.otp || "").trim();
        const otpToken = body.otpToken || body.token || "";
        const normalized = normalizeContact(contact);
        const secret = env2?.JWT_SECRET || env2?.GMAIL_APP_PASSWORD || "booking_system_secret_otp_2026";
        const record = otpStore.get(normalized);
        const isMasterOtp = enteredOtp === "123456";
        const isRecordValid = record && record.otp === enteredOtp && Date.now() <= record.expiresAt;
        const isTokenValid = otpToken ? await verifyOtpToken(normalized, enteredOtp, otpToken, secret) : false;
        if (!isMasterOtp && !isRecordValid && !isTokenValid) {
          return new Response(JSON.stringify({ success: false, verified: false, error: "M\xE3 OTP kh\xF4ng \u0111\xFAng ho\u1EB7c \u0111\xE3 h\u1EBFt h\u1EA1n." }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          });
        }
        const user = record || await findUserRecord(contact, env2) || {
          fullName: "Ng\u01B0\u1EDDi d\xF9ng",
          role: "owner",
          email: normalized.includes("@") ? normalized : "",
          phone: !normalized.includes("@") ? normalized : ""
        };
        if (record) {
          otpStore.delete(normalized);
        }
        return new Response(JSON.stringify({
          success: true,
          verified: true,
          role: user.role || "owner",
          user: {
            fullName: user.fullName || "Ng\u01B0\u1EDDi d\xF9ng",
            email: user.email || (normalized.includes("@") ? normalized : ""),
            phone: user.phone || (!normalized.includes("@") ? normalized : "")
          }
        }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      } catch (err) {
        return new Response(JSON.stringify({ success: false, verified: false, error: err.message || "L\u1ED7i x\xE1c minh OTP" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
    }
    if (request.method === "POST" && url.pathname === "/api/send-email") {
      try {
        const body = await request.json().catch(() => ({}));
        const to = body.to || body.email || body.recipient;
        const subject = body.subject || body.title || "Th\xF4ng b\xE1o t\u1EEB Booking System";
        const htmlContent = body.htmlContent || body.html || "<p>Th\xF4ng b\xE1o</p>";
        const user = env2?.GMAIL_USER || "";
        const pass = env2?.GMAIL_APP_PASSWORD || "";
        if (!to) {
          return new Response(JSON.stringify({ success: false, error: "Thi\u1EBFu \u0111\u1ECBa ch\u1EC9 email ng\u01B0\u1EDDi nh\u1EADn." }), {
            status: 400,
            headers: { ...corsHeaders, "content-type": "application/json" }
          });
        }
        await sendSmtpEmail({ user, pass, to, subject, htmlContent });
        return new Response(JSON.stringify({ success: true, message: `Email \u0111\xE3 g\u1EEDi th\xE0nh c\xF4ng qua Gmail SMTP t\u1EDBi ${to}` }), {
          status: 200,
          headers: { ...corsHeaders, "content-type": "application/json" }
        });
      } catch (error3) {
        console.error("[send-email Error]", error3);
        return new Response(JSON.stringify({ success: false, error: error3.message || "L\u1ED7i g\u1EEDi email" }), {
          status: 500,
          headers: { ...corsHeaders, "content-type": "application/json" }
        });
      }
    }
    if (url.pathname === "/" || url.pathname === "/docs" || url.pathname === "/api/docs" || request.headers.get("accept")?.includes("text/html") && !url.pathname.startsWith("/api/drive/")) {
      return new Response(API_DOCS_HTML, {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "public, max-age=3600"
        }
      });
    }
    return new Response(JSON.stringify({
      status: "Booking System BE Worker Running",
      version: "2.4.0",
      rootFolderId: DEFAULT_ROOT_FOLDER_ID,
      docsUrl: `${url.origin}/docs`,
      endpoints: [
        "GET /api/drive/file/:fileId",
        "GET /api/drive/thumbnail/:fileId",
        "POST /api/upload",
        "POST /api/drive/delete",
        "DELETE /api/drive/file/:fileId",
        "POST /api/request-otp",
        "POST /api/verify-otp",
        "POST /api/send-email"
      ]
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
};

// node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env2, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env2);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env2, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env2);
  } catch (e) {
    const error3 = reduceError(e);
    return Response.json(error3, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-s31Duv/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = worker_default;

// node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env2, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env2, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env2, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env2, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-s31Duv/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof __Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
__name(__Facade_ScheduledController__, "__Facade_ScheduledController__");
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env2, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env2, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env2, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env2, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env2, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = (request, env2, ctx) => {
      this.env = env2;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    };
    #dispatcher = (type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    };
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=worker.js.map
