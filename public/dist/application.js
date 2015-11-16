'use strict';
// Init the application configuration module for AngularJS application
var ApplicationConfiguration = function () {
    // Init module configuration options
    var applicationModuleName = 'identifi';
    var applicationModuleVendorDependencies = [
        'ngResource',
        'ngCookies',
        'ngAnimate',
        'ngTouch',
        'ngSanitize',
        'ui.router',
        'ui.bootstrap',
        'ui.bootstrap-slider',
        'ui.utils',
        'angularSpinner',
        'infinite-scroll',
        'persona',
        'angular-parallax',
        'autocomplete'
      ];
    // Add a new vertical module
    var registerModule = function (moduleName, dependencies) {
      // Create angular module
      angular.module(moduleName, dependencies || []);
      // Add the module to the AngularJS configuration file
      angular.module(applicationModuleName).requires.push(moduleName);
    };
    return {
      applicationModuleName: applicationModuleName,
      applicationModuleVendorDependencies: applicationModuleVendorDependencies,
      registerModule: registerModule,
      defaultViewpoint: {
        viewpointName: 'Identi.fi',
        viewpointType: 'keyID',
        viewpointValue: '18bHa3QaHxuHAbg9wWtkx2KBiQPZQdTvUT'
      },
      uniqueIdentifierTypes: [
        'url',
        'account',
        'email',
        'bitcoin',
        'bitcoin_address',
        'keyID',
        'gpg_fingerprint',
        'gpg_keyid',
        'phone',
        'tel',
        'google_oauth2'
      ],
      defaultFilters: {
        maxDistance: 0,
        msgType: 'rating',
        receivedOffset: 0,
        sentOffset: 0,
        offset: 0,
        limit: 20
      }
    };
  }();'use strict';
//Start by defining the main module and adding the module dependencies
angular.module(ApplicationConfiguration.applicationModuleName, ApplicationConfiguration.applicationModuleVendorDependencies);
// Setting HTML5 Location Mode
angular.module(ApplicationConfiguration.applicationModuleName).config([
  '$locationProvider',
  function ($locationProvider) {
    $locationProvider.hashPrefix('!');
    $locationProvider.html5Mode(true);
  }
]);
//Then define the init function for starting up the application
angular.element(document).ready(function () {
  //Fixing facebook bug with redirect
  if (window.location.hash === '#_=_')
    window.location.hash = '#!';
  //Then init the app
  angular.bootstrap(document, [ApplicationConfiguration.applicationModuleName]);
});'use strict';
// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('core');'use strict';
// Use applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('identifiers');'use strict';
// Use applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('messages');'use strict';
// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('users');'use strict';
// Setting up route
angular.module('core').config([
  '$stateProvider',
  '$urlRouterProvider',
  function ($stateProvider, $urlRouterProvider) {
    // Redirect to home view when route not found
    $urlRouterProvider.otherwise('/');
    // Home state routing
    $stateProvider.state('about', {
      url: '/about',
      templateUrl: 'modules/core/views/about.client.view.html'
    });
  }
]);'use strict';
angular.module('core').controller('HeaderController', [
  '$scope',
  '$location',
  '$http',
  'Authentication',
  'Menus',
  'Persona',
  function ($scope, $location, $http, Authentication, Menus, Persona) {
    Persona.watch({
      loggedInUser: Authentication.user.email,
      onlogin: function (assertion) {
        $http.post('/auth/persona', { assertion: assertion }).then(function () {
          location.reload();  // FIXME
        });
      },
      onlogout: function () {
      }
    });
    $scope.query = { term: '' };
    $scope.addIdentifier = function () {
      $location.path('/id/create/' + $scope.query.term);
    };
    $scope.login = function () {
      Persona.request();
    };
    $scope.logout = function () {
      Persona.logout();
    };
    $scope.logoClicked = function () {
      $scope.query.term = '';
      $scope.searchKeydown();
    };
    $scope.authentication = Authentication;
    if (Authentication.user) {
      if (Authentication.user.provider === 'persona')
        Authentication.user.idType = 'email';
      else
        Authentication.user.idType = 'url';
      switch (Authentication.user.provider) {
      case 'persona':
        Authentication.user.idValue = Authentication.user.email;
        break;
      case 'twitter':
        Authentication.user.idValue = 'https://twitter.com/' + Authentication.user.username;
        break;
      default:
        Authentication.user.idValue = Authentication.user.providerData.link;
        break;
      }
    }
    $scope.isCollapsed = false;
    $scope.menu = Menus.getMenu('topbar');
    $scope.toggleCollapsibleMenu = function () {
      $scope.isCollapsed = !$scope.isCollapsed;
    };
    // Collapsing the menu after navigation
    $scope.$on('$stateChangeSuccess', function () {
      $scope.isCollapsed = false;
    });
    $scope.searchChanged = function () {
      $scope.$root.$broadcast('StartSearch', { queryTerm: $scope.query.term });
    };
    $scope.isActive = function (viewLocation) {
      return viewLocation === $location.path();
    };
    $scope.searchKeydown = function (e) {
      $scope.$root.$broadcast('SearchKeydown', { event: e });
    };
  }
]);'use strict';
angular.module('core').controller('HomeController', [
  '$scope',
  'Authentication',
  function ($scope, Authentication) {
    // This provides Authentication context.
    $scope.authentication = Authentication;
  }
]);'use strict';
angular.module('identifi').filter('escape', [function () {
    return function (input) {
      return encodeURIComponent(encodeURIComponent(input));
    };
  }]);
angular.module('identifi').filter('encodeURIComponent', [function () {
    return function (input) {
      return encodeURIComponent(input);
    };
  }]);'use strict';
