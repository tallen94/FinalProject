"use strict";

var LunchDate = Parse.Object.extend("LunchDate");

angular.module('LunchDate', ['ui.router', 'ngSanitize', 'ui.boostrap']).run(function() {
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
			templateUrl: 'createlunchdate.html',
			controller: 'CreateLunchDateCtrl'
		});

		$urlRouterProvider.otherwise('/login');
})

.controller("MainCtrl", ['$scope', '$http', function($scope, $http) {
	$scope.tabs;

	var request = {
		method: 'GET',
		url: 'search',
		params: {
			term: 'lunch',
			location: 'Seattle'
		}
	};

	Parse.Cloud.run('yelpApi', request, {
		success: function(response) {
			console.log(response.body);
		}, 
		error: function(error) {
			console.log(error);
		}
	});
}])

.controller("HomeCtrl", ['$scope', '$rootScope', function($scope, $rootScope) {
	$scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) { 
		$rootScope.tabs = ['home', 'profile', 'logout'];
	})
}])

.controller("LoginCtrl", ['$scope', '$rootScope', function($scope, $rootScope) {
	$scope.showInfo = false;

	$scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) { 
		$rootScope.tabs = ['login', 'signup'];
	})
}])


.controller("SignupCtrl", ['$scope', function($scope) {
	$scope.newUser = {};


	$scope.signup = function(photo, fName, lName, passwd, email) {
		if(photo == null) {
			photo = "images/default-profile.png";
		}
		var user = new Parse.User();
		user.set('fName', fName);
		user.set('lName', lName);
		user.set('email', email);
		user.set('photo', photo);
	}	
}])

.controller("CreateLunchDateCtrl", ['$scope', '$http','$uibModal', function ($scope, $http, $uibModal) {
    // need to include ui bootstrap js in js files for modal to work

    $scope.getYelpData = function () {
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
                console.log(response.body);
                $scope.yelpResponses = response.body;
                var modalInstance = $uibModal.open({
                    templateUrl: 'partials/yelp-modal.html',
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
