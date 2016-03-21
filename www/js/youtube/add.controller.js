(function(){
    'use strict';

    angular
        .module('sinisterwaltz.youtube')
        .controller('AddController', AddController);

    function AddController($state, $stateParams, $log, YoutubeService, toastr, Popeye, Utils, YouTubeUtils) {
        var vm = this,
            playlistId = vm.playlistId = $stateParams.playlistId;
        
        vm.reset = reset;
        vm.update = update;
        vm.select = select;
        vm.playVideo = playVideo;

        vm.master = {artist:'The Cure', track:'Close To Me'}; // {artist:'', track:''};
        vm.results = [];

        if(!playlistId){
            $state.go('playlist');
        }

        function reset(){
            vm.usersearch = angular.copy(vm.master);
        }

        function update(usersearch){
            vm.master = angular.copy(usersearch);
            var q = vm.master.artist + ' ' + vm.master.track,
                options = {
                    q : q,
                    maxResults: 6
                };
            YoutubeService.search(options)
                .then(function(response){
                    // $log.info('search  :::', response);
                    vm.results = response;
                }, function(reason){
                    $log.info('search Error :(', reason);
                    Utils.showError(reason, 'Small Problem...');
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
                    }
                },
                params = {
                    templateUrl: 'js/youtube/youtube.html',
                    controller: 'YoutubeModalController as vm',
                    resolve: resolve,
                    modalClass: 'vlarge'
                };
            YouTubeUtils.openModal(params)
                .closed.then(function() {
                    //
                });
        }

        vm.reset();
    }

}());