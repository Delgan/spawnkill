"use strict";
/* jshint multistr: true */
/* jshint newcap: false */

/**
 * Usability : Permet d'ajouter des fonctionnalités améliorant l'ergonomie générale du forum
 */
SK.moduleConstructors.Usability = SK.Module.new();

SK.moduleConstructors.Usability.prototype.id = "Usability";
SK.moduleConstructors.Usability.prototype.title = "Amélioration de l'ergonomie";
SK.moduleConstructors.Usability.prototype.description = "Ajoute quelques fonctionnalités simples permettant d'améliorer la navigation";


SK.moduleConstructors.Usability.prototype.init = function() {
    //Rafraichir -> dernier post
    if (this.getSetting("refreshToLastPost")) {

        //La page vient d'être rafraichie
        if (this.isJustRefreshed()) {
            //Scrolle jusqu'au dernier message
            this.scrollToLastPost();

            // Nettoie l'URL
            window.location.hash = "";
        }
        this.editRefreshLinks();
    }
    if (this.getSetting("focusOnNewMessage")) {
        this.bindFocusOnNewMessage();
    }

    if (this.getSetting("betterMessageInput")) {

        $("#message_topic").autoGrow();
        this.overrideQuoteButton();
    }
};

/**
 * Modifie les liens de rafraichissement du sujet pour qu'ils renvoient vers le dernier post
 */
SK.moduleConstructors.Usability.prototype.editRefreshLinks = function() {

    // On supprime la classe du bouton actualiser pour modifier son comportement
    $(".btn-actualiser-forum")
        .removeClass("btn-actualiser-forum")
        .on("click", function() {
            window.location.href = SK.Util.currentSimpleUrl() + "#refresh";
            window.location.reload();
        })
    ;
};

SK.moduleConstructors.Usability.prototype.isJustRefreshed = function() {
    //Cette regexp teste si l'url contient ?refresh=1
    var regexp = /#refresh/;

    //Teste si la requête vient du bouton Rafraichir
    return regexp.test(document.URL);
};

/**
 * Scrolle la page au dernier message.
 */
SK.moduleConstructors.Usability.prototype.scrollToLastPost = function() {
    $(".conteneur-message").last().scrollThere();

};

/**
 * Ajoute le focus sur le sujet au clic sur "Nouveau topic"
 * ainsi que le focus sur le message au clic sur "Nouveau message"
 */
SK.moduleConstructors.Usability.prototype.bindFocusOnNewMessage = function() {

    // Nouveau topic
    $(".bloc-pre-left:first .btn-actu-new-list-forum").on("mousedown", function() {
        setTimeout(function() {
            $("#titre_topic").focus();
        }, 500);
    });

    // Nouveau message
    $(".btn-repondre-msg").on("mousedown", function() {
        setTimeout(function() {
            $("#message_topic").focus();
        }, 500);
    });
};

/**
 * Remplace l'événement onclick du bouton de citation par un nouvel
 * événement permettant de faire fonctionner autoGrow
 */
SK.moduleConstructors.Usability.prototype.overrideQuoteButton = function() {

    this.queueFunction(function() {

        unsafeWindow.$(".picto-msg-quote").off();
        $(".picto-msg-quote").on("click", function() {
            var $msg = $(this).parents(".bloc-message-forum");
            var postId = $msg .attr("data-id");
            var pseudo = $msg.find(".bloc-pseudo-msg").text().replace(/[\r\n]/g, "");
            var date = $msg.find(".bloc-date-msg").text().replace(/[\r\n]/g, "").replace(/[\r\n]/g, "").replace(/#[0-9]+$/g, "");

            $.ajax({
                type: "POST",
                url: "/forums/ajax_citation.php",
                dataType: "json",
                data: {
                    id_message: postId,
                    ajax_timestamp: $("#ajax_timestamp_liste_messages").val(),
                    ajax_hash: $("#ajax_hash_liste_messages").val(),
                },
                success: function (data) {
                    if (data.erreur.length === 0) {
                        unsafeWindow.$("#message_topic")
                            .insertStartLine("> Le " + date + " " + pseudo + " a écrit :\n>" + data.txt.split("\n").join("\n> ") + "\n\n")
                            .get(0).dispatchEvent(new Event("keyup"))
                        ;
                        $("#message_topic").scrollThere();
                    }
                }
            });
        });
    });
};


SK.moduleConstructors.Usability.prototype.settings = {
    refreshToLastPost: {
        title: "Rafraîchir au dernier message",
        description: "Le bouton \"Rafraîchir\" d'un topic amène directement au dernier post de ce topic",
        type: "boolean",
        default: true,
    },
    focusOnNewMessage: {
        title: "Focus au nouveau message",
        description: "les boutons \"Nouveau sujet\" et \"Répondre\" donnent le focus sur le champ de réponse",
        type: "boolean",
        default: true,
    },
    betterMessageInput: {
        title: "Améliorer la saisie des messages",
        description: "Redimensionne automatiquement la boîte de saisie des messages/topics et change le curseur au survol de la preview",
        type: "boolean",
        default: true,
    },
    hideTopBar: {
        title: "Masquer la barre de navigation",
        description: "Cache la barre de navigation en haut de la page quand on scrolle",
        type: "boolean",
        default: false,
    },
    hideFeedbackButton: {
        title: "Masquer le bouton de feedback",
        description: "Cache le bouton de feedback en bas à droite de la page",
        type: "boolean",
        default: false,
    },
};

SK.moduleConstructors.Usability.prototype.getCss = function() {
    var css = "";

    if (this.getSetting("betterMessageInput")) {
        css += "\
            .jv-editor .previsu-editor {\
                cursor: not-allowed;\
            }\
        ";
    }

    if (this.getSetting("hideTopBar")) {
        css += "\
            #header-bottom.affix .bloc-sticker {\
                position: absolute !important;\
            }\
            .affix #navbar-jv {\
                left: 0px !important;\
            }\
            #header-bottom.affix .a-back-home {\
                display: none;\
            }\
        ";
    }

    if (this.getSetting("hideFeedbackButton")) {
        css += "\
            #jv-feedback {\
                display: none;\
            }\
        ";
    }

    return css;
};

SK.moduleConstructors.Usability.prototype.shouldBeActivated = function() {
    return SK.Util.currentPageIn(SK.common.Pages.TOPIC_READ, SK.common.Pages.TOPIC_LIST);
};
