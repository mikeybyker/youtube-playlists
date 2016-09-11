(function(){

   'use strict';

    angular.module('sinisterwaltz.youtube.config', [])

    .constant('authconfig', {
            domain: 'YOUR_AUTH0_DOMAIN',
            clientID: 'YOUR_CLIENT_ID',
            callbackUrl: location.href,
            loginState: 'login'
        }
    )
    // auth0 stopped (August 2016) sending the IdP access_token : need a backend proxy
    .constant('webtask',
        {
            api: 'YOUR_WEBTASK_URL'
        }
    );

}());