(function(){
    'use strict';

    angular
        .module('sinisterwaltz.youtube')
        .controller('MenuController', MenuController);

    function MenuController(Utils) {
        var vm = this;
        vm.Utils = Utils;
    }

}());
