"use strict";

angular.module("LunchDate", ["ui.router", "ngSanitize"])
.config(function($stateProvider, $urlStateProvider) {
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
		})

		$urlStateProvider.otherwise("/");
})

.controller("MainCtrl", ['$scope', '$state', function($scope, $state) {

	$scope.uiRouterState = $state;

	$scope.$on("$stateChangeStart", function(event, toState, toParams, fromState, fromParams) {
		$scope.uiRouterState = $state;
	});
}])

.controller("HomeCtrl", ['$scope', function() {

}])

.controller("LoginCtrl", ['$scope', function() {
	
}])

.controller("SignupCtrl", ['$scope', function() {
	
}])

.controller("CreateLunchDateCtrl", ['$scope', function() {
	
}])