//Menu service used for managing  menus
angular.module('core').service('Menus', [function () {
    // Define a set of default roles
    this.defaultRoles = ['*'];
    // Define the menus object
    this.menus = {};
    // A private function for rendering decision 
    var shouldRender = function (user) {
      if (user) {
        if (!!~this.roles.indexOf('*')) {
          return true;
        } else {
          for (var userRoleIndex in user.roles) {
            for (var roleIndex in this.roles) {
              if (this.roles[roleIndex] === user.roles[userRoleIndex]) {
                return true;
              }
            }
          }
        }
      } else {
        return this.isPublic;
      }
      return false;
    };
    // Validate menu existance
    this.validateMenuExistance = function (menuId) {
      if (menuId && menuId.length) {
        if (this.menus[menuId]) {
          return true;
        } else {
          throw new Error('Menu does not exists');
        }
      } else {
        throw new Error('MenuId was not provided');
      }
      return false;
    };
    // Get the menu object by menu id
    this.getMenu = function (menuId) {
      // Validate that the menu exists
      this.validateMenuExistance(menuId);
      // Return the menu object
      return this.menus[menuId];
    };
    // Add new menu object by menu id
    this.addMenu = function (menuId, isPublic, roles) {
      // Create the new menu
      this.menus[menuId] = {
        isPublic: isPublic || false,
        roles: roles || this.defaultRoles,
        items: [],
        shouldRender: shouldRender
      };
      // Return the menu object
      return this.menus[menuId];
    };
    // Remove existing menu object by menu id
    this.removeMenu = function (menuId) {
      // Validate that the menu exists
      this.validateMenuExistance(menuId);
      // Return the menu object
      delete this.menus[menuId];
    };
    // Add menu item object
    this.addMenuItem = function (menuId, menuItemTitle, menuItemURL, menuItemType, menuItemUIRoute, isPublic, roles, position) {
      // Validate that the menu exists
      this.validateMenuExistance(menuId);
      // Push new menu item
      this.menus[menuId].items.push({
        title: menuItemTitle,
        link: menuItemURL,
        menuItemType: menuItemType || 'item',
        menuItemClass: menuItemType,
        uiRoute: menuItemUIRoute || '/' + menuItemURL,
        isPublic: isPublic === null || typeof isPublic === 'undefined' ? this.menus[menuId].isPublic : isPublic,
        roles: roles === null || typeof roles === 'undefined' ? this.menus[menuId].roles : roles,
        position: position || 0,
        items: [],
        shouldRender: shouldRender
      });
      // Return the menu object
      return this.menus[menuId];
    };
    // Add submenu item object
    this.addSubMenuItem = function (menuId, rootMenuItemURL, menuItemTitle, menuItemURL, menuItemUIRoute, isPublic, roles, position) {
      // Validate that the menu exists
      this.validateMenuExistance(menuId);
      // Search for menu item
      for (var itemIndex in this.menus[menuId].items) {
        if (this.menus[menuId].items[itemIndex].link === rootMenuItemURL) {
          // Push new submenu item
          this.menus[menuId].items[itemIndex].items.push({
            title: menuItemTitle,
            link: menuItemURL,
            uiRoute: menuItemUIRoute || '/' + menuItemURL,
            isPublic: isPublic === null || typeof isPublic === 'undefined' ? this.menus[menuId].items[itemIndex].isPublic : isPublic,
            roles: roles === null || typeof roles === 'undefined' ? this.menus[menuId].items[itemIndex].roles : roles,
            position: position || 0,
            shouldRender: shouldRender
          });
        }
      }
      // Return the menu object
      return this.menus[menuId];
    };
    // Remove existing menu object by menu id
    this.removeMenuItem = function (menuId, menuItemURL) {
      // Validate that the menu exists
      this.validateMenuExistance(menuId);
      // Search for menu item to remove
      for (var itemIndex in this.menus[menuId].items) {
        if (this.menus[menuId].items[itemIndex].link === menuItemURL) {
          this.menus[menuId].items.splice(itemIndex, 1);
        }
      }
      // Return the menu object
      return this.menus[menuId];
    };
    // Remove existing menu object by menu id
    this.removeSubMenuItem = function (menuId, submenuItemURL) {
      // Validate that the menu exists
      this.validateMenuExistance(menuId);
      // Search for menu item to remove
      for (var itemIndex in this.menus[menuId].items) {
        for (var subitemIndex in this.menus[menuId].items[itemIndex].items) {
          if (this.menus[menuId].items[itemIndex].items[subitemIndex].link === submenuItemURL) {
            this.menus[menuId].items[itemIndex].items.splice(subitemIndex, 1);
          }
        }
      }
      // Return the menu object
      return this.menus[menuId];
    };
    //Adding the topbar menu
    this.addMenu('topbar');
  }]);'use strict';
