'use strict';

// Identifiers controller
angular.module('identifiers').controller('IdentifiersController', ['$scope', '$stateParams', '$location', 'Authentication', 'Identifiers',
	function($scope, $stateParams, $location, Authentication, Identifiers ) {
		$scope.authentication = Authentication;

    $scope.idType = $stateParams.idType;
    $scope.idValue = $stateParams.idValue;

		// Search
		$scope.search = function() {
			$scope.identifiers = Identifiers.query({idValue: $scope.queryTerm || ''}, function() {
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

    $scope.$on('StartSearch', function(event, args) {
      $scope.queryTerm = args.queryTerm;
      $scope.search();
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
