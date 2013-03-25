'use strict';

(function() {
    var configCallback = function($routeProvider, $locationProvider, $httpProvider, $provide, $compileProvider) {
        $routeProvider.when('/login', {templateUrl: 'partials/login.html', controller: LoginController});
        $routeProvider.when('/register', {templateUrl: 'partials/register.html', controller: RegisterController});
        $routeProvider.when('/recovery', {templateUrl: 'partials/recovery.html', controller: RecoveryController});
        $routeProvider.when('/', {templateUrl: 'partials/project-list.html', controller: ProjectListController});

        $routeProvider.when('/project/:pid/backlog',
                {templateUrl: 'partials/backlog.html', controller: BacklogController});

        $routeProvider.when('/project/:pid/issues',
                {templateUrl: 'partials/issues.html', controller: IssuesController});

        $routeProvider.when('/project/:pid/dashboard',
                {templateUrl: 'partials/dashboard.html', controller: DashboardController});

        $routeProvider.when('/project/:pid/wiki/:slug',
                {templateUrl: 'partials/wiki.html', controller: WikiController});

        $routeProvider.otherwise({redirectTo: '/login'});
        $locationProvider.hashPrefix('!');

        $httpProvider.defaults.headers.delete = {"Content-Type": "application/json"};
        $httpProvider.defaults.headers.patch = {"Content-Type": "application/json"};
        $httpProvider.defaults.headers.post = {"Content-Type": "application/json"};
        $httpProvider.defaults.headers.put = {"Content-Type": "application/json"};

        $provide.factory("authHttpIntercept", ["$q", "$location", function($q, $location) {
            return function(promise) {
                return promise.then(null, function(response) {
                    if (response.status === 401) {
                        $location.url("/login");
                    }
                    return $q.reject(response);
                });
            };
        }]);

        $compileProvider.urlSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|blob):/);
        $httpProvider.responseInterceptors.push('authHttpIntercept');
    };

    var modules = [
        "greenmine.filters.common",
        "greenmine.services.common",
        "greenmine.services.resource",
        "greenmine.services.storage",
        "greenmine.directives.generic",
        "greenmine.directives.common",
        "greenmine.directives.backlog",
        "greenmine.directives.dashboard",
        "greenmine.directives.issues",
        "greenmine.directives.wiki"
    ];

    if (this.greenmine === undefined) this.greenmine = {};

    var init = function($rootScope, storage) {
        // Initial hack
        storage.set("userInfo", {"id": "12345", "username": "niwibe", "fullname": "Andrey Antukh"});

        $rootScope.auth = storage.get('userInfo');

        // TODO: obtain this values from api
        $rootScope.constants = {};
        $rootScope.constants.severity = {1:"Low", 2:"Medium", 3:"Hight", 4:"Critical"};
        $rootScope.constants.priority = {1:"Low", 2:"Medium", 3:"Hight"};
        $rootScope.constants.points = ["?", "0", "1", "2", "3", "5", "8", "10", "15", "20", "40"];

        $rootScope.constants.status = {
            1: "New",
            2: "In progress",
            3: "Needs Info",
            4: "Ready for test",
            5: "Closed",
            6: "Rejected",
            7: "Postponed"
        };

        /* Global helpers */

        $rootScope.resolveStatus = function(name) {
            console.log("status", name);
            return $rootScope.constants.status[name] || "";
        };

        $rootScope.resolvePriority = function(name) {
            console.log("priority", name);
            return $rootScope.constants.priority[name] || "";
        };

        $rootScope.resolveSeverity = function(name) {
            return $rootScope.constants.severity[name] || "";
        };
    };

    angular.module('greenmine', modules)
        .config(['$routeProvider', '$locationProvider', '$httpProvider', '$provide', '$compileProvider', configCallback])
        .run(['$rootScope', 'storage', init]);

}).call(this);
