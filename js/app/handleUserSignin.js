/*global $,FB,gapi */
/** @license
 | Copyright 2015 Esri
 |
 | Licensed under the Apache License, Version 2.0 (the "License");
 | you may not use this file except in compliance with the License.
 | You may obtain a copy of the License at
 |
 |    http://www.apache.org/licenses/LICENSE-2.0
 |
 | Unless required by applicable law or agreed to in writing, software
 | distributed under the License is distributed on an "AS IS" BASIS,
 | WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 | See the License for the specific language governing permissions and
 | limitations under the License.
 */
//====================================================================================================================//
define(["lib/i18n.min!nls/resources.js",
    "js/app/register_controller",
    "app/tokenUtil","app/splash"], function(i18n, register_controller, tokenUtil, splash) {
    "use strict";
    var handleUserSignin;
    handleUserSignin = {

        // Constants for callback to app
        notificationSignIn: 0,
        notificationSignOut: 1,
        notificationAvatarUpdate: 2,

        //------------------------------------------------------------------------------------------------------------//

        loggedIn: null,
        user: null,
        statusCallback: null,
        currentProvider: null,
        availabilities: {
            guest: false,
            facebook: false,
            googleplus: false,
            twitter: false
        },
        googleAuth: null,

        //------------------------------------------------------------------------------------------------------------//

        /**
         * Initializes the module by initializing each of the supported and selected social medium providers.
         * @param {object} appParams Application parameters to control and facilitate social-media setup; module uses
         * the facebookAppId, googleplusClientId, showFacebook, showGooglePlus, showTwitter,
         * twitterCallbackUrl, twitterSigninUrl, and twitterUserUrl properties
         * @param {function} statusCallback Function to call with social-media status events; function receives one
         * of the constants notificationSignIn, notificationSignOut, notificationAvatarUpdate (above)
         */
        init: function (appParams, statusCallback) {
            var deferred, facebookDeferred, googlePlusDeferred, twitterDeferred;

            deferred = $.Deferred();
            handleUserSignin.statusCallback = statusCallback;
            handleUserSignin.appParams = appParams;

            if (/Edge/i.test(navigator.userAgent)) {
                appParams.showFacebook = appParams.showGooglePlus = appParams.showTwitter = false;
            }

            //........................................................................................................//

            // Do we offer guest access?
            handleUserSignin.availabilities.guest = appParams.showGuest;

            handleUserSignin.availabilities.gisExpertLogin = appParams.gisExpertLogin;
            handleUserSignin.availabilities.gisExpertRegister = appParams.gisExpertRegister;

            //........................................................................................................//

            // Attempt to initialize Facebook if wanted
            facebookDeferred = $.Deferred();
            setTimeout(function () {
                if (appParams.showFacebook && appParams.facebookAppId) {
                    $.ajaxSetup({
                        cache: true
                    });
                    $.getScript("//connect.facebook.net/en_US/sdk.js", function () {
                        FB.Event.subscribe("auth.login", handleUserSignin.updateFacebookUser);
                        FB.Event.subscribe("auth.statusChange", handleUserSignin.updateFacebookUser);
                        FB.Event.subscribe("auth.logout", handleUserSignin.updateFacebookUser);

                        FB.init({
                            appId: handleUserSignin.appParams.facebookAppId,
                            cookie: true, // enable cookies to allow the server to access the session
                            xfbml: false, // parse social plugins on this page such as Login
                            status: true, // check login status on every page load
                            version: "v2.7"
                        });

                        // Update UI based on whether or not the user is currently logged in to FB
                        FB.getLoginStatus(handleUserSignin.updateFacebookUser);
                    });

                    handleUserSignin.availabilities.facebook = true;
                    facebookDeferred.resolve(true);
                }
                else {
                    facebookDeferred.resolve(false);
                }
            });

            //........................................................................................................//

            // Attempt to initialize Google+ if wanted
            googlePlusDeferred = $.Deferred();
            setTimeout(function () {
                if (appParams.showGooglePlus && appParams.googleplusClientId) {
                    // Load the SDK asynchronously; it calls window.ggAsyncInit when done
                    (function () {
                        // Don't have Google+ API scan page for button
                        window.___gcfg = {
                            parsetags: "explicit"
                        };

                        $.getScript("https://apis.google.com/js/platform.js")
                            .done(function () {
                                gapi.load("auth2", function () {
                                    handleUserSignin.googleAuth = gapi.auth2.init({
                                        "client_id": handleUserSignin.appParams.googleplusClientId,
                                        "scope": "profile"
                                    });
                                    handleUserSignin.googleAuth.then(function () {
                                        handleUserSignin.googleAuth.isSignedIn.listen(
                                            handleUserSignin.updateGooglePlusUser);
                                        handleUserSignin.availabilities.googleplus = true;
                                        googlePlusDeferred.resolve(true);
                                    }, function () {
                                        googlePlusDeferred.resolve(false);
                                    });
                                });
                            })
                            .fail(function () {
                                googlePlusDeferred.resolve(false);
                            });
                    }());
                }
                else {
                    googlePlusDeferred.resolve(false);
                }
            });

            //........................................................................................................//

            // Attempt to initialize Twitter if wanted
            twitterDeferred = $.Deferred();
            setTimeout(function () {
                if (appParams.showTwitter) {
                    handleUserSignin.availabilities.twitter = true;
                    twitterDeferred.resolve(true);
                }
                else {
                    twitterDeferred.resolve(false);
                }
            });

            //........................................................................................................//

            // Test if we have any initialized providers
            $.when(facebookDeferred, googlePlusDeferred, twitterDeferred)
                .done(function (facebookAvail, googlePlusAvail, twitterAvail) {
                    if (handleUserSignin.availabilities.guest || facebookAvail || googlePlusAvail || twitterAvail) {
                        deferred.resolve();
                    }
                    else {
                        deferred.reject();
                    }
                });

            return deferred;
        },

        createGisExpertLoginForm: function(){
            var actionButtonContainer= splash.getActionsContainer();
            $(actionButtonContainer).empty();

            splash.replacePrompt("Logowanie");

            $("<p><input id='email' type='text' name='eid' placeholder='Email'></p>"+
                "<p><input id='password' type='password' name='password' placeholder='Password'></p>"+
                "<p><button id='returnButton' type='button' class='btn btn-primary'>"+
                "Powrót</button>" +
                "<button id='loginButton' class='btn btn-primary'>Login</button>"+
                "<a id='forgotPasswordLink' href='#'>Zapomniałeś hasła?</a>"+
                "</p>"
            ).appendTo(actionButtonContainer);

            $("#loginButton").on("click", function(){handleUserSignin.loginFormSubmit()});
            $("#returnButton").on("click", function(){
                $(actionButtonContainer).empty();
                handleUserSignin.initUI();
            });
            $("#forgotPasswordLink").on("click", function(){
                $(actionButtonContainer).empty();
                handleUserSignin.createForgotPasswordForm();
            });
        },

        createForgotPasswordForm: function (){
            var actionButtonContainer= splash.getActionsContainer();
            splash.replacePrompt("Resetowanie hasła");

            $("<p><input id='email' type='text' name='eid' placeholder='Email'></p>"+
                "<p><button id='returnButton' type='button' class='btn btn-primary'>"+
                "Powrót"+
                "</button>" +
                "<button id='forgotPasswordButton' class='btn btn-primary'>Reset</button>"+
                "</p>"
            ).appendTo(actionButtonContainer);

            $("#returnButton").on("click", function(){
                $(actionButtonContainer).empty();
                handleUserSignin.createGisExpertLoginForm();
            });

            $("#forgotPasswordButton").on("click", function(){
                handleUserSignin.resetPassword();
            });
        },

        initUI: function () {
            var actionButtonContainer= splash.getActionsContainer();

            // Switch to the sign-in prompt
            splash.replacePrompt(i18n.prompts.signIn, splash.showActions);

            var URLparams = tokenUtil.getAllUrlParams(window.location.href);
            console.log(URLparams);
            if(URLparams.resettoken!==undefined){
                $("<p><input id='password' type='password' name='password' placeholder='Password'></p>"+
                    "<p><input id='passwordConfirm' type='password' name='passwordConfirm' placeholder='confirm password'></p>"+
                    "<p><button id='returnButton' type='button' class='btn btn-primary'>"+
                    "Powrót</button>" +
                    "<button id='changePasswordButton' class='btn btn-primary'>Zmień hasło</button>"+
                    "</p>"
                ).appendTo(actionButtonContainer);

                $("#returnButton").on("click", function(){
                    $(actionButtonContainer).empty();
                    history.pushState({}, null, tokenUtil.removeURLParameter(window.location.href,'resetToken'));
                    handleUserSignin.createGisExpertLoginForm();
                });

                $("#changePasswordButton").on("click", function(){
                    handleUserSignin.changePassword(URLparams.resettoken);
                });

                return;
            }

            if (handleUserSignin.availabilities.guest) {
                $("<div id='guestSignin' class='splashInfoActionButton guestOfficialColor'>" +
                    "<span class='socialMediaIcon sprites guest-user_29'></span>" +
                    i18n.labels.guestName + "</div>"
                ).appendTo(actionButtonContainer);
                $("#guestSignin").on("click", function () {
                    handleUserSignin.loggedIn = true;
                    handleUserSignin.currentProvider = "guest";

                    handleUserSignin.user = {
                        name: i18n.labels.guestName,
                        id: "",
                        org: "_guest_",
                        canSubmit: handleUserSignin.appParams.allowGuestSubmissions
                    };

                    // Update the calling app
                    handleUserSignin.statusCallback(handleUserSignin.notificationSignIn);
                });
            }

            if (handleUserSignin.availabilities.gisExpertLogin) {
                $("<div id='gisExpertLogin'><img src='images/Login.png' alt=''>" +
                    "<span style='display: block;'>Logowanie</span> </a> </div>"
                ).appendTo(actionButtonContainer);
                $("#gisExpertLogin").on("click", function () {
                    handleUserSignin.createGisExpertLoginForm();
                });
            }

            if (handleUserSignin.availabilities.gisExpertRegister) {
                $("<div id='gisExpertRegister'><img src='images/register.png' alt=''>" +
                    "<span style='display: block;'>Rejestracja</span></div>"
                ).appendTo(actionButtonContainer);
                $("#gisExpertRegister").on("click", function() {
                    register_controller.emit();
                });
            }

            if (handleUserSignin.availabilities.facebook) {
                $("<div id='facebookSignin' class='splashInfoActionButton facebookOfficialColor'>" +
                    "<span class='socialMediaIcon sprites FB-f-Logo__blue_29'></span>" +
                    "Facebook</div>").appendTo(actionButtonContainer);
                $("#facebookSignin").on("click", function () {
                    // Force reauthorization. FB says, "Apps should build their own mechanisms for allowing switching
                    // between different Facebook user accounts using log out functions and should not rely upon
                    // re-authentication for this."  (https://developers.facebook.com/docs/facebook-login/reauthentication),
                    // but doesn't seem to provide a working logout function that clears its cookies if third-party
                    // cookies are blocked.
                    FB.login(function () {
                        return null;
                    }, {
                        auth_type: "reauthenticate"
                    });
                });
            }

      if (handleUserSignin.availabilities.googleplus) {
        $("<div id='googlePlusSignin' class='splashInfoActionButton googlePlusOfficialColor'>" +
          "<span class='socialMediaIcon sprites gp-29'></span>Google+</div>").appendTo(actionButtonContainer);
        $("#googlePlusSignin").on("click", function() {
          if (handleUserSignin.googleAuth.isSignedIn.get()) {
            handleUserSignin.updateGooglePlusUser(true);
          } else {
            handleUserSignin.googleAuth.signIn();
          }
        });
      }

    },

        /**
         * Returns the signed-in state.
         * @return {boolean} Logged in or not
         */
        isSignedIn: function () {
            return handleUserSignin.loggedIn;
        },

        /**
         * Returns the currently signed-in user name and service id.
         * @return {object} Structure containing "name" and "id" parameters if a user is
         * logged in, an empty structure if a user is not logged in, and null if the
         * service is not available due to browser incompatibility or startup failure
         */
        getUser: function () {
            return handleUserSignin.user;
        },

        signOut: function () {
            if (handleUserSignin.isSignedIn()) {
                switch (handleUserSignin.currentProvider) {

                    case "guest":
                        handleUserSignin.user = {};

                        // Update the calling app
                        handleUserSignin.statusCallback(handleUserSignin.notificationSignOut);
                        break;

                    case "facebook":
                        // Log the user out of the app; known FB issue is that cookies are not cleared as promised if
                        // browser set to block third-party cookies
                        // (https://developers.facebook.com/bugs/406554842852890/)
                        FB.logout();
                        break;

                    case "googlePlus":
                        // Log the user out of the app
                        handleUserSignin.googleAuth.signOut();
                        break;

                    case "twitter":
                        // Update the calling app
                        handleUserSignin.statusCallback(handleUserSignin.notificationSignOut);

                        // Log the user out of the app
                        handleUserSignin.showTwitterLoginWin(true);
                        break;
                }
            }
            handleUserSignin.currentProvider = "none";
        },

        //------------------------------------------------------------------------------------------------------------//

        /**
         * Updates the information held about the signed-in Facebook user.
         * @param {object} [response] Service-specific response object
         * @private
         */
        updateFacebookUser: function (response) {
            // Events & FB.getLoginStatus return an updated authResponse object
            // {
            //     status: "connected",
            //     authResponse: {
            //         accessToken: "...",
            //         expiresIn:"...",
            //         signedRequest:"...",
            //         userID:"..."
            //     }
            // }

            // that response may not be true; we'll find out for sure when we call FB.api
            handleUserSignin.loggedIn = response && response.status === "connected";
            handleUserSignin.currentProvider = handleUserSignin.loggedIn ?
                "facebook" :
                "";

            // If logged in, update info from the account
            handleUserSignin.user = {};
            if (handleUserSignin.loggedIn) {
                FB.api("/me", {
                    fields: "name,id"
                }, function (apiResponse) {
                    handleUserSignin.loggedIn = apiResponse.name !== undefined;
                    if (handleUserSignin.loggedIn) {
                        handleUserSignin.user = {
                            name: apiResponse.name,
                            id: apiResponse.id,
                            org: "Facebook",
                            canSubmit: true
                        };
                        // Update the calling app
                        handleUserSignin.statusCallback(handleUserSignin.notificationSignIn);

                        // Update the avatar
                        FB.api("/" + handleUserSignin.user.id + "/picture", function (picResponse) {
                            if (picResponse && !picResponse.error && picResponse.data &&
                                !picResponse.data.is_silhouette && picResponse.data.url) {
                                handleUserSignin.user.avatar = picResponse.data.url;
                            }
                            // Update the calling app
                            handleUserSignin.statusCallback(handleUserSignin.notificationAvatarUpdate);
                        });
                    }
                    handleUserSignin.statusCallback(handleUserSignin.notificationAvatarUpdate);
                });

            }
            else {
                // Update the calling app
                handleUserSignin.statusCallback(handleUserSignin.notificationSignOut);
            }
        },

        //------------------------------------------------------------------------------------------------------------//

        /**
         * Updates the information held about the signed-in Google+ user.
         * @param {object} [response] Service-specific response object
         * @private
         */
        updateGooglePlusUser: function (response) {
            var GoogleUser, BasicProfile, avatarUrl;
            handleUserSignin.loggedIn = response; //&& response.status && response.status.signed_in;
            handleUserSignin.currentProvider = handleUserSignin.loggedIn ?
                "googlePlus" :
                "";

            // If logged in, update info from the account
            handleUserSignin.user = {};
            if (handleUserSignin.loggedIn) {
                GoogleUser = handleUserSignin.googleAuth.currentUser.get();
                BasicProfile = GoogleUser.getBasicProfile();
                handleUserSignin.user = {
                    name: BasicProfile.getName(),
                    id: BasicProfile.getId(),
                    org: "Google+",
                    canSubmit: true
                };

                // Update the calling app
                handleUserSignin.statusCallback(handleUserSignin.notificationSignIn);

                // Update the avatar
                avatarUrl = BasicProfile.getImageUrl();
                if (avatarUrl) {
                    handleUserSignin.user.avatar = avatarUrl;
                    handleUserSignin.statusCallback(handleUserSignin.notificationAvatarUpdate);
                }

                // Report not-logged-in state
            }
            else {
                handleUserSignin.statusCallback(handleUserSignin.notificationSignOut);
            }
        },

        loginFormSubmit: function () {
            var email = $("#email").val();
            var password = $("#password").val();
            if(email==='' || password===''){
                splash.showLoginError("Pola nie mogą być puste");
            }
            else
                $.ajax({
                    url: "http://localhost:8080/geoanalityka-web/rest/auth/getToken",
                    dataType: "json",
                    type: "POST",
                    contentType: 'application/json',
                    data: JSON.stringify({
                        username: email,
                        password: password
                    }),
                    success: (function (data) {
                        handleUserSignin.statusCallback(handleUserSignin.notificationSignIn);
                        tokenUtil.setCookie("token", data.token, 4);
                    }),
                    error: (function (xhr, ajaxOptions, thrownError) {
                        console.log(xhr);
                        splash.showLoginError(JSON.parse(xhr.responseText).message);
                    })
                })
        },

        resetPassword: function () {
            var email = $("#email").val();
            if(email===''){
                splash.showLoginError("Pole nie może być puste");
            }
            else
                $.ajax({
                    url: "http://localhost:8080/geoanalityka-web/rest/auth/resetPassword",
                    dataType: "json",
                    type: "POST",
                    contentType: 'application/json',
                    data: JSON.stringify({
                        username: email
                    }),
                    success: (function (data) {
                        splash.showLoginSuccess(data.message);
                    }),
                    error: (function (xhr, ajaxOptions, thrownError) {
                        splash.showLoginError(JSON.parse(xhr.responseText).message);
                    })
                })
        },

        changePassword: function (token) {
            var passwordConfirm = $("#passwordConfirm").val();
            var password = $("#password").val();
            if(passwordConfirm==='' || confirm===''){
                splash.showLoginError("Pola nie mogą być puste");
            }
            else if(passwordConfirm!==password){
                splash.showLoginError("Podane hasła nie są zgodne");
            }
            else
                $.ajax({
                    url: "http://localhost:8080/geoanalityka-web/rest/auth/changePassword",
                    dataType: "json",
                    type: "POST",
                    contentType: 'application/json',
                    data: JSON.stringify({
                        password: password,
                        confirmPassword: passwordConfirm,
                        resetPasswordToken: token
                    }),
                    success: (function (data) {
                        splash.showLoginSuccess(data.message);
                    }),
                    error: (function (xhr, ajaxOptions, thrownError) {
                        console.log(xhr);
                        splash.showLoginError(JSON.parse(xhr.responseText).message);
                    })
                })
        },
    };
    return handleUserSignin;
    //----------------------------------------------------------------------------------------------------------------//
});
