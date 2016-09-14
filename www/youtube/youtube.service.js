(function(){
    'use strict';

    angular
        .module('sinisterwaltz.youtube')
        .factory('YoutubeService', function($http, $q, store, $log, webtask){

            var BASE_API = 'https://www.googleapis.com/youtube/v3/',
                USE_JSONP = false,
                REQUESTS = {
                    SEARCH: 1,
                    CREATE_PLAYLIST: 2,
                    UPDATE_PLAYLIST: 3,
                    GET_PLAYLIST: 4,
                    GET_PLAYLISTS: 5,
                    DELETE_PLAYLIST: 6,
                    GET_PLAYLIST_ITEMS: 7,
                    ADD_PLAYLIST_ITEMS: 8,
                    DELETE_PLAYLIST_ITEM: 9,

                    properties: {
                        1: {name: 'search', operation: 'GET', path: 'search', params: {type: 'video', part: 'snippet', fields: 'items(id, snippet(title, thumbnails(high)))'}},
                        2: {name: 'create_playlist', operation: 'POST', path: 'playlists', params: {part: 'snippet,status'}},
                        3: {name: 'update_playlist', operation: 'PUT', path: 'playlists', params: {part: 'snippet,status'}},
                        4: {name: 'get_playlist', operation: 'GET', path: 'playlists', params: {part: 'snippet,status', fields: 'items(id,snippet,status)'}},
                        5: {name: 'get_playlists', operation: 'GET', path: 'playlists', params: {part: 'snippet,status', fields: 'items(id, status, snippet(title, description, tags, thumbnails/high, publishedAt))', mine: true}},
                        6: {name: 'delete_playlist', operation: 'DELETE', path: 'playlists', params: {}},
                        7: {name: 'get_playlist_items', operation: 'GET', path: 'playlistItems', params: {part: 'snippet', fields: 'items(id,snippet(title, description, resourceId, thumbnails/high))'}},
                        8: {name: 'post_playlist_items', operation: 'POST', path: 'playlistItems', params: {part: 'snippet'}},
                        9: {name: 'delete_playlist_items', operation: 'DELETE', path: 'playlistItems', params: {}}
                    }
                };

            function getEndPoint(path){
                return BASE_API + (path || '');
            }

            function getParams(options, props){
                var params,
                    token = store.get('token');// check expiration? Or already handled...
                if(!token){
                    return null;
                }
                // mix default params and token with options...
                // Use the jwtInterceptor to add in auth headers (see app.js config)
                params = angular.extend(options || {}, { webtask_no_cache: 1}, props.params);
                if(props.operation === 'GET' && USE_JSONP){
                    params.callback = 'JSON_CALLBACK';
                }
                return params;
            }

            function getConfig(operation, options){
                var props = REQUESTS.properties[operation],
                    params = getParams(options, props),
                    url = getEndPoint(props.path);
                return {url: url, params: params, method: props.operation};
            }

            function checkData(response){
                if(!response.data || !response.data.data){
                    return null;
                }
                return response.data.data;
            }

            function loadData(config, reqBody){
                var data = angular.extend({api_url: config.url, method: config.method}, reqBody || {});
                return  $http({
                            method: 'POST',
                            url: webtask.api,
                            data: data,
                            params: config.params
                        });
            }

            // Operations...

            function search(options){
                var config = getConfig(REQUESTS.SEARCH, options);
                if(!config.params){
                    return reject({status:500, statusText:'No bearer token'});
                }

                return loadData(config)
                    .then(function(response){
                        var data = checkData(response);
                        if(!data){
                            return $q.reject('Data returned is just wrong. That is all.');
                        }
                        if(data.error){
                            return reject({status:data.error.code, statusText: data.error.message});
                        }
                        return data.items || [];
                    });
            }

            function createPlaylist(playlist, status, options){
                assert(playlist.title, 'createPlaylist requires title');
                assert(status.privacyStatus, 'createPlaylist requires privacyStatus');
                var config = getConfig(REQUESTS.CREATE_PLAYLIST, options),
                    snippet = {
                        title: playlist.title || 'Unnamed Playlist',
                        description: playlist.description || 'Sample playlist for Data API',
                        tags: ['sinister-waltz']
                    };
                if(!config.params){
                    return reject({status:500, statusText:'No bearer token'});
                }

                return loadData(config, {snippet: snippet, status: status})
                    .then(function(result){
                        return getAllPlaylists();
                    }, function(reason){
                        $log.info('Error >  createPlaylist : ', reason);
                        return reject({status:500, statusText:'Could not create it, sorry'});
                    });
            }

            // status (if sent in) must contain privacyStatus > {privacyStatus: privacyStatus}
            function updatePlaylist(playlist, status, options){
                assert(playlist.id, 'updatePlaylist requires id');
                assert(playlist.title, 'updatePlaylist requires title');
                // assert(status.privacyStatus, 'updatePlaylist requires privacyStatus');
                var data,
                    config = getConfig(REQUESTS.UPDATE_PLAYLIST, options),
                    snippet = {
                        title: playlist.title,
                        tags: ['sinister-waltz']
                    };
                if(!config.params){
                    return reject({status:500, statusText:'No bearer token'});
                }
                if(playlist.description){
                    snippet.description = playlist.description;
                }
                data = {id: playlist.id, snippet: snippet};
                if(status){
                    data.status = status;
                }

                return loadData(config, data)
                    .then(function(response){
                        var data = checkData(response);
                        if(!data){
                            return $q.reject('Data returned is just wrong. That is all.');
                        }
                        var updatedSnippet = data.snippet,
                            updatedStatus = data.status;
                        if(!updatedSnippet || !updatedStatus){
                            return reject({status:500, statusText:'Could not update it, sorry'});
                        }
                        return {privacyStatus: updatedStatus.privacyStatus, title: updatedSnippet.title, description: updatedSnippet.description};
                    }, function(reason){
                        $log.info('Error >  updatePlaylist : ', reason);
                        return reject({status:500, statusText:'Could not update it, sorry'});
                    });
            }

            function getPlaylist(options){
                assert(options.id, 'getPlaylist requires id');
                var config = getConfig(REQUESTS.GET_PLAYLIST, options);
                if(!config.params){
                    return reject({status:500, statusText:'No bearer token'});
                }
                return loadData(config)
                    .then(function(response){
                        var data = checkData(response);
                        if(!data){
                            return $q.reject('Data returned is just wrong. That is all.');
                        }
                        if(data.error){
                            return reject({status:data.error.code, statusText: data.error.message});
                        }
                        if(data.items.length !== 1){
                            return reject({status:401, statusText: 'Problem trying to get this playlist...'});
                        }
                        return data.items[0];
                    });
            }

            function getAllPlaylists(options){
                var config = getConfig(REQUESTS.GET_PLAYLISTS, options);

                if(!config.params){
                    return reject({status:500, statusText:'No bearer token'});
                }

                return loadData(config)
                    .then(function(response){
                        var data = checkData(response);
                        if(!data){
                            return $q.reject('Data returned is just wrong. That is all.');
                        }
                        if(data.error){
                            return reject({status:data.error.code, statusText: data.error.message});
                        }
                        // @todo: Work out how to get YouTube to only send playlists tagged with sinister-waltz!
                        // Until then, do it manually...
                        return data.items.filter(function(playlist){
                            return playlist.snippet.tags &&
                                   playlist.snippet.tags.indexOf('sinister-waltz') !== -1;
                        });
                    });
            }

            function getPlaylistItems(options){
                assert(options.playlistId);
                var config = getConfig(REQUESTS.GET_PLAYLIST_ITEMS, options);
                if(!config.params){
                    return reject({status:500, statusText:'No bearer token'});
                }
                return loadData(config)
                    .then(function(response){
                        var data = checkData(response);
                        if(!data){
                            return $q.reject('Data returned is just wrong. That is all.');
                        }
                        if(data.error){
                            return reject({status:data.error.code, statusText: data.error.message});
                        }
                        return data.items
                    });
            }

            function deletePlaylist(options){
                assert(options.id, 'deletePlaylist requires id');
                var config = getConfig(REQUESTS.DELETE_PLAYLIST, options);
                if(!config.params){
                    return reject({status:500, statusText:'No bearer token'});
                }
                return loadData(config)
            }

            function deletePlaylistUpdate(options){
                assert(options.id, 'deletePlaylistUpdate requires id');
                return deletePlaylist(options)
                        .then(function(response){
                            return getAllPlaylists();
                        });
            }

            function addPlaylistItem(playlistId, videoId, options){
                var config = getConfig(REQUESTS.ADD_PLAYLIST_ITEMS, options),
                    snippet = {
                        playlistId: playlistId,
                        resourceId: {
                            kind: 'youtube#video',
                            videoId: videoId
                        }
                    };
                if(!config.params){
                    return reject({status:500, statusText:'No bearer token'});
                }
                return loadData(config, {snippet: snippet});
            }

            /**
            * For use in the same edit page - where we want to add an item and update the list/ng-repeat
            * i.e. add the item to the playlist, then go and get the items from the playlist
            */
            function addAndUpdate(playlistId, videoId, options){
                return addPlaylistItem(playlistId, videoId, options)
                        .then(function(){
                            return getPlaylistItems({playlistId: playlistId, maxResults: 10});
                        });
            }

            function deletePlaylistItem(options){
                assert(options.id, 'deletePlaylistItem requires id');
                var config = getConfig(REQUESTS.DELETE_PLAYLIST_ITEM, options);
                if(!config.params){
                    return reject({status:500, statusText:'No bearer token'});
                }
                return loadData(config)
                    .then(function(response){
                        return getPlaylistItems({playlistId: options.playlistId, maxResults: 10});
                    });
            }

            function reject(reason){
                reason = reason || {status:404, statusText:'Not Found'};
                var deferred = $q.defer();
                deferred.reject(reason);
                return deferred.promise;
            }

            function assert(condition, message) {
                if (!condition) {
                    message = message || 'Assertion failed';
                    throw new Error(message);
                }
            }

            return {

                search: function(options){
                    return search(options);
                },
                createPlaylist: function(playlist, status, options){
                    return createPlaylist(playlist, status, options);
                },
                updatePlaylist: function(playlist, status, options){
                    return updatePlaylist(playlist, status, options);
                },
                getPlaylist: function(options){
                    return getPlaylist(options);
                },
                getAllPlaylists: function(options){
                    return getAllPlaylists(options);
                },
                deletePlaylist: function(options){
                    return deletePlaylist(options);
                },
                deletePlaylistUpdate: function(options){
                    return deletePlaylistUpdate(options);
                },
                getPlaylistItems: function(options){
                    return getPlaylistItems(options);
                },
                addPlaylistItem: function(playlistId, videoId, options){
                    return addPlaylistItem(playlistId, videoId, options);
                },
                addAndUpdate: function(playlistId, videoId, options){
                    return addAndUpdate(playlistId, videoId, options);
                },
                deletePlaylistItem: function(options){
                    return deletePlaylistItem(options);
                }
            };
        });

}());