//Setting up route
angular.module('identifiers').config([
  '$stateProvider',
  function ($stateProvider) {
    // Identifiers state routing
    $stateProvider.state('search', {
      url: '/',
      templateUrl: 'modules/identifiers/views/list-identifiers.client.view.html'
    }).state('createIdentifier', {
      url: '/id/create/:value',
      templateUrl: 'modules/identifiers/views/create-identifier.client.view.html'
    }).state('viewIdentifier', {
      url: '/id/:idType/:idValue',
      templateUrl: 'modules/identifiers/views/view-identifier.client.view.html'
    }).state('editIdentifier', {
      url: '/id/:idType/:idValue/edit',
      templateUrl: 'modules/identifiers/views/edit-identifier.client.view.html'
    });
  }
]);'use strict';
// Identifiers controller
angular.module('identifiers').controller('IdentifiersController', [
  '$scope',
  '$rootScope',
  '$window',
  '$stateParams',
  '$location',
  '$http',
  'Authentication',
  'Identifiers',
  function ($scope, $rootScope, $window, $stateParams, $location, $http, Authentication, Identifiers) {
    $scope.authentication = Authentication;
    $scope.tabs = [
      { active: true },
      { active: false },
      { active: false }
    ];
    $scope.info = {};
    $scope.sent = [];
    $scope.received = [];
    $scope.trustpaths = [];
    $rootScope.filters = $rootScope.filters || ApplicationConfiguration.defaultFilters;
    angular.extend($rootScope.filters, {
      receivedOffset: 0,
      sentOffset: 0
    });
    if ($scope.authentication.user) {
      $rootScope.viewpoint = {
        viewpointName: $scope.authentication.user.displayName,
        viewpointType: 'email',
        viewpointValue: $scope.authentication.user.email
      };
    } else {
      $rootScope.viewpoint = $rootScope.viewpoint || ApplicationConfiguration.defaultViewpoint;
    }
    $scope.newIdentifier = {
      type: '',
      value: $stateParams.value
    };
    $scope.queryTerm = '';
    $scope.goToID = function (type, value) {
      $location.path('/id/' + encodeURIComponent(type) + '/' + encodeURIComponent(value));
    };
    $scope.dropdownSearchSelect = function (suggestion) {
      $scope.goToID(suggestion.linkTo[0], suggestion.linkTo[1]);
      $scope.queryTerm = '';
    };
    $scope.collapseLevel = {};
    $scope.collapseFilters = $window.innerWidth < 992;
    var processMessages = function (messages) {
      for (var key in messages) {
        if (isNaN(key))
          continue;
        var msg = messages[key];
        var gravatarEmail = msg.authorEmail;
        if (msg.authorEmail === '')
          gravatarEmail = msg.data.signedData.author[0][0] + msg.data.signedData.author[0][1];
        msg.gravatar = CryptoJS.MD5(gravatarEmail).toString();
        msg.linkToAuthor = msg.data.signedData.author[0];
        var i;
        for (i = 0; i < msg.data.signedData.author.length; i++) {
          if (ApplicationConfiguration.uniqueIdentifierTypes.indexOf(msg.data.signedData.author[i][0]) > -1) {
            msg.linkToAuthor = msg.data.signedData.author[i];
            break;
          }
        }
        msg.linkToRecipient = msg.data.signedData.recipient[0];
        for (i = 0; i < msg.data.signedData.recipient.length; i++) {
          if (ApplicationConfiguration.uniqueIdentifierTypes.indexOf(msg.data.signedData.recipient[i][0]) > -1) {
            msg.linkToRecipient = msg.data.signedData.recipient[i];
            break;
          }
        }
        var signedData = msg.data.signedData;
        var alpha;
        msg.panelStyle = 'panel-default';
        msg.iconStyle = '';
        msg.hasSuccess = '';
        msg.bgColor = '';
        msg.iconCount = new Array(1);
        switch (signedData.type) {
        case 'confirm_connection':
          msg.iconStyle = 'glyphicon glyphicon-ok';
          msg.hasSuccess = 'has-success';
          break;
        case 'connection':
          msg.iconStyle = 'glyphicon glyphicon-ok';
          msg.hasSuccess = 'has-success';
          break;
        case 'refute_connection':
          msg.iconStyle = 'glyphicon glyphicon-remove';
          msg.hasSuccess = 'has-error';
          break;
        case 'rating':
          var rating = signedData.rating;
          var neutralRating = (signedData.minRating + signedData.maxRating) / 2;
          var maxRatingDiff = signedData.maxRating - neutralRating;
          var minRatingDiff = signedData.minRating - neutralRating;
          if (rating > neutralRating) {
            msg.panelStyle = 'panel-success';
            msg.iconStyle = 'glyphicon glyphicon-thumbs-up';
            msg.iconCount = maxRatingDiff < 2 ? msg.iconCount : new Array(Math.ceil(3 * rating / maxRatingDiff));
            alpha = (rating - neutralRating - 0.5) / maxRatingDiff / 1.25 + 0.2;
            msg.bgColor = 'background-image:linear-gradient(rgba(223,240,216,' + alpha + ') 0%, rgba(208,233,198,' + alpha + ') 100%);background-color: rgba(223,240,216,' + alpha + ');';
          } else if (rating < neutralRating) {
            msg.panelStyle = 'panel-danger';
            msg.iconStyle = 'glyphicon glyphicon-thumbs-down';
            msg.iconCount = minRatingDiff > -2 ? msg.iconCount : new Array(Math.ceil(3 * rating / minRatingDiff));
            alpha = (rating - neutralRating + 0.5) / minRatingDiff / 1.25 + 0.2;
            msg.bgColor = 'background-image:linear-gradient(rgba(242,222,222,' + alpha + ') 0%, rgba(235,204,204,' + alpha + ') 100%);background-color: rgba(242,222,222,' + alpha + ');';
          } else {
            msg.panelStyle = 'panel-warning';
            msg.iconStyle = 'glyphicon glyphicon-question-sign';
          }
          break;
        }
      }
    };
    var scrollTo = function (el) {
      if (!el)
        return;
      var pos = el.getBoundingClientRect();
      if (pos.top) {
        if (pos.top - 60 < window.pageYOffset)
          window.scrollTo(0, pos.top - 60);
        else if (pos.bottom > window.pageYOffset + (window.innerHeight || document.documentElement.clientHeight))
          window.scrollTo(0, pos.bottom - (window.innerHeight || document.documentElement.clientHeight) + 15);
      }
    };
    $scope.dropdownSearch = function (query) {
      $scope.search(query, 3);
    };
    $scope.search = function (query, limit) {
      $rootScope.pageTitle = '';
      Identifiers.query(angular.extend({ idValue: query || $scope.queryTerm || '' }, { limit: limit ? limit : 20 }, $rootScope.filters.maxDistance > -1 ? $rootScope.viewpoint : {}), function (res) {
        $scope.identifiers = res;
        if ($scope.identifiers.length > 0) {
          $scope.identifiers.activeKey = 0;
          $scope.identifiers[0].active = true;
        }
        for (var i = 0; i < $scope.identifiers.length; i++) {
          var id = $scope.identifiers[i];
          for (var j in id) {
            if (!id.linkTo && ApplicationConfiguration.uniqueIdentifierTypes.indexOf(id[j][0]) > -1)
              id.linkTo = id[j];
            switch (id[j][0]) {
            case 'email':
              id.email = id[j][1];
              id.gravatar = CryptoJS.MD5(id[j][1]).toString();
              break;
            case 'name':
              id.name = id[j][1];
              break;
            case 'nickname':
              id.nickname = id[j][1];
              break;
            case 'bitcoin', 'bitcoin_address':
              id.bitcoin = id[j][1];
              break;
            case 'url':
              if (id[j][1].indexOf('twitter.com/') > -1)
                id.twitter = id[j][1].split('twitter.com/')[1];
              if (id[j][1].indexOf('facebook.com/') > -1)
                id.facebook = id[j][1].split('facebook.com/')[1];
              if (id[j][1].indexOf('plus.google.com/') > -1)
                id.googlePlus = id[j][1].split('plus.google.com/')[1];
              break;
            }
          }
          if (!id.linkTo)
            id.linkTo = id[0];
          if (!id.gravatar)
            id.gravatar = CryptoJS.MD5(id[0][1]).toString();
          if (!id.name) {
            if (id.nickname)
              id.name = id.nickname;
            else
              id.name = id[0][1];
          }
        }
      });
    };
    $scope.resultClicked = function (result) {
      if (result && result.linkTo)
        $location.path('/id/' + encodeURIComponent(result.linkTo[0]) + '/' + encodeURIComponent(result.linkTo[1]));
    };
    var messagesAdded = false;
    $scope.$on('MessageAdded', function (event, args) {
      if (args.message.data.signedData.type === 'confirm_connection') {
        args.id.confirmations += 1;
        if ($scope.connections.indexOf(args.id) === -1)
          $scope.connections.push(args.id);
      } else if (args.message.data.signedData.type === 'refute_connection') {
        args.id.refutations += 1;
        if ($scope.connections.indexOf(args.id) === -1)
          $scope.connections.push(args.id);
      } else if (args.message.data.signedData.type === 'rating') {
        if (messagesAdded)
          $scope.received.shift();
        $scope.received.unshift(args.message);
        messagesAdded = true;
        processMessages($scope.received);
      }
    });
    $scope.$on('SearchKeydown', function (event, args) {
      switch (args.event ? args.event.which : -1) {
      case 38:
        args.event.preventDefault();
        if ($scope.identifiers.activeKey > 0) {
          $scope.identifiers[$scope.identifiers.activeKey].active = false;
          $scope.identifiers[$scope.identifiers.activeKey - 1].active = true;
          $scope.identifiers.activeKey--;
        }
        scrollTo(document.getElementById('result' + $scope.identifiers.activeKey));
        break;
      case 40:
        args.event.preventDefault();
        if ($scope.identifiers.activeKey < $scope.identifiers.length - 1) {
          $scope.identifiers[$scope.identifiers.activeKey].active = false;
          $scope.identifiers[$scope.identifiers.activeKey + 1].active = true;
          $scope.identifiers.activeKey++;
        }
        scrollTo(document.getElementById('result' + $scope.identifiers.activeKey));
        break;
      case 13:
        args.event.preventDefault();
        var id = $scope.identifiers[$scope.identifiers.activeKey];
        $scope.resultClicked(id);
        break;
      case -1:
        clearTimeout($scope.timer);
        $scope.queryTerm = '';
        $scope.search();
        break;
      case 33:
      case 34:
      case 35:
      case 36:
      case 37:
      case 39:
        break;
      default:
        var el = angular.element(args.event.currentTarget);
        clearTimeout($scope.timer);
        var wait = setTimeout(function () {
            $scope.queryTerm = el.val();
            $scope.search();
          }, 300);
        $scope.timer = wait;
        break;
      }
    });
    $scope.getConnections = function () {
      $scope.connections = Identifiers.connections(angular.extend($rootScope.filters, {
        idType: $scope.idType,
        idValue: $scope.idValue
      }, $rootScope.filters.maxDistance > -1 ? $rootScope.viewpoint : {}), function () {
        var mostConfirmations = $scope.connections.length > 0 ? $scope.connections[0].confirmations : 1;
        $scope.connections.unshift({
          type: $scope.idType,
          value: $scope.idValue,
          confirmations: 1,
          refutations: 0,
          isCurrent: true
        });
        for (var key in $scope.connections) {
          var conn = $scope.connections[key];
          switch (conn.type) {
          case 'email':
            conn.iconStyle = 'glyphicon glyphicon-envelope';
            conn.btnStyle = 'btn-success';
            conn.link = 'mailto:' + conn.value;
            conn.quickContact = true;
            $scope.info.email = $scope.info.email || conn.value;
            break;
          case 'bitcoin_address':
          case 'bitcoin':
            conn.iconStyle = 'fa fa-bitcoin';
            conn.btnStyle = 'btn-primary';
            conn.link = 'https://blockchain.info/address/' + conn.value;
            conn.quickContact = true;
            break;
          case 'gpg_fingerprint':
          case 'gpg_keyid':
            conn.iconStyle = 'fa fa-key';
            conn.btnStyle = 'btn-default';
            conn.link = 'https://pgp.mit.edu/pks/lookup?op=get&search=0x' + conn.value;
            break;
          case 'account':
            conn.iconStyle = 'fa fa-at';
            break;
          case 'nickname':
            $scope.info.nickname = $scope.info.nickname || conn.value;
            conn.iconStyle = 'glyphicon glyphicon-font';
            break;
          case 'name':
            $scope.info.name = $scope.info.name || conn.value;
            conn.iconStyle = 'glyphicon glyphicon-font';
            break;
          case 'tel', 'phone':
            conn.iconStyle = 'glyphicon glyphicon-earphone';
            conn.btnStyle = 'btn-success';
            conn.link = 'tel:' + conn.value;
            conn.quickContact = true;
            break;
          case 'url':
            conn.link = conn.value;
            if (conn.value.indexOf('facebook.com/') > -1) {
              conn.iconStyle = 'fa fa-facebook';
              conn.btnStyle = 'btn-facebook';
              conn.quickContact = true;
            } else if (conn.value.indexOf('twitter.com/') > -1) {
              conn.iconStyle = 'fa fa-twitter';
              conn.btnStyle = 'btn-twitter';
              conn.quickContact = true;
              $scope.getPhotosFromTwitter(conn.value);
            } else if (conn.value.indexOf('plus.google.com/') > -1) {
              conn.iconStyle = 'fa fa-google-plus';
              conn.btnStyle = 'btn-google-plus';
              conn.quickContact = true;
            } else if (conn.value.indexOf('linkedin.com/') > -1) {
              conn.iconStyle = 'fa fa-linkedin';
              conn.btnStyle = 'btn-linkedin';
            } else if (conn.value.indexOf('github.com/') > -1) {
              conn.iconStyle = 'fa fa-github';
              conn.btnStyle = 'btn-github';
            } else {
              conn.iconStyle = 'glyphicon glyphicon-link';
              conn.btnStyle = 'btn-default';
            }
            break;
          }
          if (conn.confirmations + conn.refutations > 0) {
            var percentage = conn.confirmations * 100 / (conn.confirmations + conn.refutations);
            if (percentage >= 80) {
              var alpha = conn.confirmations / mostConfirmations * 0.7 + 0.3;
              conn.rowStyle = 'background-color: rgba(223,240,216,' + alpha + ')';
            } else if (percentage >= 60)
              conn.rowClass = 'warning';
            else
              conn.rowClass = 'danger';
          }
          $scope.hasQuickContacts = $scope.hasQuickContacts || conn.quickContact;
        }
        $scope.getPhotosFromGravatar();
        $scope.connectionClicked = function (event, id) {
          id.collapse = !id.collapse;
          id.connectingmsgs = id.connectingmsgs || Identifiers.connectingmsgs(angular.extend({
            idType: $scope.idType,
            idValue: $scope.idValue,
            id2Type: id.type,
            id2Value: id.value
          }, $rootScope.filters), function () {
            for (var key in id.connectingmsgs) {
              if (isNaN(key))
                continue;
              var msg = id.connectingmsgs[key];
              msg.gravatar = CryptoJS.MD5(msg.authorEmail || msg.data.signedData.author[0][1]).toString();
              msg.linkToAuthor = msg.data.signedData.author[0];
              var i;
              for (i = 0; i < msg.data.signedData.author.length; i++) {
                if (ApplicationConfiguration.uniqueIdentifierTypes.indexOf(msg.data.signedData.author[i][0] > -1)) {
                  msg.linkToAuthor = msg.data.signedData.author[i];
                  break;
                }
              }
            }
          });
        };
        $scope.getOverview();
        $scope.getReceivedMsgs(0);
        $scope.getSentMsgs(0);
      });
    };
    $scope.getOverview = function () {
      $scope.overview = Identifiers.get(angular.extend({}, $rootScope.filters, {
        idType: $scope.idType,
        idValue: $scope.idValue,
        method: 'overview'
      }, $rootScope.filters.maxDistance > -1 ? ApplicationConfiguration.defaultViewpoint : 0), function () {
        $scope.info.email = $scope.info.email || $scope.overview.email;
      });
    };
    $scope.getSentMsgs = function (offset) {
      if (!isNaN(offset))
        $rootScope.filters.sentOffset = offset;
      var sent = Identifiers.sent(angular.extend($rootScope.filters, {
          idType: $scope.idType,
          idValue: $scope.idValue,
          msgType: $rootScope.filters.msgType,
          offset: $rootScope.filters.sentOffset,
          limit: $rootScope.filters.limit
        }, $rootScope.filters.maxDistance > -1 ? ApplicationConfiguration.defaultViewpoint : 0), function () {
          processMessages(sent);
          if ($rootScope.filters.sentOffset === 0)
            $scope.sent = sent;
          else {
            for (var key in sent) {
              if (isNaN(key))
                continue;
              $scope.sent.push(sent[key]);
            }
          }
          $scope.sent.$resolved = sent.$resolved;
          $rootScope.filters.sentOffset = $rootScope.filters.sentOffset + sent.length;
          if (sent.length < $rootScope.filters.limit)
            $scope.sent.finished = true;
        });
      if (offset === 0) {
        $scope.sent = {};
      }
      $scope.sent.$resolved = sent.$resolved;
    };
    $scope.getReceivedMsgs = function (offset) {
      if (!isNaN(offset))
        $rootScope.filters.receivedOffset = offset;
      var received = Identifiers.received(angular.extend($rootScope.filters, {
          idType: $scope.idType,
          idValue: $scope.idValue,
          msgType: $rootScope.filters.msgType,
          offset: $rootScope.filters.receivedOffset,
          limit: $rootScope.filters.limit
        }, $rootScope.filters.maxDistance > -1 ? ApplicationConfiguration.defaultViewpoint : 0), function () {
          processMessages(received);
          if ($rootScope.filters.receivedOffset === 0)
            $scope.received = received;
          else {
            for (var key in received) {
              if (isNaN(key))
                continue;
              $scope.received.push(received[key]);
            }
          }
          $scope.received.$resolved = received.$resolved;
          $rootScope.filters.receivedOffset = $rootScope.filters.receivedOffset + received.length;
          if (received.length < $rootScope.filters.limit)
            $scope.received.finished = true;
        });
      if (offset === 0) {
        $scope.received = {};
      }
      $scope.received.$resolved = received.$resolved;
    };
    $scope.getPhotosFromTwitter = function (profileUrl) {
      if (!$scope.isUniqueType)
        return;
      /*
      if (Authentication.user.providerData.profile_banner_url) {
        return { 'background-image': 'url(' + Authentication.user.providerData.profile_banner_url + ')' };
      } */
      return null;
    };
    $scope.getPhotosFromGravatar = function () {
      var email = $scope.info.email || $scope.idValue;
      $scope.gravatar = CryptoJS.MD5(email).toString();
      if (!$scope.isUniqueType)
        return;
      $scope.profilePhotoUrl = $scope.profilePhotoUrl || 'http://www.gravatar.com/avatar/' + $scope.gravatar + '?d=retro&s=210';
    };
    // Find existing Identifier
    $scope.findOne = function () {
      $scope.idType = decodeURIComponent($stateParams.idType);
      $scope.idValue = decodeURIComponent($stateParams.idValue);
      $scope.isUniqueType = ApplicationConfiguration.uniqueIdentifierTypes.indexOf($scope.idType) > -1;
      if (!$scope.isUniqueType)
        $scope.tabs[2].active = true;
      $rootScope.pageTitle = ' - ' + $scope.idValue;
      $scope.getConnections();
      var allPaths = Identifiers.trustpaths(angular.extend({
          idType: $scope.idType,
          idValue: $scope.idValue
        }, $rootScope.viewpoint), function () {
          if (allPaths.length === 0)
            return;
          var shortestPath = Object.keys(allPaths[0]).length;
          angular.forEach(allPaths[0], function (value, i) {
            var set = {};
            var row = [];
            for (var j = 0; j < allPaths.length; j++) {
              if (Object.keys(allPaths[j]).length > shortestPath)
                break;
              var id = allPaths[j][i];
              id.gravatar = CryptoJS.MD5(id[1]).toString();
              set[id[0] + id[1]] = id;
            }
            for (var key in set) {
              row.push(set[key]);
            }
            $scope.trustpaths.push(row);
          });
          // Names for trustpath nodes
          $scope.trustpaths[0][0].name = { name: $rootScope.viewpoint.viewpointName };
          $scope.trustpaths[$scope.trustpaths.length - 1][0].name = { name: $scope.info.name };
          var setIdName = function (res) {
            id.name = res.name;
          };
          for (var i = 1; i < $scope.trustpaths.length - 1; i++) {
            var n = 0;
            for (var key in $scope.trustpaths[i]) {
              var id = $scope.trustpaths[i][key];
              id.name = Identifiers.getname({
                idType: id[0],
                idValue: id[1]
              });
              if (++n === 3)
                break;
            }
          }
        });
    };
    $scope.setFilters = function (filters) {
      angular.extend($rootScope.filters, filters);
      angular.extend($rootScope.filters, {
        offset: 0,
        receivedOffset: 0,
        sentOffset: 0
      });
      $scope.getConnections();
    };
  }
]);'use strict';
//Identifiers service used to communicate Identifiers REST endpoints
angular.module('identifiers').factory('Identifiers', [
  '$resource',
  function ($resource) {
    return $resource('api/id/:idType/:idValue/:method', {}, {
      connections: {
        action: 'GET',
        params: { method: 'connections' },
        isArray: true
      },
      sent: {
        action: 'GET',
        params: { method: 'sent' },
        isArray: true
      },
      received: {
        action: 'GET',
        params: { method: 'received' },
        isArray: true
      },
      trustpaths: {
        action: 'GET',
        params: { method: 'trustpaths' },
        isArray: true
      },
      getname: {
        action: 'GET',
        params: { method: 'getname' }
      },
      connectingmsgs: {
        action: 'GET',
        params: { method: 'connectingmsgs' },
        isArray: true
      }
    });
  }
]);'use strict';
// Configuring the Articles module
angular.module('messages').run([
  'Menus',
  function (Menus) {
    // Set top bar menu items
    Menus.addMenuItem('topbar', 'Messages', 'messages', 'dropdown', '/messages(/create)?');
    Menus.addSubMenuItem('topbar', 'messages', 'List Messages', 'messages');
    Menus.addSubMenuItem('topbar', 'messages', 'New Message', 'messages/create');
  }
]);'use strict';
//Setting up route
angular.module('messages').config([
  '$stateProvider',
  function ($stateProvider) {
    // Messages state routing
    $stateProvider.state('listMessages', {
      url: '/messages',
      templateUrl: 'modules/messages/views/list-messages.client.view.html'
    }).state('createMessage', {
      url: '/messages/create',
      templateUrl: 'modules/messages/views/create-message.client.view.html'
    }).state('viewMessage', {
      url: '/messages/:messageId',
      templateUrl: 'modules/messages/views/view-message.client.view.html'
    }).state('editMessage', {
      url: '/messages/:messageId/edit',
      templateUrl: 'modules/messages/views/edit-message.client.view.html'
    });
  }
]);'use strict';
// Messages controller
angular.module('messages').controller('MessagesController', [
  '$scope',
  '$rootScope',
  '$window',
  '$stateParams',
  '$location',
  'Authentication',
  'Messages',
  function ($scope, $rootScope, $window, $stateParams, $location, Authentication, Messages) {
    $scope.authentication = Authentication;
    $scope.idType = decodeURIComponent($stateParams.idType);
    $scope.idValue = decodeURIComponent($stateParams.idValue);
    $scope.messages = [];
    $scope.newMessage = {
      type: 'rating',
      rating: 1,
      comment: ''
    };
    $scope.newConnection = {
      type: '',
      value: ''
    };
    $scope.iconCount = function (rating) {
      return new Array(Math.max(1, Math.abs(rating)));
    };
    $scope.iconStyle = function (rating) {
      var iconStyle = 'neutral';
      if (rating > 0)
        iconStyle = 'positive';
      else if (rating < 0)
        iconStyle = 'negative';
      return iconStyle;
    };
    $scope.iconClass = function (rating) {
      var iconStyle = 'glyphicon-question-sign';
      if (rating > 0)
        iconStyle = 'glyphicon-thumbs-up';
      else if (rating < 0)
        iconStyle = 'glyphicon-thumbs-down';
      return iconStyle;
    };
    $rootScope.filters = $rootScope.filters || ApplicationConfiguration.defaultFilters;
    angular.extend($rootScope.filters, { offset: 0 });
    if ($scope.authentication.user) {
      $rootScope.viewpoint = {
        viewpointName: $scope.authentication.user.displayName,
        viewpointType: 'email',
        viewpointValue: $scope.authentication.user.email
      };
    } else {
      $rootScope.viewpoint = $rootScope.viewpoint || ApplicationConfiguration.defaultViewpoint;
    }
    $scope.collapseFilters = $window.innerWidth < 992;
    var processMessages = function (messages) {
      for (var key in messages) {
        if (isNaN(key))
          continue;
        var msg = messages[key];
        var gravatarEmail = msg.authorEmail;
        if (msg.authorEmail === '')
          gravatarEmail = msg.data.signedData.author[0][0] + msg.data.signedData.author[0][1];
        msg.gravatar = CryptoJS.MD5(gravatarEmail).toString();
        msg.linkToAuthor = msg.data.signedData.author[0];
        var i;
        for (i = 0; i < msg.data.signedData.author.length; i++) {
          if (ApplicationConfiguration.uniqueIdentifierTypes.indexOf(msg.data.signedData.author[i][0]) > -1) {
            msg.linkToAuthor = msg.data.signedData.author[i];
            break;
          }
        }
        msg.linkToRecipient = msg.data.signedData.recipient[0];
        for (i = 0; i < msg.data.signedData.recipient.length; i++) {
          if (ApplicationConfiguration.uniqueIdentifierTypes.indexOf(msg.data.signedData.recipient[i][0]) > -1) {
            msg.linkToRecipient = msg.data.signedData.recipient[i];
            break;
          }
        }
        var signedData = msg.data.signedData;
        var alpha;
        msg.panelStyle = 'panel-default';
        msg.iconStyle = '';
        msg.hasSuccess = '';
        msg.bgColor = '';
        msg.iconCount = new Array(1);
        switch (signedData.type) {
        case 'confirm_connection':
          msg.iconStyle = 'glyphicon glyphicon-ok';
          msg.hasSuccess = 'has-success';
          break;
        case 'connection':
          msg.iconStyle = 'glyphicon glyphicon-ok';
          msg.hasSuccess = 'has-success';
          break;
        case 'refute_connection':
          msg.iconStyle = 'glyphicon glyphicon-remove';
          msg.hasSuccess = 'has-error';
          break;
        case 'rating':
          var rating = signedData.rating;
          var neutralRating = (signedData.minRating + signedData.maxRating) / 2;
          var maxRatingDiff = signedData.maxRating - neutralRating;
          var minRatingDiff = signedData.minRating - neutralRating;
          if (rating > neutralRating) {
            msg.panelStyle = 'panel-success';
            msg.iconStyle = 'glyphicon glyphicon-thumbs-up';
            msg.iconCount = maxRatingDiff < 2 ? msg.iconCount : new Array(Math.ceil(3 * rating / maxRatingDiff));
            alpha = (rating - neutralRating - 0.5) / maxRatingDiff / 1.25 + 0.2;
            msg.bgColor = 'background-image:linear-gradient(rgba(223,240,216,' + alpha + ') 0%, rgba(208,233,198,' + alpha + ') 100%);background-color: rgba(223,240,216,' + alpha + ');';
          } else if (rating < neutralRating) {
            msg.panelStyle = 'panel-danger';
            msg.iconStyle = 'glyphicon glyphicon-thumbs-down';
            msg.iconCount = minRatingDiff > -2 ? msg.iconCount : new Array(Math.ceil(3 * rating / minRatingDiff));
            alpha = (rating - neutralRating + 0.5) / minRatingDiff / 1.25 + 0.2;
            msg.bgColor = 'background-image:linear-gradient(rgba(242,222,222,' + alpha + ') 0%, rgba(235,204,204,' + alpha + ') 100%);background-color: rgba(242,222,222,' + alpha + ');';
          } else {
            msg.panelStyle = 'panel-warning';
            msg.iconStyle = 'glyphicon glyphicon-question-sign';
          }
          break;
        }
      }
    };
    // Create new Message
    $scope.create = function (event, params, id) {
      event.stopPropagation();
      // Create new Message object
      var message = new Messages({
          recipientType: $scope.idType,
          recipientValue: $scope.idValue
        });
      angular.extend(message, params);
      message.$save(function (response) {
        // Clear form fields
        $scope.newMessage.comment = '';
        $scope.newMessage.rating = 1;
        $scope.newConnection.type = '';
        $scope.newConnection.value = '';
        $scope.$root.$broadcast('MessageAdded', {
          message: message,
          id: id
        });
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };
    $scope.find = function (offset) {
      $rootScope.pageTitle = ' - Latest messages';
      if (!isNaN(offset))
        $rootScope.filters.offset = offset;
      var params = angular.extend({
          idType: $scope.idType,
          idValue: $scope.idValue
        }, $rootScope.filters, $rootScope.filters.maxDistance > -1 ? ApplicationConfiguration.defaultViewpoint : {});
      var messages = Messages.query(params, function () {
          processMessages(messages);
          if ($rootScope.filters.offset === 0)
            $scope.messages = messages;
          else {
            for (var key in messages) {
              if (isNaN(key))
                continue;
              $scope.messages.push(messages[key]);
            }
          }
          $scope.messages.$resolved = messages.$resolved;
          $rootScope.filters.offset = $rootScope.filters.offset + (messages.length || 0);
          if (messages.length < $rootScope.filters.limit)
            $scope.messages.finished = true;
        });
      if (offset === 0) {
        $scope.messages = {};
      }
      $scope.messages.$resolved = messages.$resolved;
    };
    // Find existing Message
    $scope.findOne = function () {
      $scope.message = Messages.get({ messageId: $stateParams.messageId }, function () {
        $rootScope.pageTitle = ' - Message ' + $stateParams.messageId;
        $scope.message.strData = JSON.stringify($scope.message.data, undefined, 2);
        $scope.message.authorGravatar = CryptoJS.MD5($scope.message.authorEmail || $scope.message.data.signedData.author[0][1]).toString();
        $scope.message.recipientGravatar = CryptoJS.MD5($scope.message.recipientEmail || $scope.message.data.signedData.recipient[0][1]).toString();
      });
    };
    $scope.setFilters = function (filters) {
      angular.extend($rootScope.filters, filters);
      angular.extend($rootScope.filters, {
        offset: 0,
        receivedOffset: 0,
        sentOffset: 0
      });
      $scope.find(0);
    };
  }
]);'use strict';
//Messages service used to communicate Messages REST endpoints
angular.module('messages').factory('Messages', [
  '$resource',
  function ($resource) {
    return $resource('api/messages/:messageId', { messageId: '@_id' }, { update: { method: 'PUT' } });
  }
]);'use strict';
// Config HTTP Error Handling
angular.module('users').config([
  '$httpProvider',
  function ($httpProvider) {
    // Set the httpProvider "not authorized" interceptor
    $httpProvider.interceptors.push([
      '$q',
      '$location',
      'Authentication',
      function ($q, $location, Authentication) {
        return {
          responseError: function (rejection) {
            switch (rejection.status) {
            case 401:
              // Deauthenticate the global user
              Authentication.user = null;
              // Redirect to signin page
              $location.path('signin');
              break;
            case 403:
              // Add unauthorized behaviour 
              break;
            }
            return $q.reject(rejection);
          }
        };
      }
    ]);
  }
]);'use strict';
// Setting up route
angular.module('users').config([
  '$stateProvider',
  function ($stateProvider) {
    // Users state routing
    $stateProvider.state('profile', {
      url: '/settings/profile',
      templateUrl: 'modules/users/views/settings/edit-profile.client.view.html'
    }).state('password', {
      url: '/settings/password',
      templateUrl: 'modules/users/views/settings/change-password.client.view.html'
    }).state('accounts', {
      url: '/settings/accounts',
      templateUrl: 'modules/users/views/settings/social-accounts.client.view.html'
    }).state('signup', {
      url: '/signup',
      templateUrl: 'modules/users/views/authentication/signup.client.view.html'
    }).state('signin', {
      url: '/signin',
      templateUrl: 'modules/users/views/authentication/signin.client.view.html'
    }).state('forgot', {
      url: '/password/forgot',
      templateUrl: 'modules/users/views/password/forgot-password.client.view.html'
    }).state('reset-invlaid', {
      url: '/password/reset/invalid',
      templateUrl: 'modules/users/views/password/reset-password-invalid.client.view.html'
    }).state('reset-success', {
      url: '/password/reset/success',
      templateUrl: 'modules/users/views/password/reset-password-success.client.view.html'
    }).state('reset', {
      url: '/password/reset/:token',
      templateUrl: 'modules/users/views/password/reset-password.client.view.html'
    });
  }
]);'use strict';
angular.module('users').controller('AuthenticationController', [
  '$scope',
  '$rootScope',
  '$http',
  '$location',
  'Authentication',
  function ($scope, $rootScope, $http, $location, Authentication) {
    $scope.authentication = Authentication;
    // If user is signed in then redirect back home
    if ($scope.authentication.user)
      $location.path('/');
    $scope.signup = function () {
      $http.post('/auth/signup', $scope.credentials).success(function (response) {
        // If successful we assign the response to the global user model
        $scope.authentication.user = response;
        // And redirect to the index page
        $location.path('/');
      }).error(function (response) {
        $scope.error = response.message;
      });
    };
    $scope.signin = function () {
      $http.post('/auth/signin', $scope.credentials).success(function (response) {
        // If successful we assign the response to the global user model
        $scope.authentication.user = response;
        // And redirect to the index page
        $location.path('/');
      }).error(function (response) {
        $scope.error = response.message;
      });
    };
  }
]);'use strict';
angular.module('users').controller('PasswordController', [
  '$scope',
  '$stateParams',
  '$http',
  '$location',
  'Authentication',
  function ($scope, $stateParams, $http, $location, Authentication) {
    $scope.authentication = Authentication;
    //If user is signed in then redirect back home
    if ($scope.authentication.user)
      $location.path('/');
    // Submit forgotten password account id
    $scope.askForPasswordReset = function () {
      $scope.success = $scope.error = null;
      $http.post('/auth/forgot', $scope.credentials).success(function (response) {
        // Show user success message and clear form
        $scope.credentials = null;
        $scope.success = response.message;
      }).error(function (response) {
        // Show user error message and clear form
        $scope.credentials = null;
        $scope.error = response.message;
      });
    };
    // Change user password
    $scope.resetUserPassword = function () {
      $scope.success = $scope.error = null;
      $http.post('/auth/reset/' + $stateParams.token, $scope.passwordDetails).success(function (response) {
        // If successful show success message and clear form
        $scope.passwordDetails = null;
        // Attach user profile
        Authentication.user = response;
        // And redirect to the index page
        $location.path('/password/reset/success');
      }).error(function (response) {
        $scope.error = response.message;
      });
    };
  }
]);'use strict';
angular.module('users').controller('SettingsController', [
  '$scope',
  '$http',
  '$location',
  'Users',
  'Authentication',
  function ($scope, $http, $location, Users, Authentication) {
    $scope.user = Authentication.user;
    // If user is not signed in then redirect back home
    if (!$scope.user)
      $location.path('/');
    // Check if there are additional accounts 
    $scope.hasConnectedAdditionalSocialAccounts = function (provider) {
      for (var i in $scope.user.additionalProvidersData) {
        return true;
      }
      return false;
    };
    // Check if provider is already in use with current user
    $scope.isConnectedSocialAccount = function (provider) {
      return $scope.user.provider === provider || $scope.user.additionalProvidersData && $scope.user.additionalProvidersData[provider];
    };
    // Remove a user social account
    $scope.removeUserSocialAccount = function (provider) {
      $scope.success = $scope.error = null;
      $http.delete('/users/accounts', { params: { provider: provider } }).success(function (response) {
        // If successful show success message and clear form
        $scope.success = true;
        $scope.user = Authentication.user = response;
      }).error(function (response) {
        $scope.error = response.message;
      });
    };
    // Update a user profile
    $scope.updateUserProfile = function (isValid) {
      if (isValid) {
        $scope.success = $scope.error = null;
        var user = new Users($scope.user);
        user.$update(function (response) {
          $scope.success = true;
          Authentication.user = response;
        }, function (response) {
          $scope.error = response.data.message;
        });
      } else {
        $scope.submitted = true;
      }
    };
    // Change user password
    $scope.changeUserPassword = function () {
      $scope.success = $scope.error = null;
      $http.post('/users/password', $scope.passwordDetails).success(function (response) {
        // If successful show success message and clear form
        $scope.success = true;
        $scope.passwordDetails = null;
      }).error(function (response) {
        $scope.error = response.message;
      });
    };
  }
]);'use strict';
// Authentication service for user variables
angular.module('users').factory('Authentication', [function () {
    var _this = this;
    _this._data = { user: window.user };
    return _this._data;
  }]);'use strict';
// Users service used for communicating with the users REST endpoint
angular.module('users').factory('Users', [
  '$resource',
  function ($resource) {
    return $resource('users', {}, { update: { method: 'PUT' } });
  }
]);