window.__ModuleLoader__.load({ id: "@michengai/dsh-notify", factory: (require) => {
var module = { exports: {} }; var exports = module.exports;
"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name2 in all)
    __defProp(target, name2, { get: all[name2], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/client/index.ts
var index_exports = {};
__export(index_exports, {
  apply: () => apply,
  inject: () => inject,
  name: () => name
});
module.exports = __toCommonJS(index_exports);

// src/client/NotifySection.tsx
var import_react = require("react");
var import_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");

// src/config.ts
var API_PREFIX = "/api/dsh-notify";
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

// src/client/api.ts
async function parsePayload(res) {
  let data;
  try {
    data = await res.json();
  } catch {
    throw new Error(`\u8BF7\u6C42\u5931\u8D25\uFF08${res.status}\uFF09`);
  }
  if (!data.ok) throw new Error(data.error ?? `\u8BF7\u6C42\u5931\u8D25\uFF08${res.status}\uFF09`);
  return data;
}
async function fetchNotifyConfig() {
  return parsePayload(await fetch(`${API_PREFIX}/config`));
}
async function patchNotifyConfig(patch) {
  return parsePayload(await fetch(`${API_PREFIX}/config`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ patch })
  }));
}
async function previewNotifySound(sound) {
  await parsePayload(await fetch(`${API_PREFIX}/preview`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sound })
  }));
}

// src/client/styles.ts
var STYLE_ID = "dsh-notify-settings";
var CSS_TEXT = `
.dsh-nt{box-sizing:border-box;width:min(100%,760px);margin:0 auto;padding:4px 2px 48px;color:var(--dsw-alias-label-primary)}.dsh-nt-card{border:1px solid var(--dsw-alias-border-l2);border-radius:16px;background:var(--dsw-alias-bg-layer-2);overflow:hidden;margin:8px 0 20px}.dsh-nt-card .dsh-nt-row{padding:16px 18px}.dsh-nt-card .dsh-nt-row:first-child{border-top:0}
.dsh-nt-intro{margin:0 0 8px;color:var(--dsw-alias-label-tertiary);font-size:13px;line-height:1.6}
.dsh-nt-error{margin:8px 0 0;color:var(--dsw-alias-state-error-primary);font-size:12px;line-height:18px}
.dsh-nt-row{display:flex;align-items:flex-start;justify-content:space-between;gap:24px;padding:16px 0;border-top:1px solid var(--dsw-alias-border-l2)}
.dsh-nt-row:first-of-type{border-top:0}
.dsh-nt-copy{min-width:0;flex:1;display:flex;flex-direction:column;gap:4px}
.dsh-nt-label{font-size:13px;font-weight:500;line-height:20px}
.dsh-nt-hint{margin:0;color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:18px}
.dsh-nt-control{flex:none;display:flex;align-items:center;justify-content:flex-end;gap:8px;min-height:32px}
.dsh-nt-switch{position:relative;width:40px;height:22px;border:0;border-radius:999px;background:rgba(255,255,255,.16);cursor:pointer}
.dsh-nt-switch:after{content:'';position:absolute;top:2px;left:2px;width:18px;height:18px;border-radius:50%;background:#fff;transition:transform .16s ease}
.dsh-nt-switch.is-on{background:var(--dsw-alias-brand-primary)}
.dsh-nt-switch.is-on:after{transform:translateX(18px)}
.dsh-nt-switch:disabled{opacity:.4;cursor:default}
.dsh-nt-seg{display:inline-flex;padding:3px;border:1px solid var(--dsw-alias-border-l2);border-radius:12px;background:var(--dsw-alias-bg-layer-3)}
.dsh-nt-seg button{appearance:none;min-width:76px;height:30px;padding:0 12px;border:0;border-radius:9px;background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-size:12px;line-height:18px;cursor:pointer}
.dsh-nt-seg button:hover:not(:disabled){color:var(--dsw-alias-label-primary)}
.dsh-nt-seg button.is-on{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary);font-weight:600;box-shadow:inset 0 0 0 1px var(--dsw-alias-border-l2)}
.dsh-nt-seg button:disabled{opacity:.45;cursor:default}
.dsh-nt-picker{display:inline-flex;align-items:center;justify-content:space-between;gap:10px;min-width:148px;height:32px;padding:0 10px;border:1px solid var(--dsw-alias-border-l2);border-radius:8px;background:var(--dsw-alias-bg-layer-3);color:var(--dsw-alias-label-primary);font:inherit;font-size:13px;cursor:pointer}
.dsh-nt-picker:hover:not(:disabled){border-color:var(--dsw-alias-label-dimmed)}
.dsh-nt-picker:disabled{opacity:.45;cursor:default}
.dsh-nt-caret{width:8px;height:8px;border-right:1.5px solid var(--dsw-alias-label-tertiary);border-bottom:1.5px solid var(--dsw-alias-label-tertiary);transform:rotate(45deg) translateY(-2px)}
.dsh-nt-times{display:flex;align-items:center;gap:8px}
.dsh-nt-times input{box-sizing:border-box;width:108px;height:32px;padding:0 8px;border:1px solid var(--dsw-alias-border-l2);border-radius:8px;background:var(--dsw-alias-bg-layer-3);color:var(--dsw-alias-label-primary);font:inherit;font-size:13px}
.dsh-nt-times input:focus{border-color:var(--dsw-alias-brand-primary);outline:none}
.dsh-nt-dim .dsh-nt-label,.dsh-nt-dim .dsh-nt-hint{opacity:.55}
`;
function installNotifyStyles() {
  if (typeof document === "undefined") return () => void 0;
  if (document.getElementById(STYLE_ID)) return () => void 0;
  const tag = document.createElement("style");
  tag.id = STYLE_ID;
  tag.textContent = CSS_TEXT;
  document.head.appendChild(tag);
  return () => tag.remove();
}

