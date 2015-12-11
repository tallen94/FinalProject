"use strict";

var LunchDate = Parse.Object.extend("LunchDate");
var currentUser;

angular.module('LunchDate', ['ui.router', 'ngSanitize', 'ui.bootstrap', 'uiGmapgoogle-maps'])
.run(function() {
	Parse.initialize("uIVTEdH6vgBbc0QWNwWf7mJG3i70feZ39xzm71v6", "aoAZx3sogatBjPOoBQ7kghv0xbhX07W0st5lEDRK");
	currentUser = Parse.User.current();
})
.config(function($stateProvider, $urlRouterProvider, uiGmapGoogleMapApiProvider) {

	uiGmapGoogleMapApiProvider.configure({
		key: 'AIzaSyCB5idAjuihsRtMsBk1xip8IhD68K09jkU',
		v: '3.20',
		libraries: 'drawing'
	});

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
		})
		.state('profile', {
			url: '/profile',
			templateUrl: 'partials/profile.html',
			controller: 'ProfileCtrl'
		});

		$urlRouterProvider.otherwise('/home');
})

.controller("MainCtrl", ['$scope', '$http', '$state', function($scope, $http, $state) {
	$scope.tabs;

	$scope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) { 
		switch(toState.name) {
			case 'signup':
			case 'login':
				if(currentUser) {
					event.preventDefault();
					$state.go('home');
				}
				break;
			case 'home':
			case 'profile':
			case 'create-date':
				if(currentUser == null) {
					event.preventDefault();
					$state.go('login');
				}
				break;
		}
	})

	$scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) { 
		switch(toState.name) {
			case 'signup':
			case 'login':
				$scope.tabs = ['login', 'signup'];
				break;
			case 'home':
			case 'profile':
			case 'create-date':
				$scope.tabs = ['home', 'profile'];
				break;
		}
	})
	
}])

.controller("HomeCtrl", ['$scope', '$interval', '$q', '$rootScope', 'uiGmapGoogleMapApi', function($scope, $interval, $q, $rootScope, uiGmapGoogleMapApi) {

	$scope.dates = [];
	$scope.markers = [];
	var DatesDfd = $q.defer();
	var MapDfd = $q.defer();
	$scope.map = {center: {latitude: 51.219053, longitude: 4.404418 }, zoom: 10 };
    $scope.options = {scrollwheel: false};
    navigator.geolocation.getCurrentPosition(function(pos) {
    	MapDfd.resolve(pos);
    })

    MapDfd.promise.then(function(pos) {
    	$scope.map.center = {
    		latitude: pos.coords.latitude, 
    		longitude: pos.coords.longitude
    	};
    });
      
	var tick = function() {
		$scope.timeNow = Date.now();
		var query = new Parse.Query(LunchDate);
		query.find().then(function(results) {
			DatesDfd.resolve(results);
		})
	};

	DatesDfd.promise.then(function(dates) {
		var idKey = 1;
		dates.forEach(function(date) {
			var item = {
				resturaunt: JSON.parse(date.get('resturaunt')),
				date: date.get('date'),
				time: date.get('time'),
				desc: date.get('desc'),
				user: date.get('user')
			}
			$scope.dates.push(item);
			var resturauntCoords = {
				coords: {
					longitude: item.resturaunt.location.coordinate.longitude,
					latitude: item.resturaunt.location.coordinate.latitude
				},
				idKey: idKey
			}
			$scope.markers.push(resturauntCoords);
			idKey++;
		})	
	});

	tick();
	$interval(tick, 1000 * 60);
}])

.controller("LoginCtrl", ['$scope', '$state', function($scope, $state) {
	$scope.showInfo = false;

	$scope.login = function(email, passwd) {
		Parse.User.logIn(email, passwd, {
			success: function(user) {
				currentUser = user;
				$state.go('home');
			},
			error: function(user, error) {
				$scope.invalidCred = true;
				console.log("LOGIN ERROR + " + error);
				$scope.invalidCred = true;
			}
		}) 
	}
}])


