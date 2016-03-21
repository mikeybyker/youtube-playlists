(function(){

   'use strict';

    angular.module('sinisterwaltz.youtube.config', [])

    .constant('authconfig', {
            domain: 'YOUR_AUTH0_DOMAIN',
            clientID: 'YOUR_CLIENT_ID',
            callbackUrl: location.href,
            loginState: 'login'
        }
    );

}());