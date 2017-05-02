(function(){
    'use strict';

    angular
        .module('sinisterwaltz.youtube')
        .controller('MenuController', MenuController);

    function MenuController(Utils) {
        var $ctrl = this;
        $ctrl.Utils = Utils;
    }

}());
