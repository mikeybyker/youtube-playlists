(function() {
    'use strict';

    angular
      .module('sw-youtube')
      .run(runBlock);

    function runBlock($ionicPlatform, $rootScope, authService, authManager) {

      // Put the authService on $rootScope so its methods
      // can be accessed from the nav bar
      $rootScope.authService = authService;

      // Register the authentication listener that is set up in auth.service.js
      authService.registerAuthenticationListener();

      // This event gets triggered on URL change
      $rootScope.$on('$locationChangeStart', authService.checkAuthOnRefresh);

      // Register the synchronous hash parser
      // lock.interceptHash();

      // Use the authManager from angular-jwt to check for
      // the user's authentication state when the page is
      // refreshed and maintain authentication
      authManager.checkAuthOnRefresh();
      /*
        Since the storage mechanism that you use for storing tokens on the front end is at your discretion,
        the angular-jwt library needs to know how to retrieve them.
        This is done by providing a function which returns the token,
        and it is this function that is used when authManager.checkAuthOnRefresh is called.
        Setup the jwtOptionsProvider in index.config.js with your tokenGetter function.
      */

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

        // Register the authentication listener that is set up in auth.service.js
        authService.registerAuthenticationListener();

        // This event gets triggered on URL change
        $rootScope.$on('$locationChangeStart', authService.checkAuthOnRefresh);

      });

      // Check is the user authenticated before Ionic platform is ready
      authService.checkAuthOnRefresh();

    }

}());
