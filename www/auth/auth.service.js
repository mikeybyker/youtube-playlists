(function () {

  'use strict';

  angular
    .module('sinisterwaltz.youtube')
    .service('authService', authService);

  function authService($rootScope, $state, $q, lock, authManager, jwtHelper) {

    var userProfile = JSON.parse(localStorage.getItem('profile')) || {};
    var deferredProfile = $q.defer();
    if (userProfile) {
      deferredProfile.resolve(userProfile);
      authManager.authenticate();
    }

    function login(options, fn) {
      lock.show(options, fn);
    }

    // Logging out just requires removing the user's
    // id_token and profile
    function logout() {
      var deferred = $q.defer();
      localStorage.removeItem('id_token');
      localStorage.removeItem('profile');
      authManager.unauthenticate();
      userProfile = {};
      deferred.resolve({}); // not too much point now...
      return deferred.promise;
    }


    // Set up the logic for when a user authenticates
    // This method is called from app.run.js
    function registerAuthenticationListener() {
      lock.on('authenticated', function (authResult) {

        localStorage.setItem('id_token', authResult.idToken);
        authManager.authenticate();
        lock.hide();

        // Redirect to default page
        $state.go('playlist.list');        
        // location.hash = '#/';


        lock.getProfile(authResult.idToken, function (error, profile) {
          if (error) {
            console.log(error);
          }

          localStorage.setItem('profile', JSON.stringify(profile));

          deferredProfile.resolve(profile);
        });

      });

      lock.on('authorization_error', function (err) {
        console.log('authorization_error: ', err);
      });

      
    }

    function getProfileDeferred() {
      return deferredProfile.promise;
    }

    function checkAuthOnRefresh() {
      var token = localStorage.getItem('id_token');
      if (token) {
        if (!jwtHelper.isTokenExpired(token)) {
          if (!$rootScope.isAuthenticated) {
            authManager.authenticate();
          }
        }
      } else {
        // Added this else; the refresh - no token case should be handled but doesn't seem to be (@todo)
        $state.go('login');
      }
    }


    return {
      login: login,
      logout: logout,
      registerAuthenticationListener: registerAuthenticationListener,
      getProfileDeferred: getProfileDeferred,
      checkAuthOnRefresh: checkAuthOnRefresh
    }
  }
})();
