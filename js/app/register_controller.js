define(['app/splash'],
    function (splash) {
        var register_controller={
            show: function(conteiner){
                conteiner.empty();
                register_controller._loadCSS("css/register.css");
                conteiner.loadTemplate("js/app/register.html", {
                },{
                    prepend: true,
                    complete: function () {
                        $("#registerPage").fadeIn();
                        $('#registerButton').on('click', function() {
                            register_controller.clearErrorsFields();
                            register_controller.register();
                        });
                        $('#comeBackButton').on('click',function(){
                            $.publish('register-stop');
                        });
                    }
                });
            },


            hide: function () {

            },

            _loadCSS: function (url) {
                var stylesheet = document.createElement("link");
                stylesheet.href = url;
                stylesheet.rel = "stylesheet";
                stylesheet.type = "text/css";
                document.getElementsByTagName("head")[0].appendChild(stylesheet);
            },

            register: function(){var data = register_controller.collectData();

                var errors = register_controller.validateData(data);
                if (!register_controller.isEmptyObject(errors)) {
                    register_controller.showValidationErrors(errors)
                } else {
                    register_controller.sendRequest(data);
                    grecaptcha.reset();
                }},

            clearErrorsFields: function(){
                document.getElementById('passwordError').innerHTML="";
                document.getElementById('serverError').innerHTML="";
                document.getElementById('firstnameError').innerHTML="";
                document.getElementById('lastnameError').innerHTML="";
                document.getElementById('usernameError').innerHTML="";
                document.getElementById('confirmPasswordError').innerHTML="";
                document.getElementById('buildingNumberError').innerHTML="";
                document.getElementById('flatNumberError').innerHTML="";
                document.getElementById('zipCodeError').innerHTML="";
                document.getElementById('streetError').innerHTML="";
                document.getElementById('cityError').innerHTML="";
                document.getElementById('phoneError').innerHTML="";
                document.getElementById('captchaError').innerHTML="";

            },

            collectData: function() {
                return {
                    firstname: document.getElementById('firstname'),
                    lastname: document.getElementById('lastname'),
                    username: document.getElementById('email'),
                    password: document.getElementById('password'),
                    confirmPassword: document.getElementById('password-confirm'),
                    captcha: grecaptcha.getResponse(),
                    address: {
                        street: document.getElementById('address-street'),
                        phone: document.getElementById('address-phone'),
                        buildingNumber: document.getElementById('address-number'),
                        flatNumber: document.getElementById('address-office'),
                        zipCode: document.getElementById('address-zip'),
                        city: document.getElementById('address-city')
                    }
                };
            },

            validateData: function(data) {
                var errors = {};
                if (data.captcha === undefined || data.captcha === '') {
                    errors.captcha = 'Nie przeszedłeś ochrony anty botowej'
                }
                if (!(data.firstname.value).match(data.firstname.pattern)) {
                    errors.firstname = 'Imię musi zaczynać się z wielkiej litery i mieć co najmniej 3 znaki'
                }
                if (!(data.lastname.value).match(data.lastname.pattern)) {
                    errors.lastname = 'Nazwisko musi zaczynać się z wielkiej litery i mieć co najmniej 3 znaki'
                }
                if ((data.password.value.length) < 6) {
                    errors.password = 'Hasło powinno zawierać co najmniej 6 znaków'
                } else if (data.password.value !== data.confirmPassword.value) {
                    errors.confirmPassword = 'Hasła nie pokrywają się'
                }
                if (!(data.username.value).match(data.username.pattern)) {
                    errors.username = 'Email ma nieprawidłowy format'
                }
                if (!(data.address.phone.value).match(data.address.phone.pattern)) {
                    errors.phone = 'Number telefonu ma nieprawidłowy format'
                }
                if (!(data.address.street.value).match(data.address.street.pattern)) {
                    errors.street = 'Nazwa ulicy musi zaczynać się z wielkiej litery i mieć co najmniej 3 znaki'
                }
                if (!(data.address.buildingNumber.value).match(data.address.buildingNumber.pattern)) {
                    errors.buildingNumber = 'Numer budynku ma nieprawidłowy format'
                }
                if (data.address.flatNumber.value !=='' && !(data.address.flatNumber.value).match(data.address.flatNumber.pattern)) {
                    errors.flatNumber = 'Numer lokalu ma nieprawidłowy format'
                }
                if (!(data.address.zipCode.value).match(data.address.zipCode.pattern)) {
                    errors.zipCode = 'Kod pocztowy ma nieprawidłowy format'
                }
                if (!(data.address.city.value).match(data.address.city.pattern)) {
                    errors.city = 'Nazwa miasta musi zaczynać się z wielkiej litery i mieć co najmniej 3 znaki'
                }
                return errors;
            },

            showValidationErrors: function(errors) {
                Object.keys(errors).map(function(key, index) {
                  console.log(key);
                    document.getElementById(key + 'Error').innerHTML = errors[key];
                });
            },

            showServerError: function(error){
                document.getElementById('serverError').innerHTML = error;
            },

            sendRequest: function(validatedData) {
                var data = {
                    captcha: grecaptcha.getResponse(),
                    firstname: validatedData.firstname.value,
                    lastname: validatedData.lastname.value,
                    username: validatedData.username.value,
                    password: validatedData.password.value,
                    confirmPassword: validatedData.confirmPassword.value,
                    address: {
                        street: validatedData.address.street.value,
                        phone: validatedData.address.phone.value,
                        buildingNumber: validatedData.address.buildingNumber.value,
                        flatNumber: validatedData.address.flatNumber.value,
                        zipCode: validatedData.address.zipCode.value,
                        city: validatedData.address.city.value
                    }
                };

                $.ajax({
                    url: 'http://ankieta-test-backend.gis-expert.pl/ankieta-web/rest/auth/register',
                    type: 'POST',
                    contentType: "application/json",
                    dataType: 'json',
                    success: (function(data) {
                        $.publish('register-success');
                    }),
                    error: (function(xhr, ajaxOptions, thrownError) {
                        console.log(xhr);
                        try{
                            if(xhr.statusText.toLocaleLowerCase()==='bad request')
                                register_controller.showValidationErrors(JSON.parse(JSON.parse(xhr.responseText).message));
                            else{
                                if(xhr.responseText===undefined)
                                    register_controller.showServerError("Błąd połączenia z serwerem");
                                else
                                    register_controller.showServerError(JSON.parse(xhr.responseText).message);
                            }
                        }
                        catch(e){
                            register_controller.showServerError("Nastąpił niezidentyfikowany błąd. Prosimy o kontakt z administracją");
                        }
                    }),
                    data: JSON.stringify(data)
                });
            },

            isEmptyObject: function(obj) {
                for (var prop in obj) {
                    if (Object.prototype.hasOwnProperty.call(obj, prop)) {
                        return false;
                    }
                }
                return true;
            }
        };
        return register_controller;

    });
