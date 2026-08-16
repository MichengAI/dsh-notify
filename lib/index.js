// src/index.ts
import { mkdirSync as mkdirSync3 } from "node:fs";
import { homedir } from "node:os";
import path6 from "node:path";
import Schema from "@deepseek-ai/schemastery";

// src/config.ts
var SOUND_IDS = ["soft", "brisk", "calm", "crisp"];
var COMPLETE_MODES = ["toast", "badge-only"];
var COMPLETE_WHEN = ["always", "unfocused", "off"];
var TIME_PATTERN = /^(?:[01]?\d|2[0-3]):[0-5]\d$/;
var COMPLETE_MERGE_MS = 5e3;
var DEFAULT_MIN_INTERVAL_MS = 2500;
var DEFAULT_WEB_PORT = 3080;
var SETTINGS_NAMESPACE = "dsh-notify";
var API_PREFIX = "/api/dsh-notify";
var STATE_DIR_NAME = "dsh-notify";
function createDefaultChannels() {
  return {
    complete: "unfocused",
    permission: true,
    question: true
  };
}
function createDefaultConfig() {
  return {
    enabled: true,
    sound: "soft",
    soundEnabled: true,
    quietHours: { enabled: false, start: "22:00", end: "08:00" },
    respectSystemDnd: true,
    completeMode: "toast",
    completeMerge: true,
    channels: createDefaultChannels()
  };
}
function isSoundId(value) {
  return typeof value === "string" && SOUND_IDS.includes(value);
}
function isCompleteMode(value) {
  return typeof value === "string" && COMPLETE_MODES.includes(value);
}
function isCompleteWhen(value) {
  return typeof value === "string" && COMPLETE_WHEN.includes(value);
}
function normalizeTime(value, fallback) {
  return typeof value === "string" && TIME_PATTERN.test(value) ? value : fallback;
}
function normalizeChannels(raw, fallback, completeMode) {
  const next = { ...fallback };
  if (raw === null || typeof raw !== "object" || Array.isArray(raw)) {
    if (completeMode === "badge-only") next.complete = "off";
    return next;
  }
  const input = raw;
  if (isCompleteWhen(input.complete)) next.complete = input.complete;
  if (typeof input.permission === "boolean") next.permission = input.permission;
  if (typeof input.question === "boolean") next.question = input.question;
  return next;
}
function normalizeConfig(raw) {
  const base = createDefaultConfig();
  if (raw === null || typeof raw !== "object") return base;
  const input = raw;
  if (typeof input.enabled === "boolean") base.enabled = input.enabled;
  if (isSoundId(input.sound)) base.sound = input.sound;
  if (typeof input.soundEnabled === "boolean") base.soundEnabled = input.soundEnabled;
  if (input.quietHours !== null && typeof input.quietHours === "object") {
    const hours = input.quietHours;
    if (typeof hours.enabled === "boolean") base.quietHours.enabled = hours.enabled;
    base.quietHours.start = normalizeTime(hours.start, base.quietHours.start);
    base.quietHours.end = normalizeTime(hours.end, base.quietHours.end);
  }
  if (typeof input.respectSystemDnd === "boolean") base.respectSystemDnd = input.respectSystemDnd;
  if (isCompleteMode(input.completeMode)) base.completeMode = input.completeMode;
  if (typeof input.completeMerge === "boolean") base.completeMerge = input.completeMerge;
  base.channels = normalizeChannels(input.channels, base.channels, base.completeMode);
  return base;
}
function mergeConfig(current, patch) {
  if (patch === null || typeof patch !== "object" || Array.isArray(patch)) {
    throw new Error("patch \u5FC5\u987B\u662F\u5BF9\u8C61");
  }
  const input = patch;
  const next = { ...current, ...input };
  if (input.channels !== void 0 && typeof input.channels === "object" && input.channels !== null && !Array.isArray(input.channels)) {
    next.channels = {
      ...current.channels,
      ...input.channels
    };
  }
  if (input.quietHours !== void 0 && typeof input.quietHours === "object" && input.quietHours !== null && !Array.isArray(input.quietHours)) {
    next.quietHours = {
      ...current.quietHours,
      ...input.quietHours
    };
  }
  return normalizeConfig(next);
}
function isNotifyDisabledByEnv() {
  return ["0", "false", "off"].includes(String(process.env.DSH_NOTIFY ?? "").toLowerCase());
}
function readMinIntervalMs() {
  const parsed = Number(process.env.DSH_NOTIFY_MIN_INTERVAL_MS ?? DEFAULT_MIN_INTERVAL_MS);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : DEFAULT_MIN_INTERVAL_MS;
}

