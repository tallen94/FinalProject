"use strict";

var LunchDate = Parse.Object.extend("LunchDate");

var map = L.map('map-container').setView([39.8282, -98.5795], 4);

L.tileLayer('https://api.tiles.mapbox.com/v4/mapbox.streets/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiamFrZXJzbm9ydGgiLCJhIjoiY2lmeDFkbWdzM200b3Vpa3J1c3ZpeGlvZiJ9.IoutzB1Q6QO_BFwIMelV2w', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox.streets',
    accessToken: 'pk.eyJ1IjoiamFrZXJzbm9ydGgiLCJhIjoiY2lmeDFkbWdzM200b3Vpa3J1c3ZpeGlvZiJ9.IoutzB1Q6QO_BFwIMelV2w'
}).addTo(map);

angular.module('LunchDate', ['ui.router', 'ngSanitize', 'ui.bootstrap']).run(function() {
	Parse.initialize("uIVTEdH6vgBbc0QWNwWf7mJG3i70feZ39xzm71v6", "aoAZx3sogatBjPOoBQ7kghv0xbhX07W0st5lEDRK");
})
.config(function($stateProvider, $urlRouterProvider) {
	$stateProvider

		.state('home', {
			url: '/home',
			templateUrl: 'partials/home.html',
			controller: 'HomeCtrl'
		})
		.state('login', {
			url: '/login',
			templateUrl: 'partials/login.html',
			controller: 'LoginCtrl'
		})
		.state('signup', {
			url: '/signup',
			templateUrl: 'partials/signup.html',
			controller: 'SignupCtrl'
		})
		.state('create-date', {
			url: '/create-date',
			templateUrl: 'partials/createlunchdate.html',
			controller: 'CreateLunchDateCtrl'
		});

		$urlRouterProvider.otherwise('/login');
})

.controller("MainCtrl", ['$scope', '$http', '$state' function($scope, $http, $state) {
	$scope.tabs;
	$scope.currentUser = Parse.User.current();
	if($scope.currentUser) {
		$state.go('home')
	} else {
		$scope.go('login');
	}

	// var request = {
	// 	method: 'GET',
	// 	url: 'search',
	// 	params: {
	// 		term: 'lunch',
	// 		location: 'Seattle'
	// 	}
	// };

	// Parse.Cloud.run('yelpApi', request, {
	// 	success: function(response) {
	// 		console.log("SUCCESS: " + response.body);
	// 	}, 
	// 	error: function(error) {
	// 		console.log("ERROR: " + error);
	// 	}
	// });
}])

.controller("HomeCtrl", ['$scope', '$rootScope', function($scope, $rootScope) {
	$scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) { 
		$rootScope.tabs = ['home', 'profile', 'logout'];
	})
}])

.controller("LoginCtrl", ['$scope', '$rootScope', '$state', function($scope, $rootScope, $state) {
	$scope.showInfo = false;

	$scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) { 
		$rootScope.tabs = ['login', 'signup'];
	})

	$scope.login = function(email, passwd) {
		Parse.User.logIn(email, passwd, {
			success: function(user) {
				$rootScope.currentUser = user;
				$state.go('home');
			},
			error: function(user, error) {
				console.log("LOGIN ERROR + " + error);
			}
		}) 
	}
}])


.controller("SignupCtrl", ['$scope', '$rootScope', function($scope, $rootScope) {
	$scope.newUser = {};

	$scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) { 
		$rootScope.tabs = ['login', 'signup'];
	})

	$scope.signup = function(photo, fName, lName, passwd, email) {
		if(photo == null) {
			photo = "images/default-profile.png";
		}
		var user = new Parse.User();
		user.set('fName', fName);
		user.set('lName', lName);
		user.set('username', email);
		user.set('password', passwd);
		user.set('photo', photo);

		user.signUp(null, {
			success: function(user) {
				console.log(user);
				$rootScope.currentUser = user;
			},
			error: function(user, error) {
				console.log("Signup error: " + error)
			}
		});
	}	
}])

.controller("CreateLunchDateCtrl", ['$scope', '$http','$uibModal', function ($scope, $http, $uibModal) {
    // need to include ui bootstrap js in js files for modal to work

    $scope.getYelpData = function () {
        if ($scope.yelpSearch == undefined) {
            $scope.yelpSearch = '';
        }
        var request = {
            method: 'GET',
            url: 'search',
            params: {
                term: $scope.yelpSearch,
                location: 'Seattle'
            }
        };

        Parse.Cloud.run('yelpApi', request, {
            success: function (response) {
                console.log(response.body.business);
                $scope.yelpResponses = response.body;
                var modalInstance = $uibModal.open({
                    templateUrl: 'partials/yelpmodal.html',
                    controller: 'YelpModalCtrl',
                    scope: $scope
                });

                modalInstance.result.then(function (selectedRestaurant) {
                    $scope.restaurant = selectedRestaurant;
                    console.log($scope.restaurant);

                })
            },
            error: function (error) {
                console.log(error);
            }
        });
    }
}])

.controller("YelpModalCtrl", ['$scope', '$uibModalInstance', function ($scope, $uibModalInstance) {
    $scope.selectedRestaurant = {};

    $scope.ok = function () {
        $uibModalInstance.close($scope.selectedRestaurant);
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }

    $scope.select = function (restaurant) {
        $scope.selectedRestaurant = restaurant;
    }
}])

.directive('sameAs', function() {
    return {
        require: 'ngModel',
        link: function(scope, elem, attrs, ngModel) {
            ngModel.$parsers.unshift(validate);

            // Force-trigger the parsing pipeline.
            scope.$watch(attrs.sameAs, function() {
                ngModel.$setViewValue(ngModel.$viewValue);
            });

            // Checks for validity
            function validate(value) {
                var isValid = scope.$eval(attrs.sameAs) == value;

                ngModel.$setValidity('same-as', isValid);

                return isValid ? value : undefined;
            }
        }
    };
});
