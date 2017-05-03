(function(){
    'use strict';

    angular
        .module('sinisterwaltz.youtube')
        .controller('MenuController', MenuController);

    function MenuController($state, authService) {
      var $ctrl = this;
      $ctrl.logout = logout;

      function logout(){
        authService.logout().finally(function(){
          $state.go('login');
        });
      }
    }

}());
