# YouTube Playlists

An Angular/Ionic/Cordova app to create, edit and share YouTube playlists.

### Uses
Angular, Bootstrap (sass), Popeye, Auth0-Angular & Lock (OAuth 2.0 authentication), UI-Router.

### Installation
```javascript
npm install
```

### Run
```javascript
ionic serve
```
### Simulator Testing [eg. android]
```javascript
ionic platform add android
ionic build android
ionic emulate android
```

### Setup YouTube
  - Login to [Google Developers Console](https://console.developers.google.com/home/dashboard) > Create a project (app)
  - Enable the YouTube Data API
  - Click Credentials > OAuth 2.0 client and add Authorized JavaScript origins (https://YOUR_AUTH0_DOMAIN.auth0.com) and Authorized redirect URI (https://YOUR_AUTH0_DOMAIN.auth0.com/login/callback)
  - Click Create - Take a note of Client Id and Client Secret

### Setup Auth0
  - Login to [auth0](https://auth0.com/) > create new app/api
  - Add allowed callbacks/CORS
  - Connections > Social > Turn on Google - add the Client ID and Client Secret from above
  - Permissions - select YouTube
  - In your app Settings, add Allowed Callback URLs and Allowed Origins (CORS) as needed (localhost with port number for local testing!)

### Obtaining the Identity Provider Access Token

Since August 2016, Auth0 removed the  IdP access token has been removed from the user profile (for security reasons - see https://auth0.com/docs/migrations)

This means a serverless setup is no longer possible - a separate backend is needed, which will use Auth0's token to request the IdP access token. Not quite as easy as it was before, but security and all...

Auth0 [provide information on the required steps here](https://auth0.com/docs/what-to-do-once-the-user-is-logged-in/calling-an-external-idp-api) - which includes various example backend code.

As an alternative, I've used a [webtask](https://webtask.io/) to do this.
### TL;DR
Setting up a webtask provides an url you can use as a proxy to make the Instagram calls.

#### Quick Steps
- [create a Non Interactive client](https://auth0.com/docs/what-to-do-once-the-user-is-logged-in/calling-an-external-idp-api)
- [Install webtask](https://webtask.io/cli)
- Create the webtask with youtube_idp_webtask.js*<sup>1</sup>
- Add the returned url to config.js*<sup>2</sup>

*<sup>1</sup> From the console:
```javascript
    wt create ext_idp_webtask.js
        -s CLIENT_ID=YOUR_NON_INTERACTIVE_AUTH0_CLIENT_ID
        -s CLIENT_SECRET=YOUR_NON_INTERACTIVE_AUTHO_CLIENT_SECRET
        -s ACCOUNT_NAME=YOUR_AUTH0_TENANT_NAME (e.g. yourdomain.eu)
        -s ID_TOKEN_CLIENT_SECRET=YOUR_CLIENT_SECRET
```

*<sup>2</sup>
From the webtask url, remove: "?webtask_no_cache=1"
and add "/call_ext_api"

eg. webtask returns
```javascript
https://webtask.it.auth0.com/api/run/wt-you-gmail_com-0/youtube_idp_webtask?webtask_no_cache=1
```
use
```javascript
https://webtask.it.auth0.com/api/run/wt-you-gmail_com-0/youtube_idp_webtask/call_ext_api
```
##### Add your webtask, plus [Auth0](https://auth0.com/) domain and clientID to **index.constants.js**

### Version
0.6.0

Mike