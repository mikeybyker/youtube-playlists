/* global YT */
(function(){
    'use strict';

    angular
      .module('sinisterwaltz.youtube')
      .factory('youTubeService', youTubeService)
      .component('playlistcard', {
        bindings: {
          snippet: '<',
          status: '<',
          id: '@',
          removePlaylist: '&',
          sharePlaylist: '&'
        },
        templateUrl: 'youtube/listcard.html'
      })
      .component('videocard', {
        bindings: {
          video: '<',
          isSearch: '@',
          removeVideo: '&',
          playVideo: '&',
          selectVideo: '&'
        },
        templateUrl: 'youtube/videocard.html'
      })
      // Inspired by: http://blog.oxrud.com/posts/creating-youtube-directive/
      .component('youtube', {
        bindings: {
          height:         '@',
          width:          '@',
          videoid:        '@',
          videoParams:    '<'
        },
        template: '<div></div>',
        controller: function ($element, youTubeService) {
            var $ctrl = this,
              defaults = {
                showinfo: 0,
                rel: 0
              },
              player,
              params = angular.extend(defaults, $ctrl.videoParams);

              youTubeService
                .setup()
                .then(function(){
                  player = new YT.Player($element.children()[0], {
                    height: $ctrl.height,
                    width: $ctrl.width,
                    videoId: $ctrl.videoid,
                    playerVars: params
                  });
                });
        },
      });

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
