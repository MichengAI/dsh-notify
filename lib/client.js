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
var TIME_PATTERN = /^(?:[01]?\d|2[0-3]):[0-5]\d$/;
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

// src/client/styles.ts
var STYLE_ID = "dsh-notify-settings";
var CSS_TEXT = `
.dsh-nt{box-sizing:border-box;width:min(100%,760px);margin:0 auto;padding:8px 4px 48px;color:var(--dsw-alias-label-primary);display:flex;flex-direction:column;gap:4px}
.dsh-nt h1{margin:0 0 8px;font-size:18px;font-weight:600;line-height:26px}
.dsh-nt-intro{margin:0 0 16px;color:var(--dsw-alias-label-tertiary);font-size:13px;line-height:1.6}
.dsh-nt-error{margin:0 0 12px;color:var(--dsw-alias-state-error-primary);font-size:12px;line-height:18px}
.dsh-nt-field{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:14px 0;border-top:1px solid var(--dsw-alias-border-l2)}
.dsh-nt-field:first-of-type{border-top:0;padding-top:4px}
.dsh-nt-copy{min-width:0;flex:1;display:flex;flex-direction:column;gap:4px}
.dsh-nt-label{color:var(--dsw-alias-label-primary);font-size:13px;font-weight:500;line-height:1.5}
.dsh-nt-hint{margin:0;color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:1.5}
.dsh-nt-group{margin-top:8px}
.dsh-nt-group-title{margin:18px 0 8px;color:var(--dsw-alias-label-secondary);font-size:12px;font-weight:500;line-height:18px}
.dsh-nt-switch{position:relative;width:40px;height:22px;border:0;border-radius:999px;background:var(--dsw-alias-label-tertiary);flex:none;cursor:pointer}
.dsh-nt-switch:after{content:'';position:absolute;top:2px;left:2px;width:18px;height:18px;border-radius:50%;background:#fff;transition:transform .16s ease}
.dsh-nt-switch.is-on{background:var(--dsw-alias-brand-primary)}
.dsh-nt-switch.is-on:after{transform:translateX(18px)}
.dsh-nt-list{display:flex;flex-direction:column;gap:8px;margin:4px 0 8px}
.dsh-nt-sound{display:grid;grid-template-columns:16px minmax(0,1fr) auto;align-items:center;gap:12px;min-height:56px;padding:10px 12px;border:1px solid var(--dsw-alias-border-l2);border-radius:12px;background:transparent;color:inherit;text-align:left;cursor:pointer}
.dsh-nt-sound:hover{background:var(--dsw-alias-interactive-bg-hover)}
.dsh-nt-sound.is-on{border-color:var(--dsw-alias-brand-primary);background:var(--dsw-alias-interactive-bg-hover)}
.dsh-nt-radio{width:14px;height:14px;border:1.5px solid var(--dsw-alias-label-tertiary);border-radius:50%;box-sizing:border-box}
.dsh-nt-sound.is-on .dsh-nt-radio{border-color:var(--dsw-alias-brand-primary);background:var(--dsw-alias-brand-primary);box-shadow:inset 0 0 0 3px var(--dsw-alias-bg-layer-1)}
.dsh-nt-sound-text{min-width:0;display:flex;flex-direction:column;gap:2px}
.dsh-nt-preview{appearance:none;height:28px;padding:0 12px;border:1px solid var(--dsw-alias-border-l2);border-radius:8px;background:transparent;color:var(--dsw-alias-label-primary);font:inherit;font-size:12px;line-height:18px;cursor:pointer}
.dsh-nt-preview:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover)}
.dsh-nt-preview:disabled{opacity:.5;cursor:default}
.dsh-nt-mode{display:flex;flex-direction:column;gap:8px;margin:4px 0 8px}
.dsh-nt-choice{display:grid;grid-template-columns:16px minmax(0,1fr);align-items:center;gap:12px;min-height:44px;padding:10px 12px;border:1px solid var(--dsw-alias-border-l2);border-radius:12px;background:transparent;color:inherit;text-align:left;cursor:pointer}
.dsh-nt-choice.is-on{border-color:var(--dsw-alias-brand-primary);background:var(--dsw-alias-interactive-bg-hover)}
.dsh-nt-times{display:flex;align-items:center;gap:8px;padding:0 0 12px}
.dsh-nt-times input{box-sizing:border-box;width:84px;height:32px;padding:0 10px;border:1px solid var(--dsw-alias-border-l2);border-radius:8px;background:var(--dsw-alias-bg-layer-3);color:var(--dsw-alias-label-primary);font:inherit;font-size:13px;text-align:center}
.dsh-nt-times input:focus{border-color:var(--dsw-alias-brand-primary);outline:none}
`;
function installNotifyStyles() {
  if (typeof document === "undefined") return () => void 0;
  const existed = document.getElementById(STYLE_ID);
  if (existed) return () => void 0;
  const tag = document.createElement("style");
  tag.id = STYLE_ID;
  tag.textContent = CSS_TEXT;
  document.head.appendChild(tag);
  return () => tag.remove();
}