// src/client/NotifySection.tsx
var import_jsx_runtime = require("react/jsx-runtime");
var FALLBACK_SOUNDS = [
  { id: "soft", label: "\u67D4\u548C" },
  { id: "brisk", label: "\u8F7B\u5FEB" },
  { id: "calm", label: "\u8212\u7F13" },
  { id: "crisp", label: "\u6E05\u8106" }
];
var COMPLETE_OPTIONS = [
  { id: "always", label: "\u59CB\u7EC8\u63D0\u9192" },
  { id: "unfocused", label: "\u4EC5\u5728\u672A\u805A\u7126\u65F6" },
  { id: "off", label: "\u5173\u95ED" }
];
function Field(props) {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: props.dim ? "dsh-nt-row dsh-nt-dim" : "dsh-nt-row", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsh-nt-copy", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dsh-nt-label", children: props.label }),
      props.hint ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "dsh-nt-hint", children: props.hint }) : null
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dsh-nt-control", children: props.children })
  ] });
}
function Picker(props) {
  const [open, setOpen] = (0, import_react.useState)(false);
  const current = props.options.find((item) => item.id === props.value)?.label ?? "\u8BF7\u9009\u62E9";
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    import_dsh_client_ui_primitives.Menu,
    {
      open: open && props.disabled !== true,
      portal: true,
      align: "end",
      compact: true,
      selectedId: props.value,
      items: props.options.map((item) => ({ id: item.id, label: item.label })),
      onSelect: (id) => {
        props.onChange(id);
        setOpen(false);
      },
      onClose: () => setOpen(false),
      anchor: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
        "button",
        {
          type: "button",
          className: "dsh-nt-picker",
          disabled: props.disabled === true,
          "aria-haspopup": "listbox",
          "aria-expanded": open,
          onClick: () => setOpen((value) => !value),
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: current }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsh-nt-caret", "aria-hidden": "true" })
          ]
        }
      )
    }
  );
}
function NotifySection() {
  const [config, setConfig] = (0, import_react.useState)(createDefaultConfig());
  const [sounds, setSounds] = (0, import_react.useState)(FALLBACK_SOUNDS);
  const [loading, setLoading] = (0, import_react.useState)(true);
  const [error, setError] = (0, import_react.useState)("");
  const [previewing, setPreviewing] = (0, import_react.useState)(false);
  (0, import_react.useEffect)(() => installNotifyStyles(), []);
  (0, import_react.useEffect)(() => {
    void fetchNotifyConfig().then((payload) => {
      if (payload.config) setConfig(payload.config);
      if (payload.sounds && payload.sounds.length > 0) {
        setSounds(payload.sounds.map((item) => ({ id: item.id, label: item.label.replace("\uFF08\u9ED8\u8BA4\uFF09", "") })));
      }
    }).catch((err) => setError(String(err.message ?? err))).finally(() => setLoading(false));
  }, []);
  const update = (0, import_react.useCallback)(async (patch) => {
    setError("");
    try {
      const payload = await patchNotifyConfig(patch);
      if (payload.config) setConfig(payload.config);
    } catch (err) {
      setError(String(err.message ?? err));
    }
  }, []);
  const preview = (0, import_react.useCallback)(async () => {
    setError("");
    setPreviewing(true);
    try {
      await previewNotifySound(config.sound);
    } catch (err) {
      setError(String(err.message ?? err));
    } finally {
      setPreviewing(false);
    }
  }, [config.sound]);
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsh-nt", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "dsh-nt-intro", children: "\u6309\u7C7B\u578B\u5206\u522B\u51B3\u5B9A\uFF1A\u56DE\u5408\u7ED3\u675F\u3001\u6743\u9650\u6279\u51C6\u3001\u8FD8\u662F\u9700\u8981\u4F60\u56DE\u7B54\u95EE\u9898\u3002" }),
    error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dsh-nt-error", children: error }) : null,
    loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "dsh-nt-hint", children: "\u52A0\u8F7D\u4E2D\u2026" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsh-nt-card", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, { label: "\u8F6E\u6B21\u5B8C\u6210\u901A\u77E5", hint: "\u6839 Agent \u56DE\u5408\u7ED3\u675F\u540E\u4F55\u65F6\u63D0\u9192\u4F60\u3002", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          Picker,
          {
            value: config.channels.complete,
            options: COMPLETE_OPTIONS,
            onChange: (id) => void update({ channels: { ...config.channels, complete: id } })
          }
        ) }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, { label: "\u542F\u7528\u6743\u9650\u901A\u77E5", hint: "\u9700\u8981\u6279\u51C6\u5DE5\u5177\u6216\u8BA1\u5212\u65F6\u63D0\u9192\u3002", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          "button",
          {
            type: "button",
            className: config.channels.permission ? "dsh-nt-switch is-on" : "dsh-nt-switch",
            role: "switch",
            "aria-checked": config.channels.permission,
            onClick: () => void update({ channels: { ...config.channels, permission: !config.channels.permission } })
          }
        ) }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, { label: "\u542F\u7528\u63D0\u95EE\u901A\u77E5", hint: "\u9700\u8981\u4F60\u9009\u62E9\u6216\u8F93\u5165\u540E\u624D\u80FD\u7EE7\u7EED\u65F6\u63D0\u9192\u3002", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          "button",
          {
            type: "button",
            className: config.channels.question ? "dsh-nt-switch is-on" : "dsh-nt-switch",
            role: "switch",
            "aria-checked": config.channels.question,
            onClick: () => void update({ channels: { ...config.channels, question: !config.channels.question } })
          }
        ) })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, { label: "\u63D0\u793A\u97F3\u8272", hint: "\u5F39\u7A97\u63D0\u9192\u65F6\u4F7F\u7528\u7684\u58F0\u97F3\u3002", children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          Picker,
          {
            value: config.sound,
            options: sounds.map((item) => ({ id: item.id, label: item.label })),
            onChange: (id) => void update({ sound: id })
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_dsh_client_ui_primitives.Button, { variant: "outline", size: "sm", disabled: previewing, onClick: () => void preview(), children: previewing ? "\u64AD\u653E\u4E2D" : "\u8BD5\u542C" })
      ] }) }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, { label: "\u5B89\u9759\u65F6\u6BB5", hint: "\u8FD9\u6BB5\u65F6\u95F4\u53EA\u8BB0\u89D2\u6807\uFF0C\u4E0D\u5F39\u7A97\u3001\u4E0D\u54CD\u94C3\u3002", children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
        config.quietHours.enabled ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsh-nt-times", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            "input",
            {
              type: "time",
              value: config.quietHours.start,
              onChange: (event) => void update({
                quietHours: { ...config.quietHours, start: event.target.value }
              })
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsh-nt-hint", children: "\u81F3" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            "input",
            {
              type: "time",
              value: config.quietHours.end,
              onChange: (event) => void update({
                quietHours: { ...config.quietHours, end: event.target.value }
              })
            }
          )
        ] }) : null,
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          "button",
          {
            type: "button",
            className: config.quietHours.enabled ? "dsh-nt-switch is-on" : "dsh-nt-switch",
            role: "switch",
            "aria-checked": config.quietHours.enabled,
            onClick: () => void update({
              quietHours: { ...config.quietHours, enabled: !config.quietHours.enabled }
            })
          }
        )
      ] }) }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, { label: "\u8DDF\u968F\u7CFB\u7EDF\u52FF\u6270", hint: "\u4E13\u6CE8\u52A9\u624B\u6253\u5F00\u65F6\u81EA\u52A8\u9759\u97F3\u3002", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "button",
        {
          type: "button",
          className: config.respectSystemDnd ? "dsh-nt-switch is-on" : "dsh-nt-switch",
          role: "switch",
          "aria-checked": config.respectSystemDnd,
          onClick: () => void update({ respectSystemDnd: !config.respectSystemDnd })
        }
      ) }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, { label: "\u5408\u5E76\u8FDE\u7EED\u5B8C\u6210", hint: "\u51E0\u79D2\u5185\u7684\u591A\u6B21\u5B8C\u6210\u6536\u6210\u4E00\u6761\u3002", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "button",
        {
          type: "button",
          className: config.completeMerge ? "dsh-nt-switch is-on" : "dsh-nt-switch",
          role: "switch",
          "aria-checked": config.completeMerge,
          onClick: () => void update({ completeMerge: !config.completeMerge })
        }
      ) })
    ] })
  ] });
}

// src/client/focus.ts
function installFocusBridge() {
  if (typeof window === "undefined") return () => void 0;
  const send = (focused) => {
    void fetch(`${API_PREFIX}/focus`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ focused })
    }).catch(() => void 0);
  };
  const sync = () => {
    send(document.visibilityState === "visible" && document.hasFocus());
  };
  window.addEventListener("focus", sync);
  window.addEventListener("blur", sync);
  document.addEventListener("visibilitychange", sync);
  sync();
  return () => {
    window.removeEventListener("focus", sync);
    window.removeEventListener("blur", sync);
    document.removeEventListener("visibilitychange", sync);
  };
}

// src/client/index.ts
var name = "dsh-notify-client";
var inject = ["slots"];
function apply(ctx) {
  installFocusBridge();
  ctx.slots.inject("settings.section", () => ctx.slots.register({
    name: "settings.section",
    id: "notify",
    order: 29,
    label: "\u901A\u77E5"
  }, NotifySection));
}
return module.exports; } });
//# sourceMappingURL=client.js.map