// src/notify/engine.ts
import { appendFileSync, existsSync as existsSync3, mkdirSync as mkdirSync2 } from "node:fs";
import path5 from "node:path";

// src/paths.ts
import path from "node:path";
import { fileURLToPath } from "node:url";
var PACKAGE_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
function resolvePackageDir(...parts) {
  return path.join(PACKAGE_ROOT, ...parts);
}
function resolveAssetsDir() {
  return resolvePackageDir("assets");
}
function resolveScriptsDir() {
  return resolvePackageDir("scripts");
}

// src/notify/powershell.ts
import { spawn } from "node:child_process";
import path2 from "node:path";
function resolvePowerShellPath() {
  const root = process.env.SystemRoot;
  if (root) return path2.join(root, "System32", "WindowsPowerShell", "v1.0", "powershell.exe");
  return path2.join("C:", "WINDOWS", "System32", "WindowsPowerShell", "v1.0", "powershell.exe");
}
function encodePayload(payload) {
  return Buffer.from(JSON.stringify(payload), "utf8").toString("base64");
}
function spawnHiddenPowerShell(scriptPath, payload) {
  return spawn(resolvePowerShellPath(), [
    "-NoProfile",
    "-NonInteractive",
    "-ExecutionPolicy",
    "Bypass",
    "-WindowStyle",
    "Hidden",
    "-File",
    scriptPath,
    "-PayloadB64",
    encodePayload(payload)
  ], {
    stdio: "ignore",
    windowsHide: true
  });
}

// src/notify/quiet-hours.ts
function toMinutes(hhmm) {
  const [hoursText = "0", minutesText = "0"] = hhmm.split(":");
  return Number(hoursText) * 60 + Number(minutesText);
}
function isInQuietHours(quietHours, now = /* @__PURE__ */ new Date()) {
  if (!quietHours.enabled) return false;
  const start = toMinutes(quietHours.start);
  const end = toMinutes(quietHours.end);
  if (!Number.isFinite(start) || !Number.isFinite(end) || start === end) return false;
  const current = now.getHours() * 60 + now.getMinutes();
  return start < end ? current >= start && current < end : current >= start || current < end;
}

// src/notify/sounds.ts
import { existsSync } from "node:fs";
import path3 from "node:path";
var SOUND_PRESETS = {
  soft: { id: "soft", label: "\u67D4\u548C\uFF08\u9ED8\u8BA4\uFF09", desc: "\u4F4E\u97F3\u53CC\u51FB\uFF0C\u77ED\u4FC3\u4F46\u4E0D\u523A\u8033", file: "notify-soft.wav" },
  brisk: { id: "brisk", label: "\u8F7B\u5FEB", desc: "\u4E09\u8FDE\u4E0A\u884C\uFF0C\u63D0\u9192\u66F4\u9192\u76EE", file: "notify-brisk.wav" },
  calm: { id: "calm", label: "\u8212\u7F13", desc: "\u4F4E\u516B\u5EA6\u957F\u97F3\uFF0C\u9002\u5408\u957F\u65F6\u95F4\u6302\u673A", file: "notify-calm.wav" },
  crisp: { id: "crisp", label: "\u6E05\u8106", desc: "\u9AD8\u97F3\u77ED\u4FC3\uFF0C\u9002\u5408\u5608\u6742\u73AF\u5883", file: "notify-crisp.wav" }
};
function listSoundPresets() {
  return Object.values(SOUND_PRESETS).map(({ id, label, desc }) => ({ id, label, desc }));
}
function resolveSoundPath(sound, assetsDir = resolveAssetsDir()) {
  const override = process.env.DSH_NOTIFY_SOUND;
  if (override && existsSync(override)) return override;
  const preferred = path3.join(assetsDir, SOUND_PRESETS[sound].file);
  if (existsSync(preferred)) return preferred;
  const fallback = path3.join(assetsDir, "notify-soft.wav");
  return existsSync(fallback) ? fallback : preferred;
}