// src/client/NotifySection.tsx
var import_jsx_runtime = require("react/jsx-runtime");
var FALLBACK_SOUNDS = [
  { id: "soft", label: "\u67D4\u548C\uFF08\u9ED8\u8BA4\uFF09", desc: "\u4F4E\u97F3\u53CC\u51FB\uFF0C\u77ED\u4FC3\u4F46\u4E0D\u523A\u8033" },
  { id: "brisk", label: "\u8F7B\u5FEB", desc: "\u4E09\u8FDE\u4E0A\u884C\uFF0C\u63D0\u9192\u66F4\u9192\u76EE" },
  { id: "calm", label: "\u8212\u7F13", desc: "\u4F4E\u516B\u5EA6\u957F\u97F3\uFF0C\u9002\u5408\u957F\u65F6\u95F4\u6302\u673A" },
  { id: "crisp", label: "\u6E05\u8106", desc: "\u9AD8\u97F3\u77ED\u4FC3\uFF0C\u9002\u5408\u5608\u6742\u73AF\u5883" }
];
function SwitchRow(props) {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsh-nt-field", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsh-nt-copy", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dsh-nt-label", children: props.label }),
      props.hint ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "dsh-nt-hint", children: props.hint }) : null
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      "button",
      {
        type: "button",
        className: props.checked ? "dsh-nt-switch is-on" : "dsh-nt-switch",
        role: "switch",
        "aria-checked": props.checked,
        onClick: props.onToggle
      }
    )
  ] });
}
function NotifySection() {
  const [config, setConfig] = (0, import_react.useState)(createDefaultConfig());
  const [sounds, setSounds] = (0, import_react.useState)(FALLBACK_SOUNDS);
  const [loading, setLoading] = (0, import_react.useState)(true);
  const [error, setError] = (0, import_react.useState)("");
  const [previewing, setPreviewing] = (0, import_react.useState)(null);
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
  const preview = (0, import_react.useCallback)(async (sound) => {
    setError("");
    setPreviewing(sound);
    try {
      await previewNotifySound(sound);
    } catch (err) {
      setError(String(err.message ?? err));
    } finally {
      setPreviewing(null);
    }
  }, []);
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsh-nt", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", { children: "\u901A\u77E5" }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "dsh-nt-intro", children: "\u4EFB\u52A1\u5B8C\u6210\u6216\u9700\u8981\u4F60\u51B3\u7B56\u65F6\uFF0C\u5F39\u51FA\u7CFB\u7EDF\u901A\u77E5\u3001\u64AD\u653E\u63D0\u793A\u97F3\uFF0C\u5E76\u5728\u6258\u76D8\u663E\u793A\u5F85\u5904\u7406\u6570\u91CF\u3002\u4FEE\u6539\u540E\u7ACB\u5373\u751F\u6548\u3002" }),
    error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dsh-nt-error", children: error }) : null,
    loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "dsh-nt-hint", children: "\u52A0\u8F7D\u4E2D\u2026" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        SwitchRow,
        {
          label: "\u542F\u7528\u901A\u77E5",
          hint: "\u5173\u95ED\u540E\u4E0D\u518D\u5F39\u51FA Toast\uFF0C\u4E5F\u4E0D\u518D\u64AD\u653E\u63D0\u793A\u97F3\u3002",
          checked: config.enabled,
          onToggle: () => void update({ enabled: !config.enabled })
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        SwitchRow,
        {
          label: "\u64AD\u653E\u63D0\u793A\u97F3",
          checked: config.soundEnabled,
          onToggle: () => void update({ soundEnabled: !config.soundEnabled })
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsh-nt-group", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dsh-nt-group-title", children: "\u63D0\u793A\u97F3" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dsh-nt-list", children: sounds.map((sound) => {
          const selected = sound.id === config.sound;
          return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
            "button",
            {
              type: "button",
              className: selected ? "dsh-nt-sound is-on" : "dsh-nt-sound",
              onClick: () => void update({ sound: sound.id }),
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsh-nt-radio" }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "dsh-nt-sound-text", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsh-nt-label", children: sound.label }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsh-nt-hint", children: sound.desc })
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                  "span",
                  {
                    className: "dsh-nt-preview",
                    role: "button",
                    "aria-label": `\u8BD5\u542C${sound.label}`,
                    onClick: (event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      void preview(sound.id);
                    },
                    children: previewing === sound.id ? "\u64AD\u653E\u4E2D" : "\u8BD5\u542C"
                  }
                )
              ]
            },
            sound.id
          );
        }) })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsh-nt-group", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dsh-nt-group-title", children: "\u6253\u6270\u63A7\u5236" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          SwitchRow,
          {
            label: "\u514D\u6253\u6270\u65F6\u6BB5",
            hint: "\u65F6\u6BB5\u5185\u53EA\u7D2F\u8BA1\u6258\u76D8\u89D2\u6807\uFF0C\u4E0D\u5F39\u7A97\u3001\u4E0D\u54CD\u94C3\u3002",
            checked: config.quietHours.enabled,
            onToggle: () => void update({
              quietHours: { ...config.quietHours, enabled: !config.quietHours.enabled }
            })
          }
        ),
        config.quietHours.enabled ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsh-nt-times", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsh-nt-hint", children: "\u5F00\u59CB" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            "input",
            {
              defaultValue: config.quietHours.start,
              onBlur: (event) => {
                if (TIME_PATTERN.test(event.target.value)) {
                  void update({ quietHours: { ...config.quietHours, start: event.target.value } });
                }
              }
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsh-nt-hint", children: "\u7ED3\u675F" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            "input",
            {
              defaultValue: config.quietHours.end,
              onBlur: (event) => {
                if (TIME_PATTERN.test(event.target.value)) {
                  void update({ quietHours: { ...config.quietHours, end: event.target.value } });
                }
              }
            }
          )
        ] }) : null,
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          SwitchRow,
          {
            label: "\u8DDF\u968F\u7CFB\u7EDF\u52FF\u6270",
            hint: "Windows \u4E13\u6CE8\u52A9\u624B\u5F00\u542F\u65F6\u81EA\u52A8\u9759\u97F3\u3002",
            checked: config.respectSystemDnd,
            onToggle: () => void update({ respectSystemDnd: !config.respectSystemDnd })
          }
        )
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsh-nt-group", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dsh-nt-group-title", children: "\u4EFB\u52A1\u5B8C\u6210" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsh-nt-mode", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
            "button",
            {
              type: "button",
              className: config.completeMode === "toast" ? "dsh-nt-choice is-on" : "dsh-nt-choice",
              onClick: () => void update({ completeMode: "toast" }),
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsh-nt-radio" }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsh-nt-label", children: "\u5F39\u7A97 + \u63D0\u793A\u97F3" })
              ]
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
            "button",
            {
              type: "button",
              className: config.completeMode === "badge-only" ? "dsh-nt-choice is-on" : "dsh-nt-choice",
              onClick: () => void update({ completeMode: "badge-only" }),
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsh-nt-radio" }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsh-nt-label", children: "\u4EC5\u89D2\u6807" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          SwitchRow,
          {
            label: "\u5408\u5E76\u540C\u7C7B\u901A\u77E5",
            hint: "5 \u79D2\u5185\u7684\u591A\u6B21\u5B8C\u6210\u5408\u5E76\u6210\u4E00\u6761\u6458\u8981\u3002",
            checked: config.completeMerge,
            onToggle: () => void update({ completeMerge: !config.completeMerge })
          }
        )
      ] })
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
