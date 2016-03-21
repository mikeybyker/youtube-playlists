/* global YT */
(function(){
    'use strict';

    angular
        .module('sinisterwaltz.youtube')    
        .directive('playlistcard', playlistcard)
        .directive('videocard', videocard)
        .directive('youtube', youtube);

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
            templateUrl: 'js/youtube/listcard.html'
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
            templateUrl: 'js/youtube/videocard.html'
        }
    }

    // A slightly edited version of: http://blog.oxrud.com/posts/creating-youtube-directive/
    // Given using in a modal window, need to be a bit careful with adding the YT script over and again.
    function youtube($window) {
        return {
            restrict: 'E',
            scope: {
                height:   '@',
                width:    '@',
                videoid:  '@'
            },
            template: '<div></div>',
            link: function(scope, element, attrs) {
                var tag = document.createElement('script'),
                    scriptTags = document.getElementsByTagName('script'),
                    player,
                    firstScriptTag = document.getElementsByTagName('script')[0],
                    fn = function(){
                        player = new YT.Player(element.children()[0], {
                            playerVars: {
                                autoplay: 0,
                                html5: 1,
                                theme: 'light',
                                modesbranding: 0,
                                color: 'white',
                                iv_load_policy: 3,
                                showinfo: 0,
                                controls: 1
                            },

                            height: scope.height,
                            width: scope.width,
                            videoId: scope.videoid
                        });
                };
                tag.src = 'https://www.youtube.com/iframe_api';

                if(typeof YT === 'undefined'){
                    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
                } else {
                    fn();
                }
                $window.onYouTubeIframeAPIReady = fn;
            }
        }
    }



}());