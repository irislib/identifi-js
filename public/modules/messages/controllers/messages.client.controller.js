'use strict';

// Messages controller
angular.module('messages').controller('MessagesController', ['$scope', '$stateParams', '$location', 'Authentication', 'Messages',
	function($scope, $stateParams, $location, Authentication, Messages ) {
		$scope.authentication = Authentication;

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

		// Create new Message
		$scope.create = function() {
			// Create new Message object
			var message = new Messages ({
				name: this.name
			});

			// Redirect after save
			message.$save(function(response) {
				$location.path('messages/' + response._id);

				// Clear form fields
				$scope.name = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Remove existing Message
		$scope.remove = function( message ) {
			if ( message ) { message.$remove();

				for (var i in $scope.messages ) {
					if ($scope.messages [i] === message ) {
						$scope.messages.splice(i, 1);
					}
				}
			} else {
				$scope.message.$remove(function() {
					$location.path('messages');
				});
			}
		};

		// Update existing Message
		$scope.update = function() {
			var message = $scope.message ;

			message.$update(function() {
				$location.path('messages/' + message._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Find a list of Messages
		$scope.find = function() {
			$scope.messages = Messages.query(function () {
        processMessages($scope.messages);
			});
		};

		// Find existing Message
		$scope.findOne = function() {
			$scope.message = Messages.get({ 
				messageId: $stateParams.messageId
			}, function() {
        $scope.message.strData = JSON.stringify($scope.message.data, undefined, 2);
        $scope.message.authorGravatar = CryptoJS.MD5($scope.message.authorEmail||$scope.message.data.signedData.author[0][1]).toString();
        $scope.message.recipientGravatar = CryptoJS.MD5($scope.message.recipientEmail||$scope.message.data.signedData.recipient[0][1]).toString();
      });
		};
	}
]);
