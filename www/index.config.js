(function() {
    'use strict';

    angular
      .module('sw-youtube')
      .config(config);

    function config($locationProvider, $httpProvider, toastrConfig, auth0config, jwtInterceptorProvider, jwtOptionsProvider, $logProvider, lockProvider) {

      $logProvider.debugEnabled(true);

      toastrConfig.allowHtml = true;
      toastrConfig.timeOut = 3000;
      toastrConfig.positionClass = 'toast-top-center';
      toastrConfig.preventDuplicates = true;
      toastrConfig.progressBar = true;


      lockProvider.init(auth0config);

      // Remove the ! from the hash so that auth0.js can properly parse it
      $locationProvider.hashPrefix('');

      jwtOptionsProvider.config({
        tokenGetter: function () {
          return localStorage.getItem('id_token');
        },
        unauthenticatedRedirectPath: '/login',
        whiteListedDomains: ['webtask.it.auth0.com', 'googleapis.com', 'localhost']
      });

      // Auth0 JWT headers
      jwtInterceptorProvider.tokenGetter = function() {
        var token = localStorage.getItem('id_token');
        if (!token) {
            return null;
        }
        return token;
      }

      $httpProvider.interceptors.push('jwtInterceptor');

    }

}());
