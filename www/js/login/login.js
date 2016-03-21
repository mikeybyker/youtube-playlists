(function(){
    'use strict';

    angular
        .module('sinisterwaltz.youtube')
        .controller('LoginController', LoginController);

    function LoginController(auth, $state, store, $log, $rootScope) {
        var vm = this;

        vm.login = login;
        vm.loggedIn = auth.isAuthenticated;

        function login(){
            auth.signin({
              // offline_access to get a refresh_token : I'm not using it here though!
              authParams: {
                    scope: 'openid name youtube offline_access',
                    device: 'Mobile device', // Note: device can be any value, such as a unique mobile device identifier.
                    connection_scopes: {
                      'google-oauth2': ['https://www.googleapis.com/auth/youtube']
                    }
              },
              connections: ['google-oauth2']
            }, function(profile, idToken, accessToken, state, refreshToken) {
                saveUser(profile, idToken, refreshToken);
                $rootScope.loggedIn = true;
                $state.go('playlist.list');
            }, function(err) {
                $log.error('Error :(', err);
            });
        }
        var saveUser = function(profile, token, refreshToken) {
            store.set('profile', profile);
            store.set('token', token);
            store.set('refreshToken', refreshToken);
            store.set('access_token', profile.identities[0].access_token);
        }
    }
}());