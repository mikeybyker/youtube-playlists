(function(){
  'use strict';

  angular
    .module('sinisterwaltz.youtube')
    .controller('AddController', AddController);

  function AddController($state, $stateParams, $log, YoutubeService, Utils, YouTubeUtils) {
    var $ctrl = this,
    playlistId = $ctrl.playlistId = $stateParams.playlistId;

    $ctrl.reset = reset;
    $ctrl.update = update;
    $ctrl.select = select;
    $ctrl.playVideo = playVideo;

    $ctrl.master = { artist:'The Cure', track:'Close To Me' }; // {artist:'', track:''};
    $ctrl.results = [];

    if(!playlistId){
      $state.go('playlist');
    }

    function reset(){
      $ctrl.usersearch = angular.copy($ctrl.master);
    }

    function update(usersearch){
      $ctrl.master = angular.copy(usersearch);
      var q = $ctrl.master.artist + ' ' + $ctrl.master.track,
      options = {
        q : q,
        maxResults: 6
      };
      Utils.showBusy();
      YoutubeService.search(options)
        .then(function(response){
            // $log.info('search  :::', response);
            $ctrl.results = response;
          }, function(reason){
            $log.info('search Error :(', reason);
            Utils.showError(reason, 'Small Problem...');
          })
        .finally(function(){
          Utils.hideBusy();
        });
    }

    function select(video){
      var id = video.id && video.id.videoId;
      if(!id){
        return;
      }
      Utils.showBusy();
      YoutubeService.addPlaylistItem(playlistId, id)
        .then(function(response){
          Utils.showSuccess('OK, <strong>' + video.snippet.title + '</strong> has been added!', 'Success');
        }, function(reason){
          $log.info('addPlaylistItem Error :(', reason);
          Utils.showError(reason, 'Small Problem...');
        })
        .finally(function(){
          Utils.hideBusy();
        });
    }

    function playVideo(video){
      var resolve =  {
        videoId: function() {
          return video.id.videoId;
        },
        videoParams: function() {
          return {};
        }
      },
      params = {
        templateUrl: 'youtube/youtube.html',
        controller: 'YoutubeModalController as $ctrl',
        resolve: resolve,
        modalClass: 'vlarge red'
      };
      YouTubeUtils.openModal(params)
        .closed.then(function() {
          //
        });
    }

    $ctrl.reset();
  }

}());
