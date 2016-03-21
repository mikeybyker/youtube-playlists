(function(){
    'use strict';

    angular
        .module('sinisterwaltz.youtube', ['sinisterwaltz.youtube.config'])
        .constant('PRIVACY',
            {
                PUBLIC: 'public',
                PRIVATE: 'private'
            }
        );

}());
