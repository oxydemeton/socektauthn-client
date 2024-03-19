function _(e) {
  return new TextEncoder().encode(e);
}
function d(e) {
  const n = new Uint8Array(e);
  let t = "";
  for (const o of n)
    t += String.fromCharCode(o);
  return btoa(t).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}
function p(e) {
  const n = e.replace(/-/g, "+").replace(/_/g, "/"), t = (4 - n.length % 4) % 4, a = n.padEnd(n.length + t, "="), o = atob(a), i = new ArrayBuffer(o.length), r = new Uint8Array(i);
  for (let u = 0; u < o.length; u++)
    r[u] = o.charCodeAt(u);
  return i;
}
function b() {
  return (window == null ? void 0 : window.PublicKeyCredential) !== void 0 && typeof window.PublicKeyCredential == "function";
}
function E(e) {
  const { id: n } = e;
  return {
    ...e,
    id: p(n),
    transports: e.transports
  };
}
function A(e) {
  return e === "localhost" || /^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/i.test(e);
}
class s extends Error {
  constructor({ message: n, code: t, cause: a, name: o }) {
    super(n, { cause: a }), this.name = o ?? a.name, this.code = t;
  }
}
function I({ error: e, options: n }) {
  var a, o;
  const { publicKey: t } = n;
  if (!t)
    throw Error("options was missing required publicKey property");
  if (e.name === "AbortError") {
    if (n.signal instanceof AbortSignal)
      return new s({
        message: "Registration ceremony was sent an abort signal",
        code: "ERROR_CEREMONY_ABORTED",
        cause: e
      });
  } else if (e.name === "ConstraintError") {
    if (((a = t.authenticatorSelection) == null ? void 0 : a.requireResidentKey) === !0)
      return new s({
        message: "Discoverable credentials were required but no available authenticator supported it",
        code: "ERROR_AUTHENTICATOR_MISSING_DISCOVERABLE_CREDENTIAL_SUPPORT",
        cause: e
      });
    if (((o = t.authenticatorSelection) == null ? void 0 : o.userVerification) === "required")
      return new s({
        message: "User verification was required but no available authenticator supported it",
        code: "ERROR_AUTHENTICATOR_MISSING_USER_VERIFICATION_SUPPORT",
        cause: e
      });
  } else {
    if (e.name === "InvalidStateError")
      return new s({
        message: "The authenticator was previously registered",
        code: "ERROR_AUTHENTICATOR_PREVIOUSLY_REGISTERED",
        cause: e
      });
    if (e.name === "NotAllowedError")
      return new s({
        message: e.message,
        code: "ERROR_PASSTHROUGH_SEE_CAUSE_PROPERTY",
        cause: e
      });
    if (e.name === "NotSupportedError")
      return t.pubKeyCredParams.filter((r) => r.type === "public-key").length === 0 ? new s({
        message: 'No entry in pubKeyCredParams was of type "public-key"',
        code: "ERROR_MALFORMED_PUBKEYCREDPARAMS",
        cause: e
      }) : new s({
        message: "No available authenticator supported any of the specified pubKeyCredParams algorithms",
        code: "ERROR_AUTHENTICATOR_NO_SUPPORTED_PUBKEYCREDPARAMS_ALG",
        cause: e
      });
    if (e.name === "SecurityError") {
      const i = window.location.hostname;
      if (A(i)) {
        if (t.rp.id !== i)
          return new s({
            message: `The RP ID "${t.rp.id}" is invalid for this domain`,
            code: "ERROR_INVALID_RP_ID",
            cause: e
          });
      } else
        return new s({
          message: `${window.location.hostname} is an invalid domain`,
          code: "ERROR_INVALID_DOMAIN",
          cause: e
        });
    } else if (e.name === "TypeError") {
      if (t.user.id.byteLength < 1 || t.user.id.byteLength > 64)
        return new s({
          message: "User ID was not between 1 and 64 characters",
          code: "ERROR_INVALID_USER_ID_LENGTH",
          cause: e
        });
    } else if (e.name === "UnknownError")
      return new s({
        message: "The authenticator was unable to process the specified options, or could not create a new credential",
        code: "ERROR_AUTHENTICATOR_GENERAL_ERROR",
        cause: e
      });
  }
  return e;
}
class S {
  createNewAbortSignal() {
    if (this.controller) {
      const t = new Error("Cancelling existing WebAuthn API call for new one");
      t.name = "AbortError", this.controller.abort(t);
    }
    const n = new AbortController();
    return this.controller = n, n.signal;
  }
  cancelCeremony() {
    if (this.controller) {
      const n = new Error("Manually cancelling existing WebAuthn API call");
      n.name = "AbortError", this.controller.abort(n), this.controller = void 0;
    }
  }
}
const m = new S(), P = ["cross-platform", "platform"];
function y(e) {
  if (e && !(P.indexOf(e) < 0))
    return e;
}
async function T(e) {
  var R;
  if (!b())
    throw new Error("WebAuthn is not supported in this browser");
  const t = { publicKey: {
    ...e,
    challenge: p(e.challenge),
    user: {
      ...e.user,
      id: _(e.user.id)
    },
    excludeCredentials: (R = e.excludeCredentials) == null ? void 0 : R.map(E)
  } };
  t.signal = m.createNewAbortSignal();
  let a;
  try {
    a = await navigator.credentials.create(t);
  } catch (l) {
    throw I({ error: l, options: t });
  }
  if (!a)
    throw new Error("Registration was not completed");
  const { id: o, rawId: i, response: r, type: u } = a;
  let c;
  typeof r.getTransports == "function" && (c = r.getTransports());
  let f;
  if (typeof r.getPublicKeyAlgorithm == "function")
    try {
      f = r.getPublicKeyAlgorithm();
    } catch (l) {
      g("getPublicKeyAlgorithm()", l);
    }
  let h;
  if (typeof r.getPublicKey == "function")
    try {
      const l = r.getPublicKey();
      l !== null && (h = d(l));
    } catch (l) {
      g("getPublicKey()", l);
    }
  let w;
  if (typeof r.getAuthenticatorData == "function")
    try {
      w = d(r.getAuthenticatorData());
    } catch (l) {
      g("getAuthenticatorData()", l);
    }
  return {
    id: o,
    rawId: d(i),
    response: {
      attestationObject: d(r.attestationObject),
      clientDataJSON: d(r.clientDataJSON),
      transports: c,
      publicKeyAlgorithm: f,
      publicKey: h,
      authenticatorData: w
    },
    type: u,
    clientExtensionResults: a.getClientExtensionResults(),
    authenticatorAttachment: y(a.authenticatorAttachment)
  };
}
function g(e, n) {
  console.warn(`The browser extension that intercepted this WebAuthn API call incorrectly implemented ${e}. You should report this error to them.
`, n);
}
function C(e) {
  return new TextDecoder("utf-8").decode(e);
}
function O() {
  const e = window.PublicKeyCredential;
  return e.isConditionalMediationAvailable === void 0 ? new Promise((n) => n(!1)) : e.isConditionalMediationAvailable();
}
function D({ error: e, options: n }) {
  const { publicKey: t } = n;
  if (!t)
    throw Error("options was missing required publicKey property");
  if (e.name === "AbortError") {
    if (n.signal instanceof AbortSignal)
      return new s({
        message: "Authentication ceremony was sent an abort signal",
        code: "ERROR_CEREMONY_ABORTED",
        cause: e
      });
  } else {
    if (e.name === "NotAllowedError")
      return new s({
        message: e.message,
        code: "ERROR_PASSTHROUGH_SEE_CAUSE_PROPERTY",
        cause: e
      });
    if (e.name === "SecurityError") {
      const a = window.location.hostname;
      if (A(a)) {
        if (t.rpId !== a)
          return new s({
            message: `The RP ID "${t.rpId}" is invalid for this domain`,
            code: "ERROR_INVALID_RP_ID",
            cause: e
          });
      } else
        return new s({
          message: `${window.location.hostname} is an invalid domain`,
          code: "ERROR_INVALID_DOMAIN",
          cause: e
        });
    } else if (e.name === "UnknownError")
      return new s({
        message: "The authenticator was unable to process the specified options, or could not create a new assertion signature",
        code: "ERROR_AUTHENTICATOR_GENERAL_ERROR",
        cause: e
      });
  }
  return e;
}
async function N(e, n = !1) {
  var w, R;
  if (!b())
    throw new Error("WebAuthn is not supported in this browser");
  let t;
  ((w = e.allowCredentials) == null ? void 0 : w.length) !== 0 && (t = (R = e.allowCredentials) == null ? void 0 : R.map(E));
  const a = {
    ...e,
    challenge: p(e.challenge),
    allowCredentials: t
  }, o = {};
  if (n) {
    if (!await O())
      throw Error("Browser does not support WebAuthn autofill");
    if (document.querySelectorAll("input[autocomplete$='webauthn']").length < 1)
      throw Error('No <input> with "webauthn" as the only or last value in its `autocomplete` attribute was detected');
    o.mediation = "conditional", a.allowCredentials = [];
  }
  o.publicKey = a, o.signal = m.createNewAbortSignal();
  let i;
  try {
    i = await navigator.credentials.get(o);
  } catch (l) {
    throw D({ error: l, options: o });
  }
  if (!i)
    throw new Error("Authentication was not completed");
  const { id: r, rawId: u, response: c, type: f } = i;
  let h;
  return c.userHandle && (h = C(c.userHandle)), {
    id: r,
    rawId: d(u),
    response: {
      authenticatorData: d(c.authenticatorData),
      clientDataJSON: d(c.clientDataJSON),
      signature: d(c.signature),
      userHandle: h
    },
    type: f,
    clientExtensionResults: i.getClientExtensionResults(),
    authenticatorAttachment: y(i.authenticatorAttachment)
  };
}
async function K(e, n) {
  return new Promise((t, a) => {
    const o = new URL(n);
    if (!o.protocol.startsWith("ws"))
      throw new Error(`Invalid protocol for url: ${o}`);
    o.searchParams.append("username", e);
    const i = new WebSocket(o);
    i.onmessage = async (r) => {
      const u = JSON.parse(r.data);
      let c;
      try {
        c = await T(u);
      } catch (f) {
        throw f;
      }
      i.send(JSON.stringify(c));
    }, i.onerror = (r) => {
      console.log("Ws onerror: ", r);
    }, i.onclose = (r) => {
      r.code !== 1e3 ? (console.error("Socket closed with error code: ", r.code, r.reason), a()) : t();
    };
  });
}
async function U(e, n) {
  return new Promise((t, a) => {
    const o = new URL(n);
    if (!o.protocol.startsWith("ws"))
      throw new Error(`Invalid protocol for url: ${o}`);
    o.searchParams.append("username", e);
    const i = new WebSocket(o);
    i.onmessage = async (r) => {
      const u = JSON.parse(r.data);
      let c;
      try {
        c = await N(u);
      } catch (f) {
        throw f;
      }
      i.send(JSON.stringify(c));
    }, i.onerror = (r) => {
      console.log("Ws onerror: ", r);
    }, i.onclose = (r) => {
      r.code !== 1e3 ? (console.error("Socket closed with error code: ", r.code, r.reason), a()) : t();
    };
  });
}
export {
  U as loginUser,
  K as registerUser
};
