(function() {
    'use strict';

    angular
        .module('sw-youtube', [
            'ionic',
            'sinisterwaltz.youtube',
            'ngCordova',
            'toastr',
            'pathgather.popeye',
            'auth0.lock',
            'angular-jwt'
        ]);

}());
