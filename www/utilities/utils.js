(function(){
    'use strict';
    angular
        .module('sinisterwaltz.youtube')
        .factory('Utils', Utils)
        .controller('ConfirmModalController', ConfirmModalController)
        .filter('capitalize', capitalize);

    function Utils($q, $state, auth, store, $log, Popeye, toastr, $rootScope, $ionicLoading, $filter) {

        function logout(){
            var deferred = $q.defer();
            store.remove('profile');
            store.remove('token');
            store.remove('access_token');
            $rootScope.loggedIn = false;
            auth.signout(); // *has* to be last else the state change prevent will kick in
            return deferred.promise;
        }

        function confirmPopup(id){
            return Popeye.openModal({
                    templateUrl: 'utilities/confirm.html',
                    controller: 'ConfirmModalController as vm',
                    modalClass: 'medium',
                    resolve: {
                        id: function() {
                            return id;
                        }
                    }
                });
        }

        function showSuccess(message, title){
            var title = title || 'Success';
            toastr.success(message, title);
        }

        function showError(reason, title){
            var title = title || 'Bit of a problem...',
                message = angular.isObject(reason) ? getMessage(reason) : reason;
                $log.warn('showError ::: ', reason);
            toastr.error(message, title, {
                onHidden: function(){
                    if(reason.status === 401 || reason.status === 403){
                        logout()
                            .then(function(){
                                $state.go('login');
                            });
                    }
                }
            });
        }

        function showBusy(template){
            $ionicLoading.show({
              template: template || '<p>Loading...</p><ion-spinner></ion-spinner>'
            });
        }

        function hideBusy(){
            $ionicLoading.hide();
        }

        function getMessage(o){
            if(!o)
            {
                return 'Unknown Error';
            }
            if(o.data && o.data.error){
                return o.data.error.message;
            }
            return o.statusText || 'Yeah, something wrong...';
        }

        return {
            logout : logout,
            confirmPopup : confirmPopup,
            showSuccess : showSuccess,
            showError : showError,
            showBusy : showBusy,
            hideBusy : hideBusy
        }
    }

    function ConfirmModalController($scope, $log, id) {
        var vm = this;
        vm.confirm = confirm;
        function confirm(bool){
            $scope.$close({confirm: bool, id: id} );
        }
    }

    function capitalize(){
        return function(input) {
            return (!!input) ? input.charAt(0).toUpperCase() + input.substr(1).toLowerCase() : '';
        }
    }

}());
