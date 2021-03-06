app.directive('post', function (LocalStorage, ApiService, $uibModal, $location) {
    return {
        restrict: 'E',
        scope: {
            photo: '='
        },
        templateUrl: 'directives/postView.html',
        controller: function ($scope) {

            $scope.commentLoading = false;
            $scope.voteLoading = false;
            $scope.showMessages = false;
            $scope.page = 1;

            $scope.loadComments = function () {

                // make click listener.
                // increase page ++1
                $scope.page = $scope.page + 1;
                getComments();

            };

            function getComments() {

                var page = $scope.page;
                var itemsPerPage = 10;
                var offset = (page - 1) * itemsPerPage;

                // get comments request.
                ApiService.getComments($scope.photo.id, offset, 10).then(
                    function (response) {
                        console.info(response);


                        $scope.photo.comments = $.merge($scope.photo.comments, response);
                    }, function (error) {
                        console.error(error);
                    }
                );

            }

            $scope.toggleMessages = function () {
                var usr = LocalStorage.getUser();
                if (!usr) {
                    showSignInRequiredModal();
                    return;
                }

                $scope.showMessages = !$scope.showMessages;
            };

            $scope.buildImageUrl = function (filename) {
                return ApiService.urlbuilder.photo('/images/' + filename);
            };

            $scope.displayMoment = function (createdAt) {
                return moment(createdAt, "YYYY-MM-DD HH:mm:ss").fromNow();
            };

            $scope.upvote = function (photo) {
                console.log('upvote button clicked');
                if (photo.upvote) {
                    console.log('You already upvoted');
                    return;
                }
                var usr = LocalStorage.getUser();
                if (!usr) {
                    showSignInRequiredModal();
                    return;
                }
                $scope.voteLoading = true;
                ApiService.upvote(usr.id, photo.id).then(function (resp) {
                    // If this is the first vote from this user then increase the number of total votes.
                    if (!photo.downvote && !photo.upvote) {
                        photo.totalVotes++;
                        photo.upvote_count++;
                    }

                    // If the previous vote was a upvote, then recalculate the counts
                    if (photo.downvote) {
                        photo.downvote_count--;
                        photo.upvote_count++;
                    }

                    // Let angular know which button to show on page
                    photo.downvote = false;
                    photo.upvote = true;
                    $scope.voteLoading = false;
                }, function (error) {
                    console.error(error);
                    $scope.voteLoading = false;
                });

            };

            $scope.downvote = function (photo) {
                console.log('downvote button clicked');
                if (photo.downvote) {
                    console.log('You already downvoted');
                    return;
                }
                var usr = LocalStorage.getUser();
                if (!usr) {
                    showSignInRequiredModal();
                    return;
                }
                $scope.voteLoading = true;
                ApiService.downvote(usr.id, photo.id).then(function (resp) {
                    // If this is the first vote from this user then increase the number of total votes.
                    if (!photo.downvote && !photo.upvote) {
                        photo.totalVotes++;
                        photo.downvote_count++;
                    }

                    // If the previous vote was a upvote, then recalculate the counts
                    if (photo.upvote) {
                        photo.upvote_count--;
                        photo.downvote_count++;
                    }

                    // Let angular know which button to show on page
                    photo.upvote = false;
                    photo.downvote = true;
                    $scope.voteLoading = false;
                }, function (error) {
                    console.error(error);
                    $scope.voteLoading = false;
                });
            };

            $scope.comment = function (photo) {
                var usr = LocalStorage.getUser();
                if (!usr) {
                    showSignInRequiredModal();
                    return;
                }
                $scope.commentLoading = true;
                ApiService.comment(usr.id, photo.id, $scope.comment_text).then(
                    function (response) {
                        console.info(response);
                        $scope.comment_text = '';
                        $scope.photo.comment_count++;
                        if ($scope.photo && $scope.photo.comments) {
                            $scope.photo.comments.push(response);
                        }
                        $scope.commentLoading = false;
                    },
                    function (error) {
                        console.error(error);
                        $scope.commentLoading = false;
                    }
                );
            }
            $scope.calcPerc = function (photo) {

                if (!photo) {
                    return '0 %';
                }

                var down = photo.downvote_count < 1 ? 0 : photo.downvote_count * 100;
                var up = photo.upvote_count < 1 ? 0 : photo.upvote_count * 100;

                if (down < 1 && up < 1) {
                    return '0 %';
                } else if (down < 1) {
                    return '100 %'
                } else if (up < 1) {
                    return '0 %'
                } else {
                    return Math.floor((up / (up + down) * 100)) + " %"
                }

            };

            function showSignInRequiredModal() {
                var modalInstance = $uibModal.open({
                    animation: true,
                    ariaLabelledBy: 'modal-title',
                    ariaDescribedBy: 'modal-body',
                    templateUrl: 'view/modal.html',
                    controller: function ($uibModalInstance) {
                        var $ctrl = this;
                        $ctrl.cancel = function () {
                            $uibModalInstance.dismiss('cancel');
                        };
                    },
                    controllerAs: '$ctrl',
                    size: 'sm'
                });

                // To disable error message in console:
                modalInstance.closed.then(function () {
                }, function () {
                });
                // To disable error message in console:
                modalInstance.result.then(function () {
                }, function () {
                });
            }

            $scope.openImage = function() {
                console.log("openImage called");
                var photo = $scope.photo;
                if (!photo) {
                    return;
                }

                $location.path('/photo/' + photo.id);
            }
        }
    }
});