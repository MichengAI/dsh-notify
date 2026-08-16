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

// src/config.ts
var API_PREFIX = "/api/dsh-notify";
function createDefaultConfig() {
  return {
    enabled: true,
    sound: "soft",
    soundEnabled: true,
    quietHours: { enabled: false, start: "22:00", end: "08:00" },
    respectSystemDnd: true,
    completeMode: "toast",
    completeMerge: true
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

// src/client/intensity.ts
function intensityOf(config) {
  if (config.completeMode === "badge-only") return "badge";
  return config.soundEnabled ? "full" : "banner";
}
function patchFromIntensity(value) {
  if (value === "badge") return { completeMode: "badge-only", soundEnabled: false };
  if (value === "banner") return { completeMode: "toast", soundEnabled: false };
  return { completeMode: "toast", soundEnabled: true };
}
function isSoundId(value, ids) {
  return ids.includes(value);
}

// src/client/styles.ts
var STYLE_ID = "dsh-notify-settings";
var CSS_TEXT = `
.dsh-nt{box-sizing:border-box;width:min(100%,760px);margin:0 auto;padding:4px 2px 48px;color:var(--dsw-alias-label-primary)}
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
.dsh-nt-seg{display:inline-flex;padding:3px;border-radius:10px;background:var(--dsw-alias-interactive-bg-hover)}
.dsh-nt-seg button{appearance:none;min-width:72px;height:28px;padding:0 10px;border:0;border-radius:8px;background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-size:12px;cursor:pointer}
.dsh-nt-seg button.is-on{background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);font-weight:600}
.dsh-nt-select{appearance:none;height:32px;min-width:148px;padding:0 28px 0 10px;border:1px solid var(--dsw-alias-border-l2);border-radius:8px;background:var(--dsw-alias-bg-layer-3) url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12' fill='none'%3E%3Cpath d='M3 4.5L6 7.5L9 4.5' stroke='%2381858C' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E") no-repeat right 10px center;color:var(--dsw-alias-label-primary);font:inherit;font-size:13px}
.dsh-nt-select:focus{border-color:var(--dsw-alias-brand-primary);outline:none}
.dsh-nt-select:disabled{opacity:.5}
.dsh-nt-ghost{appearance:none;height:32px;padding:0 12px;border:1px solid var(--dsw-alias-border-l2);border-radius:8px;background:transparent;color:var(--dsw-alias-label-primary);font:inherit;font-size:12px;cursor:pointer}
.dsh-nt-ghost:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover)}
.dsh-nt-ghost:disabled{opacity:.5;cursor:default}
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
  { id: "soft", label: "\u67D4\u548C", desc: "\u4F4E\u97F3\u53CC\u51FB" },
  { id: "brisk", label: "\u8F7B\u5FEB", desc: "\u4E09\u8FDE\u4E0A\u884C" },
  { id: "calm", label: "\u8212\u7F13", desc: "\u4F4E\u516B\u5EA6\u957F\u97F3" },
  { id: "crisp", label: "\u6E05\u8106", desc: "\u9AD8\u97F3\u77ED\u4FC3" }
];
var INTENSITY = [
  { id: "badge", label: "\u4EC5\u89D2\u6807" },
  { id: "banner", label: "\u5F39\u7A97" },
  { id: "full", label: "\u5F39\u7A97\u548C\u58F0\u97F3" }
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
      if (payload.sounds && payload.sounds.length > 0) setSounds(payload.sounds);
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
  const intensity = intensityOf(config);
  const soundUsable = config.enabled && intensity === "full";
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsh-nt", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "dsh-nt-intro", children: "\u628A\u5B8C\u6210\u548C\u63D0\u95EE\u6536\u6210\u4E00\u7EC4\u672C\u673A\u63D0\u9192\u3002\u6539\u5B8C\u7ACB\u523B\u751F\u6548\u3002" }),
    error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dsh-nt-error", children: error }) : null,
    loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "dsh-nt-hint", children: "\u52A0\u8F7D\u4E2D\u2026" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, { label: "\u672C\u673A\u63D0\u9192", hint: "\u5173\u6389\u540E\u4E0D\u518D\u5F39\u7A97\u3001\u4E0D\u54CD\u94C3\uFF0C\u6258\u76D8\u4E5F\u4E0D\u518D\u7D2F\u8BA1\u3002", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "button",
        {
          type: "button",
          className: config.enabled ? "dsh-nt-switch is-on" : "dsh-nt-switch",
          role: "switch",
          "aria-checked": config.enabled,
          onClick: () => void update({ enabled: !config.enabled })
        }
      ) }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        Field,
        {
          label: "\u63D0\u9192\u5F3A\u5EA6",
          hint: "\u9700\u8981\u51B3\u7B56\u65F6\u59CB\u7EC8\u4F1A\u62AC\u5347\u89D2\u6807\u3002\u4EFB\u52A1\u5B8C\u6210\u6309\u8FD9\u91CC\u7684\u5F3A\u5EA6\u5904\u7406\u3002",
          dim: !config.enabled,
          children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dsh-nt-seg", role: "radiogroup", "aria-label": "\u63D0\u9192\u5F3A\u5EA6", children: INTENSITY.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            "button",
            {
              type: "button",
              role: "radio",
              "aria-checked": intensity === item.id,
              className: intensity === item.id ? "is-on" : "",
              disabled: !config.enabled,
              onClick: () => void update(patchFromIntensity(item.id)),
              children: item.label
            },
            item.id
          )) })
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        Field,
        {
          label: "\u63D0\u793A\u97F3\u8272",
          hint: "\u53EA\u5728\u300C\u5F39\u7A97\u548C\u58F0\u97F3\u300D\u65F6\u64AD\u653E\u3002",
          dim: !soundUsable,
          children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              "select",
              {
                className: "dsh-nt-select",
                value: config.sound,
                disabled: !soundUsable,
                onChange: (event) => {
                  if (isSoundId(event.target.value, sounds.map((item) => item.id))) {
                    void update({ sound: event.target.value });
                  }
                },
                children: sounds.map((sound) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: sound.id, children: sound.label }, sound.id))
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              "button",
              {
                type: "button",
                className: "dsh-nt-ghost",
                disabled: !soundUsable || previewing,
                onClick: () => void preview(),
                children: previewing ? "\u64AD\u653E\u4E2D" : "\u8BD5\u542C"
              }
            )
          ] })
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        Field,
        {
          label: "\u5B89\u9759\u65F6\u6BB5",
          hint: "\u8FD9\u6BB5\u65F6\u95F4\u53EA\u8BB0\u89D2\u6807\uFF0C\u4E0D\u5F39\u7A97\u3001\u4E0D\u54CD\u94C3\u3002",
          dim: !config.enabled,
          children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
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
                disabled: !config.enabled,
                onClick: () => void update({
                  quietHours: { ...config.quietHours, enabled: !config.quietHours.enabled }
                })
              }
            )
          ] })
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        Field,
        {
          label: "\u8DDF\u968F\u7CFB\u7EDF\u52FF\u6270",
          hint: "\u4E13\u6CE8\u52A9\u624B\u6253\u5F00\u65F6\u81EA\u52A8\u9759\u97F3\u3002",
          dim: !config.enabled,
          children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            "button",
            {
              type: "button",
              className: config.respectSystemDnd ? "dsh-nt-switch is-on" : "dsh-nt-switch",
              role: "switch",
              "aria-checked": config.respectSystemDnd,
              disabled: !config.enabled,
              onClick: () => void update({ respectSystemDnd: !config.respectSystemDnd })
            }
          )
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        Field,
        {
          label: "\u5408\u5E76\u8FDE\u7EED\u5B8C\u6210",
          hint: "\u51E0\u79D2\u5185\u7684\u591A\u6B21\u5B8C\u6210\u6536\u6210\u4E00\u6761\u3002",
          dim: !config.enabled || intensity === "badge",
          children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            "button",
            {
              type: "button",
              className: config.completeMerge ? "dsh-nt-switch is-on" : "dsh-nt-switch",
              role: "switch",
              "aria-checked": config.completeMerge,
              disabled: !config.enabled || intensity === "badge",
              onClick: () => void update({ completeMerge: !config.completeMerge })
            }
          )
        }
      )
    ] })
  ] });
}

// src/client/index.ts
var name = "dsh-notify-client";
var inject = ["slots"];
function apply(ctx) {
  ctx.slots.inject("settings.section", () => ctx.slots.register({
    name: "settings.section",
    id: "notify",
    order: 29,
    label: "\u901A\u77E5"
  }, NotifySection));
}
return module.exports; } });
//# sourceMappingURL=client.js.map
