(function(){
    'use strict';

    angular
        .module('sinisterwaltz.youtube')
        .controller('PlaylistsController', PlaylistsController)
        .controller('CreatePlaylistController', CreatePlaylistController);

    function PlaylistsController(auth, $state, store, YoutubeService, $log, Utils, YouTubeUtils) {
        var $ctrl = this;

        $ctrl.addPlaylist = addPlaylist;
        $ctrl.getPlaylists = getPlaylists;
        $ctrl.showActions = showActions;
        $ctrl.removePlaylist = removePlaylist;
        $ctrl.share = share;

        $ctrl.playlists = [];
        $ctrl.user = auth.profile.name;

        if(auth.profile){
            getPlaylists();
        } else {
            $state.go('login');
        }

        function getPlaylists(){
            Utils.showBusy();
            YoutubeService.getAllPlaylists()
                .then(function(response){
                    $ctrl.playlists = response;
                }, function(reason){
                    $log.info('getAllPlaylists Error :(', reason);
                    Utils.showError(reason, 'Small Problem...');
                })
                .finally(function(){
                    Utils.hideBusy();
                });
        }

        function logout(){
            Utils.logout();
            $state.go('login');
        }

        function addPlaylist(){
            var params = {
                    templateUrl: 'playlists/create.html',
                    controller: 'CreatePlaylistController as $ctrl',
                    modalClass: 'large large50'
                };
            YouTubeUtils.openModal(params)
                .closed.then(function(config) {
                    if(!config || !config.playlist || !config.playlist.title){
                        return;
                    }
                    createPlaylist(config);
                });
        }

        function createPlaylist(config){
            Utils.showBusy();
            YoutubeService.createPlaylist(config.playlist, config.status)
                .then(function(response){
                    Utils.showSuccess('Yup, created that!', 'Sweet');
                    $ctrl.playlists = response;
                }, function(reason){
                    $log.info('createPlaylist Error :(', reason);
                    Utils.showError(reason, 'Small Problem...');
                })
                .finally(function(){
                    Utils.hideBusy();
                });
        }

        function share(playlistId){
            YouTubeUtils.share(playlistId);
        }

        function removePlaylist(playlistId){
            Utils.confirmPopup(playlistId)
                .closed.then(function(o) {
                    if(!o || !o.confirm || !o.id){
                        return;
                    }
                    deletePlaylist(o.id);
                });
        }

        function deletePlaylist(playlistId){
            Utils.showBusy();
            YoutubeService.deletePlaylistUpdate({id: playlistId})
                .then(function(response){
                    Utils.showSuccess('You the boss, it is no more!', 'Gulp');
                    $ctrl.playlists = response; // maybe happens too quick for youtube api...but still shows deleted.
                }, function(reason){
                    // $log.info('deletePlaylist Error :(', reason);
                    Utils.showError(reason, 'Small Problem...');
                })
                .finally(function(){
                    Utils.hideBusy();
                });
        }

        function showActions(playlist) {
            var buttonActions = function (index, button){
                    switch(button.id){
                        case 'edit' :
                            $state.go('playlist.edit', {playlistId: playlist.id});
                            break;
                        case 'share' :
                            YouTubeUtils.share(playlist.id);
                            break;
                        case 'toggle' :
                            changeStatus(playlist);
                            break;
                    }
                    return true;
                },
                destructiveActions = function(index) {
                    removePlaylist(playlist.id);
                    return true;
                };
            YouTubeUtils.showPlaylistActions(playlist, buttonActions, destructiveActions);
        }

        function changeStatus(playlist){
            var newStatus = YouTubeUtils.swapPrivacy(playlist.status), // copy
                params = YouTubeUtils.getUpdateProps(playlist);
            YoutubeService.updatePlaylist(params, newStatus)
                .then(function(response){
                    playlist.status.privacyStatus = response.privacyStatus;
                }, function(reason){
                    // $log.info('updatePlaylist Error :(', reason);
                    Utils.showError(reason, 'Small Problem...');
                });
        }

    }

    // add Playlist modal controller
    function CreatePlaylistController($scope, $log, YouTubeUtils) {
        var $ctrl = this;

        $ctrl.reset = reset;
        $ctrl.update = update;
        $ctrl.changeStatus = changeStatus;
        $ctrl.status =  YouTubeUtils.getInitialStatus();
        $ctrl.master = {title:'', description:''};

        function reset(){
            $ctrl.userlist = angular.copy($ctrl.master);
        }

        function changeStatus(){
            $ctrl.status = YouTubeUtils.swapPrivacy($ctrl.status);
        }

        function update(userlist){
            $ctrl.master = angular.copy(userlist);
            $scope.$close({playlist: $ctrl.master, status: $ctrl.status});
        }

        $ctrl.reset();
    }

}());
