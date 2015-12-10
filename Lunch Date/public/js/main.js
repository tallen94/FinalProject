"use strict";

var LunchDate = Parse.Object.extend("LunchDate");

var map = L.map('map-container').setView([39.8282, -98.5795], 4);

L.tileLayer('https://api.tiles.mapbox.com/v4/mapbox.streets/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiamFrZXJzbm9ydGgiLCJhIjoiY2lmeDFkbWdzM200b3Vpa3J1c3ZpeGlvZiJ9.IoutzB1Q6QO_BFwIMelV2w', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox.streets',
    accessToken: 'pk.eyJ1IjoiamFrZXJzbm9ydGgiLCJhIjoiY2lmeDFkbWdzM200b3Vpa3J1c3ZpeGlvZiJ9.IoutzB1Q6QO_BFwIMelV2w'
}).addTo(map);

angular.module('LunchDate', ['ui.router', 'ngSanitize']).run(function() {
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

.controller("CreateLunchDateCtrl", ['$scope', '$http', function ($scope, $http) {

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