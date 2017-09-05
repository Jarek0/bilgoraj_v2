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
        notificationRegister: 3,

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

            //........................................................................................................//

            // Do we offer guest access?
            handleUserSignin.availabilities.guest = appParams.showGuest;

            handleUserSignin.availabilities.gisExpertLogin = appParams.gisExpertLogin;
            handleUserSignin.availabilities.gisExpertRegister = appParams.gisExpertRegister;

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

        initUI: function () {
            var actionButtonContainer= splash.getActionsContainer();

            // Switch to the sign-in prompt
            splash.replacePrompt(i18n.prompts.signIn, splash.showActions);

            var URLparams = tokenUtil.getAllUrlParams(window.location.href);

            if(URLparams.resettoken!==undefined){
                splash.replacePrompt("Zmień hasło");

                $("<p><input id='password' type='password' name='password' placeholder='Password'></p>"+
                    "<p><input id='passwordConfirm' type='password' name='passwordConfirm' placeholder='confirm password'></p>"+
                    "<p><button id='returnButton' type='button' class='btn btn-primary'>"+
                    "Powrót</button>" +
                    "<button id='changePasswordButton' class='btn btn-primary'>Zmień hasło</button>"+
                    "</p>"
                ).appendTo(actionButtonContainer);

                $("#returnButton").on("click", function(){
                    splash.clearLoginForm();
                    window.history.pushState("object or string", document.title, tokenUtil.removeURLParameter(window.location.href,'resetToken'));
                    handleUserSignin.createGisExpertLoginForm();
                });


                $("#changePasswordButton").on("click", function(){
                    handleUserSignin.changePassword(URLparams.resettoken);
                });

                return;
            }

            if(URLparams.registersuccess!==undefined && JSON.parse(URLparams.registersuccess)==="true"){
                window.history.pushState("object or string", document.title, tokenUtil.removeURLParameter(window.location.href,'registerSuccess'));
                splash.showSuccess("Rejestracja powiodła się. Przejdź do skrzynki mailowej w celu weryfikacji")
            }

            if(URLparams.surveysubmitsuccess!==undefined){
                if(JSON.parse(URLparams.surveysubmitsuccess)===true){
                    window.history.pushState("object or string", document.title, tokenUtil.removeURLParameter(window.location.href,'surveySubmitSuccess'));
                    splash.showSuccess("Ankieta zostala poprawnie wysłana")
                }
                else{
                    window.history.pushState("object or string", document.title, tokenUtil.removeURLParameter(window.location.href,'surveySubmitSuccess'));
                    splash.showError("W czasie wysyłania ankiety nastąpił błąd. Spróbuj zalogować się ponownie lub skontaktuj się z administratorem.")
                }
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
                        canSubmit: false
                    };

                    // Update the calling app
                    handleUserSignin.statusCallback(handleUserSignin.notificationSignIn);
                });
            }

            if (handleUserSignin.availabilities.gisExpertLogin) {
                $("<div id='gisExpertLogin' class='splashInfoActionButton'><img src='images/Login.png' alt=''>" +
                    "<span style='display: block;'>Logowanie</span></div>"
                ).appendTo(actionButtonContainer);
                $("#gisExpertLogin").on("click", function () {
                    handleUserSignin.createGisExpertLoginForm();
                });
            }

            if (handleUserSignin.availabilities.gisExpertRegister) {
                $("<div id='gisExpertRegister' class='splashInfoActionButton'><img src='images/register.png' alt=''>" +
                    "<span style='display: block;'>Rejestracja</span></div>"
                ).appendTo(actionButtonContainer);
                $("#gisExpertRegister").on("click", function() {
                    handleUserSignin.statusCallback(handleUserSignin.notificationRegister);
                });
            }

            if(URLparams.registerSuccess!==undefined && URLparams.registerSuccess===true){
                splash.clearMessages();
                splash.showSuccess("Rejestracja powiodła się. Przejdź do skrzynki mailowej w celu weryfikacji.")
            }
        },

        createGisExpertLoginForm: function(){
            var actionButtonContainer= splash.getActionsContainer();
            splash.clearLoginForm();

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
                splash.clearLoginForm();
                handleUserSignin.initUI();
            });
            $("#forgotPasswordLink").on("click", function(){
                splash.clearLoginForm();
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
                splash.clearLoginForm();
                handleUserSignin.createGisExpertLoginForm();
            });

            $("#forgotPasswordButton").on("click", function(){
                handleUserSignin.resetPassword();
            });
        },

        showResendPanel: function(username) {
            var resendMessage = $("<p id='#resendMailMessage'>Twoje konto jest niezweryfikowane. " +
                "Przejdź na skrzynkę mailową w celu weryfikacji</p>");

            $("<a id='resendMail' style='cursor:pointer'> Wyślij ponownie</a>").appendTo(resendMessage);
            resendMessage.appendTo('#ErrorLog');
            $("#resendMail").on('click', function() {
                handleUserSignin.resend(username);
            });
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

                    case "gisExpert":
                        // Update the calling app
                        handleUserSignin.statusCallback(handleUserSignin.notificationSignOut);

                        // Log the user out of the app
                        handleUserSignin.gisExpertSignOut(true);
                        break;
                }
            }
            handleUserSignin.currentProvider = "none";
        },

        loginFormSubmit: function () {
            var email = $("#email").val();
            var password = $("#password").val();
            if(email==='' || password===''){
                splash.clearMessages();
                splash.showError("Pola nie mogą być puste");
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
                        handleUserSignin.loggedIn = true;
                        handleUserSignin.currentProvider = "gisExpert";
                        handleUserSignin.user = {
                            name: data.firstname+" "+data.lastname,
                            id: data.token,
                            org: "gisExpert",
                            canSubmit: true
                        };

                        // Update the calling app
                        tokenUtil.setCookie("token", data.token, 4);
                        handleUserSignin.statusCallback(handleUserSignin.notificationSignIn);
                    }),
                    error: (function (xhr, ajaxOptions, thrownError) {
                        splash.clearMessages();
                        if (xhr.responseJSON.message === 'UNCONFIRMED')
                            handleUserSignin.showResendPanel(email);
                        else
                            splash.showError(xhr.responseJSON.message);
                    })
                })
        },

        resetPassword: function () {
            var email = $("#email").val();
            if(email===''){
                splash.clearMessages();
                splash.showError("Pole nie może być puste");
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
                        splash.clearMessages();
                        splash.showSuccess(data.message);
                    }),
                    error: (function (xhr, ajaxOptions, thrownError) {
                        splash.clearMessages();
                        splash.showError(JSON.parse(xhr.responseText).message);
                    })
                })
        },

        changePassword: function (token) {
            var passwordConfirm = $("#passwordConfirm").val();
            var password = $("#password").val();
            if(passwordConfirm===undefined || confirm===undefined || passwordConfirm==='' || confirm===''){
                splash.clearMessages();
                splash.showError("Pola nie mogą być puste");
            }
            if((password.length) < 6){
                splash.clearMessages();
                splash.showError("Hasło powinno zawierać co najmniej 6 znaków");
            }
            else if(passwordConfirm!==password){
                splash.clearMessages();
                splash.showError("Podane hasła nie są zgodne");
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
                        splash.clearMessages();
                        splash.showSuccess(data.message);
                    }),
                    error: (function (xhr, ajaxOptions, thrownError) {
                        console.log(xhr);
                        splash.clearMessages();
                        splash.showError(JSON.parse(xhr.responseText).message);
                    })
                })
        },

        gisExpertSignOut: function(){
            $.ajax({
                url: "http://localhost:8080/geoanalityka-web/rest/auth/logout",
                type: "GET",
                success: (function (data) {
                    console.log(data);
                }),
                error: (function (xhr, ajaxOptions, thrownError) {
                    console.log(xhr);
                })
            })
        },

        resend: function(data) {
            $.ajax({
                url: 'http://localhost:8080/geoanalityka-web/rest/auth/resendMail',
                type: 'POST',
                contentType: "application/json",
                dataType: 'json',
                success: (function(data) {
                    splash.clearMessages();
                }),
                error: (function(xhr, ajaxOptions, thrownError) {
                    splash.clearMessages();
                    splash.showError(JSON.parse(xhr.responseText).message);
                }),
                data: data
            });
        }
    };
    return handleUserSignin;
    //----------------------------------------------------------------------------------------------------------------//
});