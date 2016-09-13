(function() {
    'use strict';

    angular
        .module('sw-youtube')
        .run(runBlock);

    function runBlock($ionicPlatform, $rootScope, $state, $log, auth, store, jwtHelper) {

        auth.hookEvents();

        $rootScope.$on('$stateChangeStart', stateChangeStart);

        function stateChangeStart(event, toState, toParams, fromState, fromParams, options){
            var token = store.get('token');
            if (token) {
                if (!jwtHelper.isTokenExpired(token)) {
                    if (!auth.isAuthenticated) {
                        auth.authenticate(store.get('profile'), token);
                    }
                } else {
                    // Don't want $state.go here
                    // as already handled by route protection (requiresLogin: true)
                }
            }
        };

        $ionicPlatform.ready(function() {
            if(window.cordova){
                if(window.cordova.plugins.Keyboard) {
                    cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
                    cordova.plugins.Keyboard.disableScroll(true);
                }
                if(window.cordova.plugins.InAppBrowser) {
                    window.open = window.cordova.InAppBrowser.open;
                }
            }

            if(window.StatusBar) {
                StatusBar.styleDefault();
            }

        });

    }

}());
