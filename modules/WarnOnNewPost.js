"use strict";
/* jshint multistr: true */
/* jshint newcap: false */

/**
 * WarnOnNewPost : Permet de savoir quand un nouveau message a été posté dans un topic sans recharger la page
 */
SK.moduleConstructors.WarnOnNewPost = SK.Module.new();

SK.moduleConstructors.WarnOnNewPost.prototype.id = "WarnOnNewPost";
SK.moduleConstructors.WarnOnNewPost.prototype.title = "Indiquer les nouveaux posts";
SK.moduleConstructors.WarnOnNewPost.prototype.description = "Indique le nombre de nouveaux messages postés depuis que la page a chargé dans le titre de l'onglet";

SK.moduleConstructors.WarnOnNewPost.prototype.init = function() {

	var self = this;
	var startTimeout = 3000;
	var checkInterval = 3000;
	var faviconChanged = false;

	//Nombre de posts au chargement
	var initialPostCount = 0;
	//Titre de l'onglet au chargement
	var initialTitle = "";


	//Change le favicon en icone de notifiction
	var changeFavicon = function() {
		var $faviconLink = $("<link>", {
			rel: "shortcut icon",
			type: "image/png",
			href: "http://dl.spixel.fr/get-spawnkill/img/favicon-notification.png"
		});
		$("head").append($faviconLink);
		faviconChanged = true;
	};

    //Timeout de 3 secondes pour éviter que le script ne retarde le chargement de la page
    setTimeout(function() {
    	//On récupère les infos initiales du topic
    	self.getPostCount(function(postCount) {

    		initialTitle = $("title").html();
    		initialPostCount = postCount;

    		//On récupère de nouveau les infos du topic à intervale régulier
    		setInterval(function() {

    			self.getPostCount(function(newPostCount) {
    				//Si le nombre de posts est différent, on met à jour le titre de la page
    				var newTitle = "";
    				var changeIcon = false;

    				//Si newPostCount === -1, il y a eu une erreur
    				if(newPostCount !== -1) {
	    				if(initialPostCount !== newPostCount) {
	    					newTitle = "(" + (newPostCount - initialPostCount) + ") " + initialTitle;
	    					changeIcon = true; 
	    					$("title").html(newTitle);
	    				}

	    				//Si besoin, on change le favicon
	    				if (!faviconChanged && changeIcon) {
	    					changeFavicon();
	    				}
	    			}

    			}, false);

    		}, checkInterval);
    	}); //On log seulement le premier appel
    }, startTimeout);
};

/**
 * Récupère le nombre de posts du topic via l'API JVC.
 * Appelle la fonction de callback avec le nombre de posts en arguments.
 */
SK.moduleConstructors.WarnOnNewPost.prototype.getPostCount = function(callback, logApiCall) {

	var match = window.location.href.match(/http:\/\/www\.jeuxvideo\.com\/forums\/1-(\d*-\d*).*/);
	var topicId = match[1];
	SK.Util.api("topic", topicId, function($api) {
		callback(parseInt($api.find("postcount").html()));
	}, logApiCall);
    
};

SK.moduleConstructors.WarnOnNewPost.prototype.shouldBeActivated = function() {
    return SK.Util.currentPageIn([ "topic-read" ]);
};