'use strict';

/* global angular, console, $, window, _*/

angular.module('photobook', ['ngRoute', 'ui.bootstrap', 'photobook.controllers', 'photobook.directives', 'photobook.services'])
	.config(['$routeProvider',
				 function ($routeProvider) {
			$routeProvider
				.when('/login', {
					templateUrl: 'partials/login.html'
				})
				.when('/login/:msg', {
					templateUrl: 'partials/login.html',
					controller: 'ErrorLoginController'
				}) 
				.when('/photos', {
					templateUrl: 'partials/photo-list.html',
					controller: 'PhotoListController'
				})
				.when('/telechargement', {
					templateUrl: 'partials/telechargement.html'
				})
				.otherwise({
					redirectTo: '/photos'
				});
				 }])

.run(['$rootScope', '$location', '$http',
			function ($rootScope, $location, $http) {
		$rootScope.$on('$routeChangeStart', function (event, next) {

			if (next && next.$$route && next.$$route.templateUrl.indexOf('/login') < 0) {
				$http({
					method: 'GET',
					url: 'role'
				}).success(function (data) {
					//$rootScope.$apply(function () {
						if (data === 'guest') $location.path('/login');
					//});
				});
			}
		});
			}]);

angular.module('photobook.controllers', ['infinite-scroll'])
	.filter('reverse', function () {
		return function (items) {
			return items.slice().reverse();
		};
	})
	.controller('ErrorLoginController', ['$scope',
																		 function ($scope) {
			$scope.msg = 'Le nom d\'utilisateur ou le mot de passe saisi est incorrect';
																		 }])
	.controller('NavController', ['$rootScope', '$http', '$location', 'roleServices',

															function ($rootScope, $http, $location, roleServices) {

			$rootScope.disconnect = function () {

				$http({
					method: 'GET',
					url: 'disconnect'
				}).
				success(function () {
					$location.path('/login');
				});
			};

			roleServices.current().success(function (data) {
				$rootScope.role = data;

				if ($rootScope.role === 'admin') {
					$rootScope.isAdmin = true;
				}
			});

															}])
	.controller('PhotoListController', ['$scope', '$rootScope', '$routeParams', '$location', '$http', 'photoServices', '$route',

																		function ($scope, $rootScope, $routeParams, $location, $http, photoServices, $route) {

			$scope.page = 0;

			$scope.photos = [];

			$scope.loadMore = function () {

				var index = $scope.page;

				photoServices.count().success(function (nbDataR) {

					var nbData = (parseInt(nbDataR) / 9) + 1;

					if (index < nbData) {
						photoServices.pagePhotos(index).success(function (data) {

							for (var i = 0; i < data.length; i++) {
								$scope.photos.push(data[i]);
							}

							$scope.photos.sort(function (photo1, photo2) {
								return photo1.photoId - photo2.photoId;
							});

							$scope.photos = _.uniq($scope.photos, true, function (photo) {
								return photo.photoId;
							});

							$scope.page = index + 1;
						});
					}
				}).error(function (err) {
					console.log(err);
				})
			};

			$scope.deletePhoto = function (photo) {
				$http({
					method: 'DELETE',
					url: 'photos/imageid/' + photo.img
				}).
				success(function () {

					$route.reload();
				});
			};
																		}]);

angular.module('photobook.services', [])
	.service('roleServices', ['$http',

													function ($http) {
			this.current = function () {
				return $http({
					method: 'GET',
					url: 'role',
					cache: true
				});
			};
													}])
	.service('commentServices', ['$http',

														 function ($http) {
			this.comment = function (img, text) {
				return $http.post(
					'comments', {
						img: img,
						comment: text
					});
			};
														 }])
	.service('photoServices', ['$http',
													 function ($http) {


			this.count = function () {
				return $http({
					method: 'GET',
					url: 'photos/count'
				});
			};
			this.pagePhotos = function (page) {
				return $http({
					method: 'GET',
					url: 'photos/page/' + page
				});
			};
													 }]);

angular.module('photobook.directives', [])
	.directive('dropZone', function () {
		return function (scope, element) {
			element.dropzone({
				url: 'photos/upload',
				maxFilesize: 100,
				paramName: 'uploadfile',
				maxThumbnailFilesize: 5,
				dictDefaultMessage: 'Glisser les photos ici'
			});
		};
	})
	.directive('myScrollbarSrc', ['$window',
															function ($window) {
			return function (scope, element) {

				angular.element($window).bind('resize', function () {
					scope.$apply(function () {
						//console.log('<resize');
						scope.photo.css = element.css('height');
						//console.log('resize>');
					});
				});

				element.on('load', function () {

					scope.$apply(function () {
						scope.photo.css = element.css('height');
					});
				});
			};
															}])
	.directive('myScrollbar', function () {
		return function (scope, element) {

			scope.$watch('photo.css', function (newValue) {
				if (newValue) {

					element.slimScroll({
						height: newValue
					});


					element.css('height', newValue);
				}
			});
		};
	})
	.directive('vote', ['commentServices',

										function (commentServices) {

			return {
				restrict: 'A',
				link: function (scope, element) {
					angular.element(element).bind('click', function () {
						var my_new_comment = {
							text: scope.photo.new_comment
						};

						if (scope.photo.new_comment !== '') {

							scope.photo.comment.push(my_new_comment);

							commentServices.comment(scope.photo.img, scope.photo.new_comment)
								.success(function () {

									scope.photo.new_comment = '';
								});
						}
					});
				}
			};
										}]);
