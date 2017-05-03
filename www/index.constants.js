(function(){

   'use strict';

    angular.module('sw-youtube')

    .constant('auth0config',
      {
        domain: 'sinisterwaltz.eu.auth0.com',
        clientID: 'pUbBjs4rFIcsMyLZGutLZ2Tz64H5qQO0',
        callbackUrl: location.href,
        loginState: 'login',
        options: {
          allowedConnections: ['google-oauth2'],
          auth: {
            redirect: false,
              sso: true, // so we get the 'last time you logged in with...'
              params: {
                scope: 'openid name youtube offline_access',
                device: 'Mobile device',
                connection_scopes: {
                  'google-oauth2': ['https://www.googleapis.com/auth/youtube']
                }
              }
          }
        }
      }
    )

    // auth0 stopped (August 2016) sending the IdP access_token : need a backend proxy
    // A webtask will do it...
    // See README for webtask info...Else write your backend code to do the same
    .constant('webtask',
      {
        api: 'https://webtask.it.auth0.com/api/run/wt-mikeybyker-gmail_com-0/youtube_idp_webtask/call_ext_api'
      }
    );

}());
