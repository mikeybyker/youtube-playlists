(function(){
    'use strict';
    angular
        .module('sinisterwaltz.youtube')
        .factory('YouTubeUtils', YouTubeUtils)
        .controller('YoutubeModalController', YoutubeModalController)
        .filter('dummythumb', dummyThumb);

    function YouTubeUtils($log, $cordovaSocialSharing, $ionicLoading, PRIVACY, $ionicActionSheet, $filter, Popeye) {

        function getInitialStatus(){
            return {privacyStatus : PRIVACY.PRIVATE};
        }
        function updateStatus(status){
            return {privacyStatus: status.privacyStatus};
        }
        function swapPrivacy(status){
            var newStatus = angular.copy(status);
            newStatus.privacyStatus =  newStatus.privacyStatus === PRIVACY.PUBLIC ?
                PRIVACY.PRIVATE : PRIVACY.PUBLIC;
            return newStatus;
        }

        // Get the update props we need from a returned playlist
        function getUpdateProps(playlist){
            var o = {id: playlist.id};
            o.title = playlist.snippet.title;
            if(playlist.snippet.description){
                o.description = playlist.snippet.description;
            }
            return o;
        }

        function updatePlaylist(response){
            return {title: response.snippet.title, description: response.snippet.description, id: response.id};
        }

        function share(playlistId){
            // use social sharing plugin in ionic/cordova
            var url = 'https://www.youtube.com/playlist?list=' + playlistId;
            if(window.cordova && $cordovaSocialSharing){
                $log.info('OK! $cordovaSocialSharing');
                $cordovaSocialSharing
                    // message, subject, file, url
                    // .share(null, null, null, url) // Share via native share sheet
                    .share(null, 'Check out this playlist I made for you. Well, for me, mostly...', null, url) // Share via native share sheet
                    .then(function(result) {
                        // Success!
                    }, function(err) {
                        // An error occured. Show a message to the user
                    });
            } else {
                $log.info('NO $cordovaSocialSharing');
            }
        }

        function getActionProps(privacyStatus){
            var oppositePrivacy = privacyStatus === PRIVACY.PUBLIC ? PRIVACY.PRIVATE : PRIVACY.PUBLIC;
            return {
                icon: privacyStatus === PRIVACY.PUBLIC ? 'ion-eye' : 'ion-eye-disabled',
                text: $filter('capitalize')(oppositePrivacy),
                oppositePrivacy: oppositePrivacy,
                isPublic : privacyStatus === PRIVACY.PUBLIC
            };
        }

        function showPlaylistActions(playlist, buttonActions, destructiveActions){
            var params = {privacy: playlist.status.privacyStatus, titleText: 'Playlist Actions', destructiveText: 'Delete Playlist'},
                buttons = [
                    { text: '<i class="icon ion-plus"></i>Edit', id:'edit' }
                ];
            showActions(playlist, buttons, buttonActions, destructiveActions, params);
        }

        function showEditActions(playlist, status, buttonActions, destructiveActions){
            var params = {privacy: status.privacyStatus, titleText: 'Playlist Actions', destructiveText: 'Delete Playlist'},
                buttons = [
                    { text: '<i class="icon ion-plus"></i>Add Track', id:'add' }
                ];
            showActions(playlist, buttons, buttonActions, destructiveActions, params);
        }

        function showActions(playlist, buttons, buttonActions, destructiveActions, params) {
            var hideSheet,
                props = getActionProps(params.privacy);
            buttons.push({ text: '<i class="icon ' + props.icon + '"></i>Make ' + props.text, id:'toggle' });
            if(props.isPublic){
                buttons.unshift({ text: '<i class="icon ion-android-share-alt"></i>Share' , id:'share'});
            }
            // Show the action sheet
            hideSheet = $ionicActionSheet.show({
                titleText: params.titleText,
                buttons: buttons,
                destructiveText: params.destructiveText,
                buttonClicked: buttonActions,
                destructiveButtonClicked : destructiveActions
            });
        }

        function openModal(params){
            if (!params.templateUrl) {
                throw new Error('No template specified for the modal');
            }
            return Popeye.openModal(params);
        }

        return {
            getUpdateProps : getUpdateProps,
            getInitialStatus : getInitialStatus,
            swapPrivacy : swapPrivacy,
            updatePlaylist : updatePlaylist,
            updateStatus : updateStatus,
            share : share,
            showPlaylistActions : showPlaylistActions,
            showEditActions : showEditActions,
            openModal: openModal
        }
    }

    function YoutubeModalController($scope, $log, videoId) {
        var vm = this;
        vm.videoId = videoId;
    }

    function dummyThumb() {
        return function(input) {
            return input && input.indexOf('no_thumbnail') !== -1 ? 'img/dummy.png' : input;
        };
    }
}());