// src/notify/tray-state.ts
import { existsSync as existsSync2, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path4 from "node:path";
function createEmptyTrayState() {
  return { pending: 0, completed: [] };
}
function trayStatePath(stateDir) {
  return path4.join(stateDir, "tray-state.json");
}
function readTrayState(stateDir) {
  const file = trayStatePath(stateDir);
  try {
    if (!existsSync2(file)) return createEmptyTrayState();
    const parsed = JSON.parse(readFileSync(file, "utf8"));
    const completed = Array.isArray(parsed.completed) ? parsed.completed.filter((item) => item !== null && typeof item === "object").map((item) => ({
      sessionId: String(item.sessionId ?? ""),
      title: String(item.title ?? "").slice(0, 60)
    })).slice(-10) : [];
    return {
      pending: Math.max(0, Number(parsed.pending ?? 0) || 0),
      completed
    };
  } catch {
    return createEmptyTrayState();
  }
}
function writeTrayState(stateDir, state) {
  mkdirSync(stateDir, { recursive: true });
  writeFileSync(trayStatePath(stateDir), `${JSON.stringify(state)}
`, "utf8");
}
function addCompletedItem(state, sessionId, title) {
  return {
    pending: state.pending,
    completed: [
      ...state.completed.filter((item) => item.sessionId !== sessionId),
      { sessionId, title: title.slice(0, 60) }
    ].slice(-10)
  };
}
function shiftPending(state, delta) {
  return {
    pending: Math.max(0, state.pending + delta),
    completed: state.completed
  };
}

// src/notify/engine.ts
function createNotifyEngine(options) {
  const toastScript = path5.join(resolveScriptsDir(), "toast.ps1");
  const playScript = path5.join(resolveScriptsDir(), "play.ps1");
  const trayScript = path5.join(resolveScriptsDir(), "tray.ps1");
  const logFile = path5.join(options.stateDir, "debug.log");
  const minIntervalMs = readMinIntervalMs();
  let lastToastAt = 0;
  let focused = true;
  let trayStarted = false;
  let completeBuffer = [];
  let completeTimer = null;
  const writeLog = (message) => {
    try {
      mkdirSync2(options.stateDir, { recursive: true });
      appendFileSync(logFile, `${(/* @__PURE__ */ new Date()).toISOString()} ${message}
`, "utf8");
    } catch {
    }
  };
  const warn = (message) => {
    writeLog(message);
    options.logger?.warn(message);
  };
  const persist = (mutator) => {
    writeTrayState(options.stateDir, mutator(readTrayState(options.stateDir)));
  };
  const ensureTray = () => {
    if (process.platform !== "win32" || trayStarted) return;
    trayStarted = true;
    try {
      mkdirSync2(options.stateDir, { recursive: true });
      const port = options.portProvider();
      const child = spawnHiddenPowerShell(trayScript, {
        stateFile: trayStatePath(options.stateDir),
        port,
        url: `http://127.0.0.1:${port}`,
        lockFile: path5.join(options.stateDir, `tray-${port}.lock`)
      });
      child.once("error", (error) => {
        trayStarted = false;
        warn(`\u6258\u76D8\u542F\u52A8\u5931\u8D25\uFF1A${String(error.message ?? error)}`);
      });
      writeLog(`tray spawn pid=${child.pid ?? "?"} port=${port}`);
    } catch (error) {
      trayStarted = false;
      warn(`\u6258\u76D8\u542F\u52A8\u5F02\u5E38\uFF1A${String(error.message ?? error)}`);
    }
  };
  const showToast = (request = {}) => {
    if (process.platform !== "win32" || isNotifyDisabledByEnv()) return;
    const config = normalizeConfig(options.configProvider());
    if (!request.force && !config.enabled) return;
    if (!request.force) ensureTray();
    const now = Date.now();
    if (!request.force && now - lastToastAt < minIntervalMs) return;
    lastToastAt = now;
    const quiet = !request.ignoreQuiet && isInQuietHours(config.quietHours);
    if (quiet) return;
    const soundOn = request.soundOn ?? config.soundEnabled;
    const soundPath = resolveSoundPath(request.sound ?? config.sound);
    if (!existsSync3(toastScript)) {
      throw new Error(`\u627E\u4E0D\u5230 Toast \u811A\u672C\uFF1A${toastScript}`);
    }
    try {
      const child = spawnHiddenPowerShell(toastScript, {
        line1: String(request.title ?? "DeepSeek Harness").slice(0, 200),
        line2: String(request.message ?? "").slice(0, 300),
        line3: request.detail ? String(request.detail).slice(0, 300) : "",
        sound: soundOn && existsSync3(soundPath) ? soundPath : "",
        mute: !soundOn,
        respectSystemDnd: request.force ? false : config.respectSystemDnd,
        logFile
      });
      child.once("error", (error) => writeLog(`toast spawn error: ${String(error.message ?? error)}`));
      writeLog(`toast spawn ok pid=${child.pid ?? "?"} script=${toastScript} sound=${soundPath}`);
    } catch (error) {
      warn(`Toast \u53D1\u9001\u5931\u8D25\uFF1A${String(error.message ?? error)}`);
      throw error;
    }
  };
  const flushComplete = () => {
    completeTimer = null;
    const items = completeBuffer.splice(0);
    if (items.length === 0) return;
    if (items.length === 1) {
      const only = items[0];
      if (only === void 0) return;
      showToast({ title: "DSH \u4EFB\u52A1\u5B8C\u6210", message: only.line2, detail: only.line3 });
      return;
    }
    const titles = items.map((item) => item.itemTitle).filter((title) => title !== "");
    showToast({
      title: `DSH \u4EFB\u52A1\u5B8C\u6210\uFF08${items.length}\uFF09`,
      message: `${items.length} \u4E2A\u4EFB\u52A1\u5DF2\u5B8C\u6210`,
      detail: titles.length > 0 ? titles.join(" / ").slice(0, 160) : "\u56DE\u5230\u754C\u9762\u67E5\u770B\u7ED3\u679C"
    });
  };
  const notifyComplete = (itemTitle, line2, line3) => {
    const config = normalizeConfig(options.configProvider());
    if (!config.enabled || config.completeMode === "badge-only") return;
    if (!config.completeMerge) {
      showToast({ title: "DSH \u4EFB\u52A1\u5B8C\u6210", message: line2, detail: line3 });
      return;
    }
    completeBuffer.push({ itemTitle, line2, line3 });
    if (completeBuffer.length > 20) completeBuffer = completeBuffer.slice(-20);
    if (completeTimer !== null) clearTimeout(completeTimer);
    completeTimer = setTimeout(flushComplete, COMPLETE_MERGE_MS);
  };
  return {
    showToast,
    notifyComplete,
    previewSound(sound) {
      const preset = SOUND_PRESETS[sound];
      const soundPath = resolveSoundPath(sound);
      if (!existsSync3(soundPath)) {
        throw new Error(`\u627E\u4E0D\u5230\u63D0\u793A\u97F3\u6587\u4EF6\uFF1A${preset.file}`);
      }
      if (!existsSync3(playScript)) {
        throw new Error("\u627E\u4E0D\u5230\u8BD5\u542C\u811A\u672C play.ps1");
      }
      const child = spawnHiddenPowerShell(playScript, { sound: soundPath, logFile });
      child.once("error", (error) => {
        throw new Error(`\u8BD5\u542C\u542F\u52A8\u5931\u8D25\uFF1A${String(error.message ?? error)}`);
      });
      writeLog(`preview spawn pid=${child.pid ?? "?"} sound=${soundPath}`);
    },
    updatePending(delta) {
      persist((state) => shiftPending(state, delta));
      ensureTray();
    },
    markCompleted(sessionId, title) {
      persist((state) => addCompletedItem(state, sessionId, title));
      ensureTray();
    },
    setFocused(next) {
      focused = next;
      writeLog(next ? "focus=true" : "focus=false");
    },
    isFocused() {
      return focused;
    }
  };
}

// src/policy.ts
var PERMISSION_INTENTS = /* @__PURE__ */ new Set(["plan-review", "approval", "permission", "tool-approval"]);
function classifyAsk(intentKind) {
  return typeof intentKind === "string" && PERMISSION_INTENTS.has(intentKind) ? "permission" : "question";
}
function shouldNotifyComplete(config, focused) {
  if (!config.enabled || config.channels.complete === "off") return false;
  if (config.channels.complete === "unfocused") return !focused;
  return true;
}
function shouldNotifyAsk(config, kind) {
  if (!config.enabled) return false;
  return kind === "permission" ? config.channels.permission : config.channels.question;
}

// src/session.ts
function readSessionTitle(session) {
  try {
    const events = Array.isArray(session?.events) ? session.events : [];
    for (let index = events.length - 1; index >= 0; index -= 1) {
      const event = events[index];
      if (event?.type !== "session/title") continue;
      const title = event.data?.title;
      if (typeof title === "string" && title.trim() !== "") return title.trim();
    }
    return typeof session?.title === "string" && session.title.trim() !== "" ? session.title.trim() : void 0;
  } catch {
    return void 0;
  }
}
function readAssistantSnippet(session, maxChars) {
  try {
    const events = Array.isArray(session?.events) ? session.events : [];
    for (let index = events.length - 1; index >= 0; index -= 1) {
      const event = events[index];
      if (event?.type !== "assistant/message") continue;
      const blocks = Array.isArray(event.data?.content) ? event.data.content : [];
      for (const block of blocks) {
        const text = block.text;
        if (block.type !== "text" || typeof text !== "string") continue;
        const compact = text.replace(/\s+/g, " ").trim();
        if (compact === "") continue;
        return compact.length > maxChars ? `${compact.slice(0, maxChars)}\u2026` : compact;
      }
    }
  } catch {
  }
  return "";
}
function isRootAgent(ctx, agent) {
  try {
    const agents = ctx.get("agents");
    const roots = agents?.roots?.();
    return !Array.isArray(roots) || roots.includes(agent);
  } catch {
    return true;
  }
}
function isGoalAutoContinuing(ctx, agent) {
  try {
    const goals = ctx.get("goals");
    const goal = goals?.get?.(agent);
    if (goal === void 0) return false;
    if (goal.phase !== "active" || goal.activation !== "armed") return false;
    if (goal.maxGoalRounds === void 0) return true;
    return (goal.roundsStarted ?? 0) < goal.maxGoalRounds;
  } catch {
    return false;
  }
}

// src/questions.ts
function firstQuestionText(question) {
  for (const value of [question.header, question.question, question.prompt]) {
    if (typeof value === "string" && value.trim() !== "") return value.trim();
  }
  return "";
}
function optionSummary(question) {
  if (question.multiSelect === true || !Array.isArray(question.options)) return "";
  return question.options.map((option) => {
    if (typeof option.label === "string" && option.label.trim() !== "") return option.label.trim();
    if (typeof option.text === "string" && option.text.trim() !== "") return option.text.trim();
    return "";
  }).filter(Boolean).join(" / ");
}
function wrapUserQuestions(ctx, engine, getConfig) {
  const service = ctx.get("userQuestions");
  if (service === void 0 || typeof service.ask !== "function" || service.ask.__dshNotifyWrapped === true) {
    return null;
  }
  const original = service.ask;
  const wrapped = async function wrappedAsk(request) {
    const questions = Array.isArray(request?.questions) ? request.questions : [];
    const first = questions[0];
    let notified = false;
    if (first !== void 0) {
      try {
        const kind = classifyAsk(first.intent?.kind);
        if (shouldNotifyAsk(getConfig(), kind)) {
          const sessionTitle = readSessionTitle(request.agent?.session);
          const title = `${kind === "permission" ? "DSH \u9700\u8981\u6743\u9650" : "DSH \u9700\u8981\u4F60\u7684\u51B3\u5B9A"}${sessionTitle ? ` \xB7 ${sessionTitle}` : ""}`;
          engine.updatePending(1);
          notified = true;
          engine.showToast({
            title,
            message: firstQuestionText(first),
            detail: optionSummary(first)
          });
        }
      } catch (error) {
        ctx.logger.warn(`\u63D0\u95EE\u63D0\u9192\u5931\u8D25\uFF1A${String(error.message ?? error)}`);
      }
    }
    try {
      return await original.call(this, request);
    } finally {
      if (notified) engine.updatePending(-1);
    }
  };
  wrapped.__dshNotifyWrapped = true;
  service.ask = wrapped;
  return () => {
    service.ask = original;
  };
}

// src/routes.ts
async function readJsonBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  const raw = Buffer.concat(chunks).toString("utf8").trim();
  return raw === "" ? {} : JSON.parse(raw);
}
function sendJson(res, status, value) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(value));
}
function registerNotifyRoutes(options) {
  const disposeConfig = options.webServer.register({
    kind: "exact",
    path: `${API_PREFIX}/config`,
    handler: async (req, res) => {
      try {
        if (req.method === "GET") {
          sendJson(res, 200, {
            ok: true,
            config: normalizeConfig(options.getConfig()),
            sounds: listSoundPresets()
          });
          return;
        }
        if (req.method === "POST") {
          const parsed = await readJsonBody(req);
          const scope = options.getSettingsScope();
          if (scope === null) {
            sendJson(res, 503, { ok: false, error: "\u8BBE\u7F6E\u670D\u52A1\u5C1A\u672A\u5C31\u7EEA" });
            return;
          }
          const next = mergeConfig(options.getConfig(), parsed.patch);
          await scope.replace(next);
          sendJson(res, 200, {
            ok: true,
            config: normalizeConfig(scope.get()),
            sounds: listSoundPresets()
          });
          return;
        }
        sendJson(res, 405, { ok: false, error: "\u4EC5\u652F\u6301 GET / POST" });
      } catch (error) {
        sendJson(res, 400, { ok: false, error: String(error.message ?? error) });
      }
    }
  });
  const disposePreview = options.webServer.register({
    kind: "exact",
    path: `${API_PREFIX}/preview`,
    handler: async (req, res) => {
      try {
        const parsed = await readJsonBody(req);
        const sound = typeof parsed.sound === "string" ? parsed.sound : "soft";
        if (!(sound in SOUND_PRESETS)) {
          sendJson(res, 400, { ok: false, error: `\u672A\u77E5\u63D0\u793A\u97F3\uFF1A${sound}` });
          return;
        }
        options.engine.previewSound(sound);
        sendJson(res, 200, { ok: true });
      } catch (error) {
        sendJson(res, 400, { ok: false, error: String(error.message ?? error) });
      }
    }
  });
  const disposeFocus = options.webServer.register({
    kind: "exact",
    path: `${API_PREFIX}/focus`,
    handler: async (req, res) => {
      try {
        const parsed = await readJsonBody(req);
        options.engine.setFocused(parsed.focused === true);
        sendJson(res, 200, { ok: true, focused: options.engine.isFocused() });
      } catch (error) {
        sendJson(res, 400, { ok: false, error: String(error.message ?? error) });
      }
    }
  });
  return [disposeConfig, disposePreview, disposeFocus];
}

