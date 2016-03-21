(function(){

   'use strict';

    angular.module('sinisterwaltz.youtube.config', [])

    .constant('authconfig', {
            domain: 'sinisterwaltz.eu.auth0.com',
            clientID: 'pUbBjs4rFIcsMyLZGutLZ2Tz64H5qQO0',
            callbackUrl: location.href,
            loginState: 'login'
        }
    );

}());
// Do not upload