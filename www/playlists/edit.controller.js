(function(){
    'use strict';

    angular
        .module('sinisterwaltz.youtube')
        .controller('EditController', EditController);

    function EditController($state, $stateParams, $log, $ionicScrollDelegate, auth, store, YoutubeService, Popeye, Utils, YouTubeUtils) {
        var $ctrl = this,
            playlistId = $ctrl.playlistId = $stateParams.playlistId,
            videoParams = {controls: 1, modestbranding: 1};

        $ctrl.removeVideo = removeVideo;
        $ctrl.playVideo = playVideo;
        $ctrl.showActions = showActions;
        $ctrl.playlist = {};
        $ctrl.status =  YouTubeUtils.getInitialStatus();
        $ctrl.playlistItems = [];
        $ctrl.user = auth.profile && auth.profile.name;

        if(!playlistId){
            $state.go('playlist');
        }

        init(playlistId);

        function addToPlaylist(video){
            var id = video.id && video.id.videoId;
            if(!id){
                return;
            }
            Utils.showBusy();
            YoutubeService.addAndUpdate(playlistId, id)
                .then(function(response){
                    $ctrl.playlistItems = response;
                }, function(reason){
                    $log.info('addAndUpdate Error :(', reason);
                    Utils.showError(reason, 'Small Problem...');
                })
                .finally(function(){
                    Utils.hideBusy();
                });
        }

        function init(playlistId){
            Utils.showBusy();
            YoutubeService.getPlaylist({id:playlistId})
                .then(function(response){
                    $ctrl.playlist = YouTubeUtils.updatePlaylist(response);
                    $ctrl.status = YouTubeUtils.updateStatus(response.status);
                    return response.id; // Should(!) be the same as playlistId!
                })
                .then(function(receivedPlaylistId){
                    // $log.info('receivedPlaylistId === playlistId ::: ', receivedPlaylistId === playlistId);
                    getPlaylistItems(receivedPlaylistId);
                }, function(reason){
                    $log.info('getPlaylist Error :(', reason);
                    Utils.showError(reason, 'Small Problem...');
                })
                .finally(function(){
                    Utils.hideBusy();
                });
        }

        function getPlaylistItems(playlistId){
            var options = {
                playlistId: playlistId,
                maxResults: 10
            };
            YoutubeService.getPlaylistItems(options)
                .then(function(response){
                    $ctrl.playlistItems = response;
                }, function(reason){
                    $log.info('getPlaylistItems Error :(', reason);
                    Utils.showError(reason, 'Small Problem...');
                });
        }

        function logout(){
            Utils.logout()
                .then(function(){
                    $state.go('login');
                });
        }

        function changeStatus(){
            var newStatus = YouTubeUtils.swapPrivacy($ctrl.status);
            Utils.showBusy();
            YoutubeService.updatePlaylist($ctrl.playlist, newStatus)
                .then(function(response){
                    $ctrl.status.privacyStatus = response.privacyStatus;
                }, function(reason){
                    $log.info('updatePlaylist Error :(', reason);
                    Utils.showError(reason, 'Small Problem...');
                })
                .finally(function(){
                    Utils.hideBusy();
                });
        }

        function showActions(playlist) {
            var buttonActions = function actionSheetCallback(index, button){
                    switch(button.id){
                        case 'add' :
                            $state.go('playlist.add', {playlistId: $ctrl.playlistId});
                            break;
                        case 'share' :
                            YouTubeUtils.share($ctrl.playlist.id);
                            break;
                        case 'toggle' :
                            changeStatus();
                            break;
                    }
                    return true;
                },
                destructiveActions = function(index) {
                    removePlaylist($ctrl.playlist.id);
                    return true;
                };
            YouTubeUtils.showEditActions($ctrl.playlist, $ctrl.status, buttonActions, destructiveActions);
        }

        function removeVideo(video, index){
            Utils.confirmPopup(video.id)
                .closed.then(function(o) {
                    if(!o || !o.confirm || !o.id){
                        return;
                    }
                    deleteVideo(o.id, index);
                });
        }

        function deleteVideo(videoId, index){
            Utils.showBusy();
            YoutubeService
                .deletePlaylistItem({playlistId:playlistId, id: videoId})
                .then(function(response){
                    $ctrl.playlistItems = response;
                    Utils.showSuccess('Righto, it has gone!', 'Tada');
                    // Not very good thing to do, but brings the list back in view if the last item was deleted.
                    if(index === $ctrl.playlistItems.length){
                        var result = document.getElementsByClassName('item'),
                            h = result[0].offsetHeight;
                        if(result && h){
                            $ionicScrollDelegate.scrollBy(0, -h, true);
                        }
                    }
                }, function(reason){
                    $log.info('deleteVideo Error :(', reason);
                    Utils.showError(reason, 'Small Problem...');
                })
                .finally(function(){
                    Utils.hideBusy();
                });
        }

        // Unfortunately many videos won't play due to rights etc. (vimeo etc.). So not a great feature really.
        function playVideo(video){
            var resolve = {
                    videoId: function() {
                        return video.snippet.resourceId.videoId;
                    },
                    videoParams: function() {
                        return videoParams;
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

        function removePlaylist(playlistId){
            Utils.confirmPopup(playlistId)
                .closed.then(function(o) {
                    if(!o || !o.confirm || !o.id){
                        return;
                    }
                    $log.info('remove > playlistId :::', o.id);
                    deletePlaylist(o.id);
                });
        }

        function deletePlaylist(playlistId){
            Utils.showBusy();
            YoutubeService.deletePlaylist({id: playlistId})
                .then(function(response){
                    Utils.showSuccess('You the boss, it is no more!', 'Gulp');
                    Utils.hideBusy();
                    $state.go('playlist.list');
                }, function(reason){
                    $log.info('deletePlaylist Error :(', reason);
                    Utils.showError(reason, 'Small Problem...');
                })
                .finally(function(){
                    Utils.hideBusy();
                });
        }

    }

}());

//@todo : strip this controller down...

/*
// eg. for changing title
function changeTitle(newTitle){
    var copied = angular.copy($ctrl.playlist);
    copied.title = newTitle; // probably from an input etc.
    YoutubeService.updatePlaylist(copied, null)
        .then(function(response){
            $ctrl.playlist.title = response.title;
        }, function(reason){
            $log.info('updatePlaylist Error :(', reason);
            Utils.showError(reason, 'Small Problem...');
        });
}
*/
