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

### Version
0.0.2

##### Add your [auth0](https://auth0.com/) domain and clientID to ** www/js/config-RENAME.js** and rename **config.js**

Mike