.controller("SignupCtrl", ['$scope', '$state', function($scope, $state) {
	$scope.newUser = {};

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
				currentUser = user;
				$state.go('home');

			},
			error: function(user, error) {
				console.log("Signup error: " + error)
			}
		});
	}	
}])

.controller("CreateLunchDateCtrl", ['$scope', '$http','$uibModal', '$state', function($scope, $http, $uibModal, $state) {
    // need to include ui bootstrap js in js files for modal to work
    $scope.time = new Date();

    $scope.hstep = 1;
    $scope.mstep = 1;
    $scope.ismeridian = true;

    $scope.date = new Date();
    $scope.open = function ($event) {
        $scope.status.opened = true;
    };
    $scope.status = {
        opened: false
    };
    $scope.currDate = {
    	search: '',
        restaurant: '',
        date: '',
        time: '',
        desc: ''
    }

    $scope.getYelpData = function () {
        if ($scope.currDate.search == undefined) {
            $scope.currDate.search = '';
        }
        var request = {
            method: 'GET',
            url: 'search',
            params: {
                term: $scope.currDate.search,
                location: 'Seattle'
            }
        };
        console.log($scope.currDate.restaurant);

        Parse.Cloud.run('yelpApi', request, {
            success: function (response) {
                console.log(JSON.parse(response.body))

                $scope.yelpResponses = JSON.parse(response.body).businesses;
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

    $scope.createDate = function (restaurant, date, time, desc) {
        console.log("date: " + restaurant + ", " + date + ", " + time + ", " + desc);
        console.log(date.toDateString());
        console.log(time.toTimeString());

        var lunchDate = new LunchDate();
        lunchDate.set('user', Parse.User.current());
        lunchDate.set('resturaunt', JSON.stringify(restaurant));
        lunchDate.set('date', date.toDateString());
        lunchDate.set('time', time.toTimeString());
        lunchDate.set('desc', desc);
        lunchDate.save(null, {
            success: function (res) {
                console.log(res);
                $state.go('login');
            },
            error: function (res, error) {
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
        console.log(restaurant);
        console.log("selected: " + restaurant.name);
        $scope.selectedRestaurant = restaurant;

        $scope.currDate.restaurant = restaurant;
    }

    //$scope.createDate = function(resturaunt, date, time, desc) {
    //	var lunchDate = new LunchDate();
    //	lunchDate.set('resturaunt', resturaunt);
    //	lunchDate.set('date', date);
    //	lunchDate.set('time', time);
    //	lunchDate.set('desc', desc);
    //	lunchDate.save(null, {
    //		success: function(res) {
    //			console.log(res);
    //			$state.go('home');
    //		},
    //		error: function(res, error) {
    //			console.log(error);
    //		}
    //	});

    //}
}])

.controller("ProfileCtrl", ['$scope', '$state', '$q', function($scope, $state, $q) {
	$scope.currentUser = {};
	var DateDfd = $q.defer();
	$scope.dates = [];

	$scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
		$scope.currentUser.fName = currentUser.get('fName');
		$scope.currentUser.lName = currentUser.get('lName');
		$scope.currentUser.photo = currentUser.get('photo');
		var query = new Parse.Query(LunchDate);
		query.equalTo('user', currentUser);
		query.find().then(function(response) {
			DateDfd.resolve(response);
		})
	})

	DateDfd.promise.then(function(data) {
		data.forEach(function(date) {
			var item = {
				resturaunt: date.get('resturaunt'),
				date: date.get('date'),
				time: date.get('time'),
				desc: date.get('desc'),
				user: date.get('user')
			}
			$scope.dates.push(item);
		})
	})

	$scope.logout = function() {
		if(currentUser) {
			Parse.User.logOut();
			currentUser = null;
			$state.go('login');
		}
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
})


