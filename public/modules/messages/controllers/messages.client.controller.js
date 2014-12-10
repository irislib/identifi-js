'use strict';

// Messages controller
angular.module('messages').controller('MessagesController', ['$scope', '$rootScope', '$window', '$stateParams', '$location', 'Authentication', 'Messages',
	function($scope, $rootScope, $window, $stateParams, $location, Authentication, Messages ) {
		$scope.authentication = Authentication;
    $scope.idType = decodeURIComponent($stateParams.idType);
    $scope.idValue = decodeURIComponent($stateParams.idValue);
    $scope.messages = [];
    $scope.newMessage = { type: 'rating', rating: 1, comment: '' };
    $scope.newConnection = { type: '', value: '' };
    $scope.iconCount = function(rating) {
      return new Array(Math.max(1, Math.abs(rating)));   
    };
    $scope.iconStyle = function(rating) {
      var iconStyle = 'neutral';
      if (rating > 0) iconStyle = 'positive';
      else if (rating < 0) iconStyle = 'negative';
      return iconStyle;
    };
    $scope.iconClass = function(rating) {
      var iconStyle = 'glyphicon-question-sign';
      if (rating > 0) iconStyle = 'glyphicon-thumbs-up';
      else if (rating < 0) iconStyle = 'glyphicon-thumbs-down';
      return iconStyle;
    };
    $rootScope.filters = $rootScope.filters || ApplicationConfiguration.defaultFilters;
    angular.extend($rootScope.filters, { offset: 0 });
    if ($scope.authentication.user) {
      $rootScope.viewpoint = { viewpointName: $scope.authentication.user.displayName,
                               viewpointType: 'email',
                               viewpointValue: $scope.authentication.user.email };
    } else {
      $rootScope.viewpoint = $rootScope.viewpoint || ApplicationConfiguration.defaultViewpoint;
    }

    $scope.collapseFilters = $window.innerWidth < 992;

    var processMessages = function(messages) {
      for (var key in messages) {
        if (isNaN(key)) continue;
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

		// Create new Message
		$scope.create = function(event, params, id) {
      event.stopPropagation();
			// Create new Message object
			var message = new Messages ({
				recipientType: $scope.idType,
				recipientValue: $scope.idValue,
			});
      angular.extend(message, params);

			message.$save(function(response) {
				// Clear form fields
				$scope.newMessage.comment = '';
				$scope.newMessage.rating = 1;
				$scope.newConnection.type = '';
				$scope.newConnection.value = '';
        $scope.$root.$broadcast('MessageAdded', { message: message, id: id });
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

    $scope.find = function(offset) {
      $rootScope.pageTitle = ' - Latest messages';
      if (!isNaN(offset))
        $rootScope.filters.offset = offset;
      var params = angular.extend({ 
				idType: $scope.idType,
        idValue: $scope.idValue,
      }, $rootScope.filters, $rootScope.filters.maxDistance > -1 ? ApplicationConfiguration.defaultViewpoint : {});
			var messages = Messages.query(params, function () {
        processMessages(messages);
        if ($rootScope.filters.offset === 0)
          $scope.messages = messages;
        else {
          for (var key in messages) {
            if (isNaN(key)) continue;
            $scope.messages.push(messages[key]);
          }
        }
        $scope.messages.$resolved = messages.$resolved;
        $rootScope.filters.offset = $rootScope.filters.offset + (messages.length || 0);
        if (messages.length < $rootScope.filters.limit)
          $scope.messages.finished = true;
			});
      if (offset === 0) {
        $scope.messages = {};
      }
      $scope.messages.$resolved = messages.$resolved;
    };


		// Find existing Message
		$scope.findOne = function() {
			$scope.message = Messages.get({ 
				messageId: $stateParams.messageId
			}, function() {
        $rootScope.pageTitle = ' - Message ' + $stateParams.messageId;
        $scope.message.strData = JSON.stringify($scope.message.data, undefined, 2);
        $scope.message.authorGravatar = CryptoJS.MD5($scope.message.authorEmail||$scope.message.data.signedData.author[0][1]).toString();
        $scope.message.recipientGravatar = CryptoJS.MD5($scope.message.recipientEmail||$scope.message.data.signedData.recipient[0][1]).toString();
      });
		};
    $scope.setFilters = function(filters) {
      angular.extend($rootScope.filters, filters);
      angular.extend($rootScope.filters, { offset: 0, receivedOffset: 0, sentOffset: 0 });
      $scope.find(0);
    };
	}
]);
