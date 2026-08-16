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
  const data = await res.json();
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
  await fetch(`${API_PREFIX}/preview`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sound })
  });
}

// src/client/styles.ts
var styles = {
  root: { boxSizing: "border-box", display: "flex", flexDirection: "column", gap: 12, padding: 20, overflow: "auto", height: "100%" },
  hint: { margin: 0, color: "var(--dsw-alias-label-secondary)", fontSize: 12, lineHeight: "18px" },
  error: { color: "var(--dsw-alias-state-error-primary)", fontSize: 12, lineHeight: "18px" },
  group: { display: "flex", flexDirection: "column", gap: 8 },
  groupTitle: { color: "var(--dsw-alias-label-secondary)", fontSize: 11, fontWeight: 600, letterSpacing: ".02em" },
  divider: { height: 1, border: "none", margin: "4px 0", background: "var(--dsw-alias-interactive-bg-hover)" },
  card: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "10px 14px", borderRadius: 12, background: "var(--dsw-alias-interactive-bg-hover)" },
  cardText: { display: "flex", flexDirection: "column", gap: 2, minWidth: 0 },
  label: { color: "var(--dsw-alias-label-primary)", fontSize: 14, lineHeight: "22px" },
  desc: { color: "var(--dsw-alias-label-secondary)", fontSize: 12, lineHeight: "18px" },
  row: { display: "flex", alignItems: "center", gap: 12, padding: "8px 12px", borderRadius: 12, border: "1px solid transparent", cursor: "pointer" },
  rowOn: { borderColor: "var(--dsw-alias-brand-primary)", background: "var(--dsw-alias-interactive-bg-hover)" },
  radio: { width: 14, height: 14, borderRadius: "50%", boxSizing: "border-box", border: "1.5px solid var(--dsw-alias-label-tertiary)", flex: "none" },
  radioOn: { borderColor: "var(--dsw-alias-brand-primary)", background: "var(--dsw-alias-brand-primary)" },
  timeRow: { display: "flex", alignItems: "center", gap: 8, paddingLeft: 8 },
  timeInput: { width: 76, height: 28, borderRadius: 8, border: "1px solid var(--dsw-alias-border-l2)", background: "var(--dsw-alias-bg-layer-3)", color: "var(--dsw-alias-label-primary)", textAlign: "center", fontFamily: "inherit" },
  switch: { width: 40, height: 22, borderRadius: 11, border: 0, background: "var(--dsw-alias-brand-primary)", position: "relative", cursor: "pointer" },
  switchOff: { background: "var(--dsw-alias-label-tertiary)" },
  knob: { position: "absolute", top: 2, left: 20, width: 18, height: 18, borderRadius: "50%", background: "#fff" },
  knobOff: { left: 2 }
};

