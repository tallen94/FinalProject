"use strict";

var LunchDate = Parse.Object.extend("LunchDate");

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

.controller("MainCtrl", ['$scope', function($scope) {
	$scope.tabs;
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
		var user = new Parse.User();
		user.set('fName', fName);
		user.set('lName', lName);
		user.set('email', email);
		user.set('photo', photo);
	}	
}])

.controller("CreateLunchDateCtrl", ['$scope', '$http', function($scope, $http) {
    $scope.getDataFromYelp = function () {
        $http.get('https://api.yelp.com/v2/search?term=food&location=')
    }
}])