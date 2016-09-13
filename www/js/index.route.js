(function() {
    'use strict';

    angular
        .module('sw-youtube')
        .config(routerConfig);

    function routerConfig($stateProvider, $urlRouterProvider) {

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
    }

}());
