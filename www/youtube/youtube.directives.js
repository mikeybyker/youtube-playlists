/* global YT */
(function(){
    'use strict';

    angular
        .module('sinisterwaltz.youtube')
        .directive('playlistcard', playlistcard)
        .directive('videocard', videocard)
        .directive('youtube', youtube)
        .factory('youTubeService', youTubeService);

    function playlistcard(){
        return {
            restrict: 'E',
            scope: {
                snippet:   '=',
                status:    '=',
                id: '@',
                removePlaylist:   '&',
                sharePlaylist:   '&'
            },
            templateUrl: 'youtube/listcard.html'
        }
    }

    function videocard(){
        return {
            restrict: 'E',
            scope: {
                video:   '=',
                removeVideo:   '&',
                playVideo:   '&',
                selectVideo:   '&',
                isSearch:   '@'
            },
            templateUrl: 'youtube/videocard.html'
        }
    }

    // Inspired by: http://blog.oxrud.com/posts/creating-youtube-directive/
    function youtube(youTubeService) {
        return {
            restrict: 'E',
            scope: {
                height:         '@',
                width:          '@',
                videoid:        '@',
                videoParams:    '='
            },
            template: '<div></div>',
            link: function(scope, element, attrs) {
                var defaults = {
                        showinfo: 0,
                        rel: 0
                    },
                    player,
                    params = angular.extend(defaults, scope.videoParams);

                youTubeService
                    .setup()
                    .then(function(){
                        player = new YT.Player(element.children()[0], {
                            height: scope.height,
                            width: scope.width,
                            videoId: scope.videoid,
                            playerVars: params
                        });
                    });

            }
        }
    }

    /**
    * To make sure the youtube js is injected into the page - only once -
    * and keeping the api state (onYouTubeIframeAPIReady) available via a promise
    */
    function youTubeService($q, $document, $window){
        var deferred = $q.defer(),
            initialized = false;

        function init(){
            var $pagejs = angular.element($document).find('script'),
                js = angular
                        .element('<script/>')
                        .prop('src', 'https://www.youtube.com/iframe_api');
            $pagejs.eq(0).parent().prepend(js);
            initialized = true;
            $window.onYouTubeIframeAPIReady = function() {
                deferred.resolve();
            }
        }

        return {
            setup: function() {
                if(!initialized){
                    init();
                }
                return deferred.promise;
            }
        }
    }

}());
