(function() {
    'use strict';

    angular
        .module('sw-youtube')
        .config(config);

    function config($httpProvider, toastrConfig, authProvider, authconfig, jwtInterceptorProvider, jwtOptionsProvider, $logProvider) {

        $logProvider.debugEnabled(true);

        toastrConfig.allowHtml = true;
        toastrConfig.timeOut = 3000;
        toastrConfig.positionClass = 'toast-top-center';
        toastrConfig.preventDuplicates = true;
        toastrConfig.progressBar = true;

        // Auth
        authProvider.init(authconfig);

        authProvider.on('authenticated', function($state, $timeout, $log, auth) {
            // This is after a refresh of the page
            // If the user is still authenticated, you get this event
            $timeout(function() {
                if($state.current.name === 'login'){
                    $state.go('playlist.list'); // Seems to do the trick...ish.
                }
            });
        });

        authProvider.on('logout', function($state) {
            $state.go('login');
        });

        // Adding the AUTH0 JWT to headers
        jwtInterceptorProvider.tokenGetter = function(store,  $log) {
            var token = store.get('token');
            if (!token) {
                return null;
            }
            return token; // CAN check for expired (IS a JWT)
        }

        $httpProvider.interceptors.push('jwtInterceptor');

        jwtOptionsProvider.config({
          whiteListedDomains: ['webtask.it.auth0.com', 'googleapis.com', 'localhost']
        });

    }

}());
