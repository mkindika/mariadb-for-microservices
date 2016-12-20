app.factory('ApiService', function ($http, $q, LocalStorage, Upload) {

    var photo_url = '.';
    var authentication_url = '.';
    var profile_url = '.';
    var vote_url = '.';
    var comment_url = '.';
    var settings = {
        debug: true
    };

    function composeAuthenticationUrl(url) {
        return authentication_url + url;
    }

    function composeProfileUrl(url) {
        return profile_url + url;
    }

    function composePhotoUrl(url) {
        return photo_url + url;
    }

    function composeVoteUrl(url) {
        return vote_url + url;
    }

    function composeCommentUrl(url) {
        return comment_url + url;
    }

    function call() {
        // TODO refactor that all calls go through this function
    }

    function get(url) {
        if (settings.debug) {
            console.log('API: GET ' + url);
        }

        var promise = $q.defer();
        $http.get(url, {
            headers: {
                // TODO : Authorization: getAccessToken()
            }
        }).then(function success(response) {
            promise.resolve(response.data);
        }, function error(response) { // Error callback

            if (settings.consoleDebug) {
                console.log(response);
            }

            // Handle error
            // TODO : errorHandler(response, promise);
            promise.reject(response);

        });
        return promise.promise;
    }

    function post(url, options) {

        if (settings.debug) {
            console.log('API: POST ' + url);
        }

        var promise = $q.defer();

        $http.post(url, options, {
            headers: {
                'Content-Type': 'application/json; charset=UTF-8'
            }
        }).then(function success(response) {
            promise.resolve(response.data);
        }, function error(response) { // Error callback

            if (settings.debug) {
                console.log(response);
            }
            // Handle error
            // TODO : errorHandler(response, promise);
            promise.reject(response);

        });

        return promise.promise;
    }

    function put(url, options) {

        console.info(options);

        if (settings.debug) {
            console.log('API: PUT ' + url);
        }

        var promise = $q.defer();

        $http.put(url, options, {
            headers: {
                'Content-Type': 'application/json; charset=UTF-8'
            }
        }).then(function success(response) {
            promise.resolve(response.data);
        }, function error(response) { // Error callback

            if (settings.debug) {
                console.log(response);
            }
            promise.reject(response);

        });

        return promise.promise;
    }

    return {
        login: function (username, password) {
            var part = '/token-auth?username=' + username + '&password=' + password;
            var url = composeAuthenticationUrl(part);
            return post(url, {});
        },
        register: function (username, email, password) {
            var url = composeProfileUrl('/users');
            return post(url, {username: username, password: password, email: email});
        },
        upload: function (user_id, file, title) {
            var url = composePhotoUrl('/image/' + user_id + "?title=" + title);
            return Upload.upload({
                url: url,
                data: {file: file}
            });
        },
        incoming: function () {
            if (LocalStorage.hasToken()) {
                return get(composePhotoUrl('/image/list?token=' + LocalStorage.getToken()));
            } else {
                return get(composePhotoUrl('/image/list'));
            }
        },
        toprated: function () {
            if (LocalStorage.hasToken()) {
                return get(composePhotoUrl('/image/toprated?token=' + LocalStorage.getToken()));
            } else {
                return get(composePhotoUrl('/image/toprated'));
            }
        },
        hot: function () {
            if (LocalStorage.hasToken()) {
                return get(composePhotoUrl('/image/hot?token=' + LocalStorage.getToken()));
            } else {
                return get(composePhotoUrl('/image/hot'));
            }
        },
        updateUser: function (user) {
            var url = composeProfileUrl('/users?token=' + LocalStorage.getToken());
            return put(url, user);
        },
        upvote: function (user_id, photo_id) {
            var url = composeVoteUrl('/votes');
            var options = {
                user_id: user_id,
                photo_id: photo_id,
                upvote: true
            };
            console.info(options);
            return post(url, options);
        },
        downvote: function (user_id, photo_id) {
            var url = composeVoteUrl('/votes');
            var options = {
                user_id: user_id,
                photo_id: photo_id,
                downvote: true
            };
            console.info(options);
            return post(url, options);
        },
        comment: function (user_id, photo_id, comment) {
            var url =  composeCommentUrl('/comments');
            var options = {
                user_id: user_id,
                photo_id: photo_id,
                comment: comment
            }
            console.info(options);
            return post(url, options);
        },
        urlbuilder : {
            authenication: composeAuthenticationUrl,
            vote: composeVoteUrl,
            comment: composeCommentUrl,
            profile: composeProfileUrl,
            photo: composePhotoUrl
        }
    }
});