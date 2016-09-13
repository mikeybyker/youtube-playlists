(function(){
    'use strict';

    angular
        .module('sinisterwaltz.youtube', [])
        .constant('PRIVACY',
            {
                PUBLIC: 'public',
                PRIVATE: 'private'
            }
        );
}());
