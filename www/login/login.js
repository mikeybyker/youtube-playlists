(function(){
  'use strict';

  angular
    .module('sinisterwaltz.youtube')
    .controller('LoginController', LoginController);

  function LoginController(authService) {
    var $ctrl = this;
    $ctrl.login = authService.login;
  }
}());
