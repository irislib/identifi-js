'use strict';

// Identifiers controller
angular.module('identifiers').controller('IdentifiersController', ['$scope', '$stateParams', '$location', 'Authentication', 'Identifiers',
	function($scope, $stateParams, $location, Authentication, Identifiers ) {
		$scope.authentication = Authentication;

    $scope.idType = $stateParams.idType;
    $scope.idValue = $stateParams.idValue;

    var scrollTo = function(el) {
      var pos = el.getBoundingClientRect();
      if (pos.top) {
        if (pos.top - 60 < window.pageYOffset)
          window.scrollTo(0, pos.top - 60);
        else if (pos.bottom > window.pageYOffset + (window.innerHeight || document.documentElement.clientHeight))
          window.scrollTo(0, pos.bottom - (window.innerHeight || document.documentElement.clientHeight) + 15);
      }
    };

		// Search
		$scope.search = function(query) {
			$scope.identifiers = Identifiers.query({idValue: query || ''}, function() {
        $scope.identifiers.activeKey = 0;
        $scope.identifiers[0].active = true;
        for (var i = 0; i < $scope.identifiers.length; i++) {
          var id = $scope.identifiers[i];
          for (var j in id) {
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
                if (id[j][1].indexOf('facebook.com/') > -1)
                  id.facebook = id[j][1].split('facebook.com/')[1];
                if (id[j][1].indexOf('twitter.com/') > -1)
                  id.twitter = id[j][1].split('twitter.com/')[1];
                if (id[j][1].indexOf('plus.google.com/') > -1)
                  id.googlePlus = id[j][1].split('plus.google.com/')[1];
                break;
            }
          }
          if (!id.gravatar)
            id.gravatar = CryptoJS.MD5(id[0][1]).toString();
          if (!id.name) {
            if (id.nickname) id.name = id.nickname;
            else id.name = id[0][1];
          }
        }

      });
		};

    $scope.resultClicked = function(result) {
      $location.path('/id/' + result[0][0] + '/' + result[0][1]);
    };

    $scope.$on('SearchKeydown', function(event, args) {
      switch (args.event.which) {
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
          $location.path('/id/' + id[0][0] + '/' + id[0][1]);
          break;
        case 37:
        case 39:
          break; 
        default:
          var el = angular.element(args.event.currentTarget);
          clearTimeout($scope.timer);
          var wait = setTimeout(function() { 
            $scope.search(el.val());
          }, 300);
          $scope.timer = wait;
          break;
      }
    });

		// Find existing Identifier
		$scope.findOne = function() {
      $scope.quickConnections = [];

			$scope.connections = Identifiers.connections({ 
				idType: $stateParams.idType,
        idValue: $stateParams.idValue,
			}, function() {
        for (var key in $scope.connections) {
          var conn = $scope.connections[key];
          switch (conn.type) {
            case 'email':
              conn.iconStyle = 'glyphicon glyphicon-envelope';
              conn.btnStyle = 'btn-success';
              conn.link = 'mailto:' + conn.value;
              conn.quickContact = true;
              if ($scope.email === '')
                $scope.email = conn.value;
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
            case 'name':
              conn.iconStyle = 'glyphicon glyphicon-font';
              break;
            case 'tel', 'phone':
              conn.iconStyle = 'glyphicon-earphone';
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
              } else if (conn.value.indexOf('plus.google.com/') > -1) {
                conn.iconStyle = 'fa fa-google-plus';
                conn.btnStyle = 'btn-google-plus';
                conn.quickContact = true;
              } else {
                conn.iconStyle = 'glyphicon glyphicon-link';
                conn.btnStyle = 'btn-default';
              }
              break;
          }
          $scope.hasQuickContacts = $scope.hasQuickContacts || conn.quickContact;
        }
        $scope.connectionClicked = function(event, id) {
          id.collapse = !id.collapse;
          id.connectingmsgs = id.connectingmsgs || Identifiers.connectingmsgs({idType: $scope.idType, idValue: $scope.idValue, id2Type: id.type, id2Value: id.value}, function() {
            for (var key in id.connectingmsgs) {
              var msg = id.connectingmsgs[key];
              msg.gravatar = CryptoJS.MD5(msg.authorEmail||msg.data.signedData.author[0][1]).toString();
            }
          });
        };
      });

			$scope.overview = Identifiers.get({ 
				idType: $stateParams.idType,
        idValue: $stateParams.idValue,
        method: 'overview'
			}, function() {
        $scope.email = $scope.overview.email;
        if ($scope.email === '')
          $scope.email = $scope.idValue;
        $scope.gravatar = CryptoJS.MD5($scope.email).toString();
      });

			$scope.sent = Identifiers.sent({ 
				idType: $stateParams.idType,
        idValue: $stateParams.idValue,
			});

			$scope.received = Identifiers.received({ 
				idType: $stateParams.idType,
        idValue: $stateParams.idValue,
      }, function () {
        for (var key in $scope.received) {
          if (isNaN(key)) continue;
          var msg = $scope.received[key];
          var gravatarEmail = msg.authorEmail;
          if (msg.authorEmail === '')
            gravatarEmail = msg.data.signedData.author[0][0] + msg.data.signedData.author[0][1];
          msg.gravatar = CryptoJS.MD5(gravatarEmail).toString();


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
              var maxRatingDiff = (signedData.maxRating - neutralRating);
              var minRatingDiff = (signedData.minRating - neutralRating);
              if (rating > neutralRating) {
                msg.panelStyle = 'panel-success';
                msg.iconStyle = 'glyphicon glyphicon-thumbs-up';
                msg.iconCount = (maxRatingDiff < 2) ? msg.iconCount : new Array(Math.ceil(3 * rating / maxRatingDiff));
                alpha = (rating - neutralRating - 0.5) / maxRatingDiff / 1.25 + 0.2;
                msg.bgColor = 'background-image:linear-gradient(rgba(223,240,216,'+alpha+') 0%, rgba(208,233,198,'+alpha+') 100%);background-color: rgba(223,240,216,'+alpha+');';
              } else if (rating < neutralRating) {
                msg.panelStyle = 'panel-danger';
                msg.iconStyle = 'glyphicon glyphicon-thumbs-down';
                msg.iconCount = (minRatingDiff > -2) ? msg.iconCount : new Array(Math.ceil(3 * rating / minRatingDiff));
                alpha = (rating - neutralRating + 0.5) / minRatingDiff / 1.25 + 0.2;
                msg.bgColor = 'background-image:linear-gradient(rgba(242,222,222,'+alpha+') 0%, rgba(235,204,204,'+alpha+') 100%);background-color: rgba(242,222,222,'+alpha+');';
              } else {
                msg.panelStyle = 'panel-warning';
                msg.iconStyle = 'glyphicon glyphicon-question-sign';
              }
              break;
          }
        }
			});

			$scope.trustpath = Identifiers.trustpath({ 
				idType: $stateParams.idType,
        idValue: $stateParams.idValue
			}, function() {
        for (var i = 0; i < $scope.trustpath.length; i++) {
          for (var key in $scope.trustpath[i]) {
            var id = $scope.trustpath[i][key];
            id.gravatar = CryptoJS.MD5(id[1]).toString();
          }
        }
      });
		};
	}
]);