// src/client/NotifySection.tsx
var import_jsx_runtime = require("react/jsx-runtime");
var FALLBACK_SOUNDS = [
  { id: "soft", label: "\u67D4\u548C\uFF08\u9ED8\u8BA4\uFF09", desc: "\u4F4E\u97F3\u53CC\u51FB\uFF0C\u77ED\u4FC3\u4F46\u4E0D\u523A\u8033" },
  { id: "brisk", label: "\u8F7B\u5FEB", desc: "\u4E09\u8FDE\u4E0A\u884C\uFF0C\u63D0\u9192\u66F4\u9192\u76EE" },
  { id: "calm", label: "\u8212\u7F13", desc: "\u4F4E\u516B\u5EA6\u957F\u97F3\uFF0C\u9002\u5408\u957F\u65F6\u95F4\u6302\u673A" },
  { id: "crisp", label: "\u6E05\u8106", desc: "\u9AD8\u97F3\u77ED\u4FC3\uFF0C\u9002\u5408\u5608\u6742\u73AF\u5883" }
];
function SwitchRow(props) {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: styles.card, children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: styles.cardText, children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: styles.label, children: props.label }),
      props.hint ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: styles.desc, children: props.hint }) : null
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      "button",
      {
        type: "button",
        style: props.checked ? styles.switch : { ...styles.switch, ...styles.switchOff },
        onClick: props.onToggle,
        "aria-pressed": props.checked,
        children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { style: props.checked ? styles.knob : { ...styles.knob, ...styles.knobOff } })
      }
    )
  ] });
}
function NotifySection() {
  const [config, setConfig] = (0, import_react.useState)(createDefaultConfig());
  const [sounds, setSounds] = (0, import_react.useState)(FALLBACK_SOUNDS);
  const [loading, setLoading] = (0, import_react.useState)(true);
  const [error, setError] = (0, import_react.useState)("");
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
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: styles.root, children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { style: styles.hint, children: "\u4EFB\u52A1\u5B8C\u6210\u6216\u9700\u8981\u4F60\u51B3\u7B56\u65F6\uFF0C\u5F39\u51FA\u7CFB\u7EDF\u901A\u77E5\u3001\u64AD\u653E\u63D0\u793A\u97F3\uFF0C\u5E76\u5728\u6258\u76D8\u663E\u793A\u5F85\u5904\u7406\u6570\u91CF\u3002\u4FDD\u5B58\u540E\u7ACB\u5373\u751F\u6548\u3002" }),
    error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: styles.error, children: error }) : null,
    loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { style: styles.hint, children: "\u52A0\u8F7D\u4E2D\u2026" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: styles.group, children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: styles.groupTitle, children: "\u603B\u5F00\u5173" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SwitchRow, { label: "\u542F\u7528\u901A\u77E5", checked: config.enabled, onToggle: () => void update({ enabled: !config.enabled }) })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("hr", { style: styles.divider }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: styles.group, children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: styles.groupTitle, children: "\u63D0\u793A\u97F3" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SwitchRow, { label: "\u64AD\u653E\u63D0\u793A\u97F3", checked: config.soundEnabled, onToggle: () => void update({ soundEnabled: !config.soundEnabled }) }),
        sounds.map((sound) => {
          const selected = sound.id === config.sound;
          return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
            "div",
            {
              style: selected ? { ...styles.row, ...styles.rowOn } : styles.row,
              onClick: () => void update({ sound: sound.id }),
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: selected ? { ...styles.radio, ...styles.radioOn } : styles.radio }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: styles.cardText, children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: styles.label, children: sound.label }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: styles.desc, children: sound.desc })
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                  import_dsh_client_ui_primitives.Button,
                  {
                    variant: "outline",
                    size: "sm",
                    onClick: (event) => {
                      event.stopPropagation();
                      void previewNotifySound(sound.id);
                    },
                    children: "\u8BD5\u542C"
                  }
                )
              ]
            },
            sound.id
          );
        })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("hr", { style: styles.divider }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: styles.group, children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: styles.groupTitle, children: "\u6253\u6270\u63A7\u5236" }),
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
        config.quietHours.enabled ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: styles.timeRow, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: styles.desc, children: "\u5F00\u59CB" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            "input",
            {
              style: styles.timeInput,
              defaultValue: config.quietHours.start,
              onBlur: (event) => {
                if (TIME_PATTERN.test(event.target.value)) {
                  void update({ quietHours: { ...config.quietHours, start: event.target.value } });
                }
              }
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: styles.desc, children: "\u7ED3\u675F" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            "input",
            {
              style: styles.timeInput,
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
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("hr", { style: styles.divider }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: styles.group, children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: styles.groupTitle, children: "\u4EFB\u52A1\u5B8C\u6210" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
          "div",
          {
            style: config.completeMode === "toast" ? { ...styles.row, ...styles.rowOn } : styles.row,
            onClick: () => void update({ completeMode: "toast" }),
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: config.completeMode === "toast" ? { ...styles.radio, ...styles.radioOn } : styles.radio }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: styles.label, children: "\u5F39\u7A97 + \u63D0\u793A\u97F3" })
            ]
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
          "div",
          {
            style: config.completeMode === "badge-only" ? { ...styles.row, ...styles.rowOn } : styles.row,
            onClick: () => void update({ completeMode: "badge-only" }),
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: config.completeMode === "badge-only" ? { ...styles.radio, ...styles.radioOn } : styles.radio }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: styles.label, children: "\u4EC5\u89D2\u6807" })
            ]
          }
        ),
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
    order: 80,
    label: "\u901A\u77E5"
  }, NotifySection));
}
return module.exports; } });
//# sourceMappingURL=client.js.map