// src/index.ts
var name = "@michengai/dsh-notify";
var inject = ["userQuestions"];
var Config = Schema.object({});
function resolveDshHome() {
  return process.env.DSH_HOME && process.env.DSH_HOME.trim() !== "" ? process.env.DSH_HOME : path6.join(homedir(), ".dsh");
}
async function tryImport(specifier) {
  try {
    return await import(specifier);
  } catch {
    return void 0;
  }
}
function apply(ctx) {
  const stateDir = path6.join(resolveDshHome(), STATE_DIR_NAME);
  mkdirSync3(stateDir, { recursive: true });
  let settingsScope = null;
  let memoryConfig = createDefaultConfig();
  const getConfig = () => {
    if (settingsScope !== null) return normalizeConfig(settingsScope.get());
    return memoryConfig;
  };
  const engine = createNotifyEngine({
    stateDir,
    portProvider: () => {
      try {
        const webServer = ctx.get("webServer");
        return webServer?.port ?? DEFAULT_WEB_PORT;
      } catch {
        return DEFAULT_WEB_PORT;
      }
    },
    configProvider: getConfig,
    logger: ctx.logger
  });
  ctx.inject(["settings"], (sctx) => {
    void setupSettings(sctx).then((scope) => {
      settingsScope = scope;
      if (scope !== null) memoryConfig = normalizeConfig(scope.get());
    }).catch((error) => {
      ctx.logger.warn(`\u901A\u77E5\u8BBE\u7F6E\u6CE8\u518C\u5931\u8D25\uFF1A${String(error.message ?? error)}`);
    });
  });
  const lastStatus = /* @__PURE__ */ new Map();
  ctx.on("agent/status", ({ agent, status }) => {
    try {
      const previous = lastStatus.get(agent) ?? "idle";
      lastStatus.set(agent, status);
      if (status !== "idle" || previous === "idle") return;
      if (!isRootAgent(ctx, agent)) return;
      if (isGoalAutoContinuing(ctx, agent)) return;
      const session = agent.session;
      const title = readSessionTitle(session);
      const snippet = readAssistantSnippet(session, 100);
      if (!shouldNotifyComplete(getConfig(), engine.isFocused())) return;
      engine.markCompleted(String(agent.id ?? ""), title ?? "");
      engine.notifyComplete(
        title ?? "",
        title !== void 0 ? `\u4F1A\u8BDD\uFF1A${title}` : "\u56DE\u5408\u7ED3\u675F\uFF0C\u53EF\u4EE5\u56DE\u6765\u67E5\u770B\u7ED3\u679C\u4E86",
        snippet
      );
    } catch (error) {
      ctx.logger.warn(`\u5B8C\u6210\u63D0\u9192\u5931\u8D25\uFF1A${String(error.message ?? error)}`);
    }
  });
  const restoreAsk = wrapUserQuestions(ctx, engine, getConfig);
  if (restoreAsk !== null) ctx.effect(() => restoreAsk, "dsh-notify: \u8FD8\u539F userQuestions");
  ctx.on("approval/request", async (req, next) => {
    const allowed = shouldNotifyAsk(getConfig(), "permission");
    if (allowed) {
      try {
        engine.updatePending(1);
        engine.showToast({
          title: "DSH \u9700\u8981\u6743\u9650",
          message: typeof req.toolName === "string" ? req.toolName : "\u9700\u8981\u4F60\u6279\u51C6\u540E\u624D\u80FD\u7EE7\u7EED",
          detail: typeof req.reason === "string" ? req.reason : ""
        });
      } catch (error) {
        ctx.logger.warn(`\u6743\u9650\u63D0\u9192\u5931\u8D25\uFF1A${String(error.message ?? error)}`);
      }
    }
    try {
      return await next();
    } finally {
      if (allowed) engine.updatePending(-1);
    }
  });
  ctx.inject(["webServer"], (wctx) => {
    const webServer = wctx.get("webServer");
    if (webServer === void 0) return;
    const disposers = registerNotifyRoutes({
      webServer,
      getConfig,
      getSettingsScope: () => settingsScope,
      engine
    });
    wctx.effect(() => () => {
      for (const dispose of disposers) dispose();
    }, "dsh-notify: HTTP \u8DEF\u7531");
  });
  ctx.logger.info("dsh-notify \u5DF2\u6302\u8F7D");
}
async function setupSettings(ctx) {
  const settingsMod = await tryImport("@deepseek-ai/dsh-settings");
  const settings = ctx.get("settings");
  if (settings === void 0) return null;
  const schema = Schema.object({
    enabled: Schema.boolean().default(true),
    sound: Schema.string().default("soft"),
    soundEnabled: Schema.boolean().default(true),
    quietHours: Schema.object({
      enabled: Schema.boolean().default(false),
      start: Schema.string().default("22:00"),
      end: Schema.string().default("08:00")
    }).default({ enabled: false, start: "22:00", end: "08:00" }),
    respectSystemDnd: Schema.boolean().default(true),
    completeMode: Schema.union([Schema.const("toast"), Schema.const("badge-only")]).default("toast"),
    completeMerge: Schema.boolean().default(true),
    channels: Schema.object({
      complete: Schema.union([Schema.const("always"), Schema.const("unfocused"), Schema.const("off")]).default("unfocused"),
      permission: Schema.boolean().default(true),
      question: Schema.boolean().default(true)
    }).default({ complete: "unfocused", permission: true, question: true })
  });
  if (typeof settings.register === "function" && typeof settingsMod?.settingsNamespace === "function") {
    const ns = settingsMod.settingsNamespace(SETTINGS_NAMESPACE);
    settings.register(ns, schema);
    return {
      get: () => settings.get?.(ns),
      replace: (next) => settings.replace?.(ns, next) ?? Promise.resolve()
    };
  }
  if (typeof settings.extend === "function") {
    const scope = settings.extend(SETTINGS_NAMESPACE, schema);
    return {
      get: () => scope.get?.(),
      replace: (next) => scope.replace?.(next) ?? Promise.resolve()
    };
  }
  return null;
}
export {
  Config,
  apply,
  inject,
  name
};
