function _(e) {
  return new TextEncoder().encode(e);
}
function d(e) {
  const n = new Uint8Array(e);
  let t = "";
  for (const r of n)
    t += String.fromCharCode(r);
  return btoa(t).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}
function p(e) {
  const n = e.replace(/-/g, "+").replace(/_/g, "/"), t = (4 - n.length % 4) % 4, i = n.padEnd(n.length + t, "="), r = atob(i), a = new ArrayBuffer(r.length), o = new Uint8Array(a);
  for (let u = 0; u < r.length; u++)
    o[u] = r.charCodeAt(u);
  return a;
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
  constructor({ message: n, code: t, cause: i, name: r }) {
    super(n, { cause: i }), this.name = r ?? i.name, this.code = t;
  }
}
function I({ error: e, options: n }) {
  var i, r;
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
    if (((i = t.authenticatorSelection) == null ? void 0 : i.requireResidentKey) === !0)
      return new s({
        message: "Discoverable credentials were required but no available authenticator supported it",
        code: "ERROR_AUTHENTICATOR_MISSING_DISCOVERABLE_CREDENTIAL_SUPPORT",
        cause: e
      });
    if (((r = t.authenticatorSelection) == null ? void 0 : r.userVerification) === "required")
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
      return t.pubKeyCredParams.filter((o) => o.type === "public-key").length === 0 ? new s({
        message: 'No entry in pubKeyCredParams was of type "public-key"',
        code: "ERROR_MALFORMED_PUBKEYCREDPARAMS",
        cause: e
      }) : new s({
        message: "No available authenticator supported any of the specified pubKeyCredParams algorithms",
        code: "ERROR_AUTHENTICATOR_NO_SUPPORTED_PUBKEYCREDPARAMS_ALG",
        cause: e
      });
    if (e.name === "SecurityError") {
      const a = window.location.hostname;
      if (A(a)) {
        if (t.rp.id !== a)
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
  let i;
  try {
    i = await navigator.credentials.create(t);
  } catch (l) {
    throw I({ error: l, options: t });
  }
  if (!i)
    throw new Error("Registration was not completed");
  const { id: r, rawId: a, response: o, type: u } = i;
  let c;
  typeof o.getTransports == "function" && (c = o.getTransports());
  let f;
  if (typeof o.getPublicKeyAlgorithm == "function")
    try {
      f = o.getPublicKeyAlgorithm();
    } catch (l) {
      g("getPublicKeyAlgorithm()", l);
    }
  let h;
  if (typeof o.getPublicKey == "function")
    try {
      const l = o.getPublicKey();
      l !== null && (h = d(l));
    } catch (l) {
      g("getPublicKey()", l);
    }
  let w;
  if (typeof o.getAuthenticatorData == "function")
    try {
      w = d(o.getAuthenticatorData());
    } catch (l) {
      g("getAuthenticatorData()", l);
    }
  return {
    id: r,
    rawId: d(a),
    response: {
      attestationObject: d(o.attestationObject),
      clientDataJSON: d(o.clientDataJSON),
      transports: c,
      publicKeyAlgorithm: f,
      publicKey: h,
      authenticatorData: w
    },
    type: u,
    clientExtensionResults: i.getClientExtensionResults(),
    authenticatorAttachment: y(i.authenticatorAttachment)
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
      const i = window.location.hostname;
      if (A(i)) {
        if (t.rpId !== i)
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
  const i = {
    ...e,
    challenge: p(e.challenge),
    allowCredentials: t
  }, r = {};
  if (n) {
    if (!await O())
      throw Error("Browser does not support WebAuthn autofill");
    if (document.querySelectorAll("input[autocomplete$='webauthn']").length < 1)
      throw Error('No <input> with "webauthn" as the only or last value in its `autocomplete` attribute was detected');
    r.mediation = "conditional", i.allowCredentials = [];
  }
  r.publicKey = i, r.signal = m.createNewAbortSignal();
  let a;
  try {
    a = await navigator.credentials.get(r);
  } catch (l) {
    throw D({ error: l, options: r });
  }
  if (!a)
    throw new Error("Authentication was not completed");
  const { id: o, rawId: u, response: c, type: f } = a;
  let h;
  return c.userHandle && (h = C(c.userHandle)), {
    id: o,
    rawId: d(u),
    response: {
      authenticatorData: d(c.authenticatorData),
      clientDataJSON: d(c.clientDataJSON),
      signature: d(c.signature),
      userHandle: h
    },
    type: f,
    clientExtensionResults: a.getClientExtensionResults(),
    authenticatorAttachment: y(a.authenticatorAttachment)
  };
}
async function K(e, n) {
  return new Promise((t, i) => {
    const r = new URL(n);
    if (!r.protocol.startsWith("ws"))
      throw new Error(`Invalid protocol for url: ${r}`);
    r.searchParams.append("username", e);
    const a = new WebSocket(r);
    a.onmessage = async (o) => {
      const u = JSON.parse(o.data);
      let c;
      try {
        c = await T(u);
      } catch (f) {
        throw f;
      }
      a.send(JSON.stringify(c));
    }, a.onerror = (o) => {
      console.log("Ws onerror: ", o);
    }, a.onclose = (o) => {
      t(), console.info("Socket closed: ", o.reason);
    };
  });
}
async function U(e, n) {
  return new Promise((t, i) => {
    const r = new URL(n);
    if (!r.protocol.startsWith("ws"))
      throw new Error(`Invalid protocol for url: ${r}`);
    r.searchParams.append("username", e);
    const a = new WebSocket(r);
    a.onmessage = async (o) => {
      const u = JSON.parse(o.data);
      let c;
      try {
        c = await N(u);
      } catch (f) {
        throw f;
      }
      a.send(JSON.stringify(c));
    }, a.onerror = (o) => {
      console.log("Ws onerror: ", o);
    }, a.onclose = (o) => {
      t(), console.info("Socket closed: ", o.reason);
    };
  });
}
export {
  U as loginUser,
  K as registerUser
};
