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

    .config(function($stateProvider, $urlRouterProvider, $logProvider, $httpProvider, toastrConfig, authProvider, authconfig, jwtInterceptorProvider) {

        $stateProvider
            .state('login',{
                url: '/login',
                templateUrl: 'templates/login.html',
                controller: 'LoginController',
                controllerAs: 'vm'
            })

           .state('playlist', {
                url: '',
                abstract: true,
                templateUrl: 'templates/double.html'
            })

            .state('playlist.list',{
                url: '/playlist',
                views: {
                    'appContent' :{
                        templateUrl: 'templates/playlist.html',
                        controller: 'PlaylistsController',
                        controllerAs: 'vm'
                    },
                    'appMenu' :{
                        templateUrl: 'templates/menu.html',
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
                        templateUrl: 'templates/edit.html',
                        controller: 'EditController',
                        controllerAs: 'vm'
                    },
                    'appMenu' :{
                        templateUrl: 'templates/menu.html',
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
                        templateUrl: 'templates/add.html',
                        controller: 'AddController',
                        controllerAs: 'vm'
                    },
                    'appMenu' :{
                        templateUrl: 'templates/menu.html',
                        controller: 'MenuController',
                        controllerAs: 'vm'
                    }
                },
                data: {
                    requiresLogin: true
                }
            })

            $urlRouterProvider.when('', '/playlist');
            $urlRouterProvider.otherwise('/playlist'); // hmmm?


        // Enable log
        $logProvider.debugEnabled(true);

        // Set toastr config
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

        // This is adding the GOOGLE ACCESS_TOKEN > Not the AUTH0 JWT
        jwtInterceptorProvider.tokenGetter = function(store,  $log) {
            var access_token = store.get('access_token');
            // $log.info('jwtInterceptorProvider : access_token : ', access_token);
            if (!access_token) {
                return null;
            }
            return access_token; // can't check for expired (not a JWT)
        }

        $httpProvider.interceptors.push('jwtInterceptor');

    })

    .run(function($ionicPlatform, $rootScope, $state, $log, auth, store, jwtHelper) {

        auth.hookEvents();

        $rootScope.$on('$stateChangeStart', stateChangeStart);

        function stateChangeStart(event, toState, toParams, fromState, fromParams, options){
            // $log.info('stateChangeStart > toState ::: ', toState);
            // $log.info('stateChangeStart > fromState ::: ', fromState);
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