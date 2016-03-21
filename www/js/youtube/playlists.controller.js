(function(){
    'use strict';

    angular
        .module('sinisterwaltz.youtube')
        .controller('PlaylistsController', PlaylistsController)
        .controller('MenuController', MenuController)
        .controller('CreatePlaylistController', CreatePlaylistController);

    function PlaylistsController(auth, $state, store, YoutubeService, $log, Utils, YouTubeUtils) {
        var vm = this;

        vm.addPlaylist = addPlaylist;
        vm.getPlaylists = getPlaylists;
        vm.showActions = showActions;
        vm.removePlaylist = removePlaylist;
        vm.share = share;

        vm.playlists = [];
        vm.user = auth.profile.name;

        getPlaylists();

        function getPlaylists(){
            YoutubeService.getAllPlaylists()
                .then(function(response){
                    vm.playlists = response;
                }, function(reason){
                    $log.info('getAllPlaylists Error :(', reason);
                    Utils.showError(reason, 'Small Problem...');
                });
        }

        function logout(){
            Utils.logout();
            $state.go('login');
        }

        function addPlaylist(){
            var params = {
                    templateUrl: 'js/youtube/create.html',
                    controller: 'CreatePlaylistController as vm',
                    modalClass: 'medium red'
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
            YoutubeService.createPlaylist(config.playlist, config.status)
                .then(function(response){
                    Utils.showSuccess('Yup, created that!', 'Sweet');
                    vm.playlists = response;
                }, function(reason){
                    $log.info('createPlaylist Error :(', reason);
                    Utils.showError(reason, 'Small Problem...');
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
            YoutubeService.deletePlaylistUpdate({id: playlistId})
                .then(function(response){
                    Utils.showSuccess('You the boss, it is no more!', 'Gulp');
                    vm.playlists = response; // maybe happens too quick for youtube api...but still shoes deleted.
                }, function(reason){
                    $log.info('deletePlaylist Error :(', reason);
                    Utils.showError(reason, 'Small Problem...');
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
                    // $log.info('updatePlaylist :::', response);
                    playlist.status.privacyStatus = response.privacyStatus;
                }, function(reason){
                    $log.info('updatePlaylist Error :(', reason);
                    Utils.showError(reason, 'Small Problem...');
                });
        }

    }

    // Side Menu
    function MenuController(Utils) {
        var vm = this;
        vm.logout = logout;

        function logout()
        {
            Utils.logout();
        };
    }

    // addPlaylist modal controller
    function CreatePlaylistController($scope, $log, YouTubeUtils) {
        var vm = this;
        
        vm.reset = reset;
        vm.update = update;
        vm.changeStatus = changeStatus;
        vm.status =  YouTubeUtils.getInitialStatus();
        vm.master = {title:'', description:''};

        function reset(){
            vm.userlist = angular.copy(vm.master);
        }

        function changeStatus(){
            vm.status = YouTubeUtils.swapPrivacy(vm.status);
        }

        function update(userlist){
            vm.master = angular.copy(userlist);
            $scope.$close({playlist: vm.master, status: vm.status});
        }

        vm.reset();
    }

}());