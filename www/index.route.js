(function() {
    'use strict';

    angular
        .module('sw-youtube')
        .config(routerConfig);

    function routerConfig($stateProvider, $urlRouterProvider) {

        $stateProvider
            .state('login',{
                url: '/login',
                templateUrl: 'login/login.html',
                controller: 'LoginController',
                controllerAs: '$ctrl'
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
                        templateUrl: 'playlists/playlist.html',
                        controller: 'PlaylistsController',
                        controllerAs: '$ctrl'
                    },
                    'appMenu' :{
                        templateUrl: 'menu/menu.html',
                        controller: 'MenuController',
                        controllerAs: '$ctrl'
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
                        templateUrl: 'playlists/edit.html',
                        controller: 'EditController',
                        controllerAs: '$ctrl'
                    },
                    'appMenu' :{
                        templateUrl: 'menu/menu.html',
                        controller: 'MenuController',
                        controllerAs: '$ctrl'
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
                        templateUrl: 'playlists/add.html',
                        controller: 'AddController',
                        controllerAs: '$ctrl'
                    },
                    'appMenu' :{
                        templateUrl: 'menu/menu.html',
                        controller: 'MenuController',
                        controllerAs: '$ctrl'
                    }
                },
                data: {
                    requiresLogin: true
                }
            })

        // $urlRouterProvider.when('', '/playlist');
        // $urlRouterProvider.otherwise('/playlist');
        // https://github.com/angular-ui/ui-router/issues/2183
        // Fix Error: [$rootScope:infdig] 10 $digest() iterations reached. Aborting!
        $urlRouterProvider.otherwise(function($injector, $location){
            var $state = $injector.get('$state');
            $state.go('playlist.list');
        });
    }

}());
