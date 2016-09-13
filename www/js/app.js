(function(){
    'use strict';

    angular
        .module('sw-youtube', [
            'ionic',
            'sinisterwaltz.youtube',
            'ngCordova',
            'toastr',
            'auth0',
            'angular-storage',
            'angular-jwt',
            'pathgather.popeye'
        ])

    .config(function($stateProvider, $urlRouterProvider, $logProvider, $httpProvider, toastrConfig, authProvider, authconfig, jwtInterceptorProvider, jwtOptionsProvider) {

        $stateProvider
            .state('login',{
                url: '/login',
                templateUrl: 'js/login/login.html',
                controller: 'LoginController',
                controllerAs: 'vm'
            })

           .state('playlist', {
                url: '',
                abstract: true,
                templateUrl: 'double.html'
            })

            .state('playlist.list',{
                url: '/playlist',
                views: {
                    'appContent' :{
                        templateUrl: 'js/playlists/playlist.html',
                        controller: 'PlaylistsController',
                        controllerAs: 'vm'
                    },
                    'appMenu' :{
                        templateUrl: 'js/menu/menu.html',
                        controller: 'MenuController',
                        controllerAs: 'vm'
                    }
                },
                data: {
                    requiresLogin: true
                }
            })

            .state('playlist.edit',{
                url: '/playlist/:playlistId',
                views: {
                    'appContent' :{
                        templateUrl: 'js/playlists/edit.html',
                        controller: 'EditController',
                        controllerAs: 'vm'
                    },
                    'appMenu' :{
                        templateUrl: 'js/menu/menu.html',
                        controller: 'MenuController',
                        controllerAs: 'vm'
                    }
                },
                data: {
                    requiresLogin: true
                }
            })

            .state('playlist.add',{
                url: '/playlist/:playlistId/add',
                views: {
                    'appContent' :{
                        templateUrl: 'js/playlists/add.html',
                        controller: 'AddController',
                        controllerAs: 'vm'
                    },
                    'appMenu' :{
                        templateUrl: 'js/menu/menu.html',
                        controller: 'MenuController',
                        controllerAs: 'vm'
                    }
                },
                data: {
                    requiresLogin: true
                }
            })

        // $urlRouterProvider.when('', '/playlist');
        // $urlRouterProvider.otherwise('/playlist'); // hmmm?
        // https://github.com/angular-ui/ui-router/issues/2183
        // Fix Error: [$rootScope:infdig] 10 $digest() iterations reached. Aborting!
        $urlRouterProvider.otherwise(function($injector, $location){
            var $state = $injector.get('$state');
            $state.go('playlist.list');
        });

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

    })

    .run(function($ionicPlatform, $rootScope, $state, $log, auth, store, jwtHelper) {

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
    })

}());
