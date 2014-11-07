'use strict';

// Identifiers controller
angular.module('identifiers').controller('IdentifiersController', ['$scope', '$stateParams', '$location', 'Authentication', 'Identifiers',
	function($scope, $stateParams, $location, Authentication, Identifiers ) {
		$scope.authentication = Authentication;

    $scope.idType = decodeURIComponent($stateParams.idType);
    $scope.idValue = decodeURIComponent($stateParams.idValue);
    $scope.sent = [];
    $scope.received = [];
    $scope.trustpaths = [];
    $scope.filters = {
      maxDistance: 0,
      msgType: 'rating',
      receivedOffset: 0,
      sentOffset: 0,
      limit: 20,
    };
    $scope.defaultViewpoint = {
      viewpointName: 'Identi.fi',
      viewpointType: 'keyID',
      viewpointValue: '18bHa3QaHxuHAbg9wWtkx2KBiQPZQdTvUT'
    };
    $scope.activeTab = 'received';
    $scope.collapseLevel = {};
    $scope.uniqueIdentifierTypes = [
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
    ];
    $scope.isUniqueType = $scope.uniqueIdentifierTypes.indexOf($scope.idType) > -1;

    var processMessages = function(messages) {
      for (var key in messages) {
        if (isNaN(key)) continue;
        var msg = messages[key];
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
    };

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
		$scope.search = function() {
			$scope.identifiers = Identifiers.query({idValue: $scope.queryTerm || ''}, function() {
        $scope.identifiers.activeKey = 0;
        $scope.identifiers[0].active = true;
        for (var i = 0; i < $scope.identifiers.length; i++) {
          var id = $scope.identifiers[i];
          for (var j in id) {
            if (!id.linkTo && $scope.uniqueIdentifierTypes.indexOf(id[j][0]) > -1)
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
                if (id[j][1].indexOf('facebook.com/') > -1)
                  id.facebook = id[j][1].split('facebook.com/')[1];
                if (id[j][1].indexOf('twitter.com/') > -1)
                  id.twitter = id[j][1].split('twitter.com/')[1];
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
            if (id.nickname) id.name = id.nickname;
            else id.name = id[0][1];
          }
        }

      });
		};

    $scope.resultClicked = function(result) {
      $location.path('/id/' + encodeURIComponent(result.linkTo[0]) + '/' + encodeURIComponent(result.linkTo[1]));
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
          $scope.resultClicked(id);
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
          var wait = setTimeout(function() { 
            $scope.queryTerm = el.val();
            $scope.search();
          }, 300);
          $scope.timer = wait;
          break;
      }
    });

    var getConnections = function() {
			$scope.connections = Identifiers.connections(angular.extend({ 
				idType: $scope.idType,
        idValue: $scope.idValue,
			}, $scope.filters, $scope.filters.maxDistance > -1 ? $scope.defaultViewpoint : {}), function() {
        var mostConfirmations = $scope.connections.length > 0 ? $scope.connections[0].confirmations : 1;
        $scope.connections.unshift({type: $scope.idType, value: $scope.idValue, confirmations: 1, refutations: 0, isCurrent: true });
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
                conn.rowStyle = 'background-color: rgba(223,240,216,'+alpha+')';
              }
              else if (percentage >= 60)
                conn.rowClass = 'warning';
              else 
                conn.rowClass = 'danger';
          }
          $scope.hasQuickContacts = $scope.hasQuickContacts || conn.quickContact;
        }
        $scope.connectionClicked = function(event, id) {
          id.collapse = !id.collapse;
          id.connectingmsgs = id.connectingmsgs || Identifiers.connectingmsgs(angular.extend({idType: $scope.idType, idValue: $scope.idValue, id2Type: id.type, id2Value: id.value}, $scope.filters), function() {
            for (var key in id.connectingmsgs) {
              if (isNaN(key)) continue;
              var msg = id.connectingmsgs[key];
              msg.gravatar = CryptoJS.MD5(msg.authorEmail||msg.data.signedData.author[0][1]).toString();
            }
          });
        };
      });
    };

    var getOverview = function() {
			$scope.overview = Identifiers.get(angular.extend({ 
				idType: $scope.idType,
        idValue: $scope.idValue,
        method: 'overview'
			}, $scope.filters, $scope.filters.maxDistance > -1 ? $scope.defaultViewpoint : 0), function() {
        $scope.email = $scope.overview.email;
        if ($scope.email === '')
          $scope.email = $scope.idValue;
        $scope.gravatar = CryptoJS.MD5($scope.email).toString();
      });
    };

    $scope.getSentMsgs = function(offset) {
      if (!isNaN(offset))
        $scope.filters.sentOffset = offset;
			var sent = Identifiers.sent(angular.extend({ 
				idType: $scope.idType,
        idValue: $scope.idValue,
        msgType: $scope.filters.msgType,
        offset: $scope.filters.sentOffset,
        limit: $scope.filters.limit
      }, $scope.filters, $scope.filters.maxDistance > -1 ? $scope.defaultViewpoint : 0), function () {
        processMessages(sent);
        if ($scope.filters.sentOffset === 0)
          $scope.sent = sent;
        else {
          for (var key in sent) {
            if (isNaN(key)) continue;
            $scope.sent.push(sent[key]);
          }
        }
        $scope.sent.$resolved = sent.$resolved;
        $scope.filters.sentOffset = $scope.filters.sentOffset + sent.length;
        if (sent.length < $scope.filters.limit)
          $scope.sent.finished = true;
			});
      if (offset === 0) {
        $scope.sent = {};
      }
      $scope.sent.$resolved = sent.$resolved;
    };

    $scope.getReceivedMsgs = function(offset) {
      if (!isNaN(offset))
        $scope.filters.receivedOffset = offset;
			var received = Identifiers.received(angular.extend({ 
				idType: $scope.idType,
        idValue: $scope.idValue,
        msgType: $scope.filters.msgType,
        offset: $scope.filters.receivedOffset,
        limit: $scope.filters.limit
      }, $scope.filters, $scope.filters.maxDistance > -1 ? $scope.defaultViewpoint : 0), function () {
        processMessages(received);
        if ($scope.filters.receivedOffset === 0)
          $scope.received = received;
        else {
          for (var key in received) {
            if (isNaN(key)) continue;
            $scope.received.push(received[key]);
          }
        }
        $scope.received.$resolved = received.$resolved;
        $scope.filters.receivedOffset = $scope.filters.receivedOffset + received.length;
        if (received.length < $scope.filters.limit)
          $scope.received.finished = true;
			});
      if (offset === 0) {
        $scope.received = {};
      }
      $scope.received.$resolved = received.$resolved;
    };

		// Find existing Identifier
		$scope.findOne = function() {
      getConnections();
      getOverview();
      $scope.getSentMsgs();
      $scope.getReceivedMsgs();

			var allPaths = Identifiers.trustpaths({ 
				idType: $scope.idType,
        idValue: $scope.idValue
			}, function() {
        if (allPaths.length === 0) return;
        var shortestPath = Object.keys(allPaths[0]).length;
        angular.forEach (allPaths[0], function(value, i) {
          var set = {};
          var row = [];
          for (var j = 0; j < allPaths.length; j++) {
            if (Object.keys(allPaths[j]).length > shortestPath) break;
            var id = allPaths[j][i];
            id.gravatar = CryptoJS.MD5(id[1]).toString();
            set[id[0] + id[1]] = id;
          }
          for (var key in set) {
            row.push(set[key]);
          }
          $scope.trustpaths.push(row);
        });
      });
		};

    $scope.setFilters = function(filters) {
      angular.extend($scope.filters, filters);
      getConnections();
      getOverview();
      $scope.getReceivedMsgs(0);
      $scope.getSentMsgs(0);
    };
	}
]);
