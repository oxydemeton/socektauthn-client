# socektauthn-client
@socektauthn/client is the browser client of the @socketauthn packages

[![JSR](https://jsr.io/badges/@socketauthn/client)](https://jsr.io/@socketauthn/client) [![JSR Score](https://jsr.io/badges/@socketauthn/client/score)](https://jsr.io/@socketauthn/client)

# socketauthn
The [@socketauthn](https://jsr.io/@socketauthn) family of packages is a combination of this client and a websocket api.

## Concept
The client calls the registerUser function in the browser. It creates a websocket connection to the api endpoint for the registration. The Server sends a registration config for @simplewebauthn/browser 's startRegistration function on open. The client responses when the authentication in finished.

The same applies when logging in.
