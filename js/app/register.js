$.subscribe('registerUsr', function() {
  var data = collectData();

  var errors = validateData(data);
  if (!isEmptyObject(errors)) {
      showValidationErrors(errors)
  } else {
    sendRequest(data);
    clearErrorsFields();
  }
});

function clearErrorsFields(){
    document.getElementById('firstnameError').innerHTML="";
    document.getElementById('lastnameError').innerHTML="";
    document.getElementById('usernameError').innerHTML="";
    document.getElementById('confirmPasswordError').innerHTML="";
    document.getElementById('buildingNumberError').innerHTML="";
    document.getElementById('flatNumberError').innerHTML="";
    document.getElementById('zipCodeError').innerHTML="";
    document.getElementById('streetError').innerHTML="";
    document.getElementById('cityError').innerHTML="";
    document.getElementById('captchaError').innerHTML="";
    grecaptcha.reset();
}

function collectData() {
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
}

function validateData(data) {
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
  if (data.address.flatNumber.value != '' && !(data.address.flatNumber.value).match(data.address.flatNumber.pattern)) {
    errors.flatNumber = 'Numer lokalu ma nieprawidłowy format'
  }
  if (!(data.address.zipCode.value).match(data.address.zipCode.pattern)) {
    errors.zipCode = 'Kod pocztowy ma nieprawidłowy format'
  }
  if (!(data.address.city.value).match(data.address.city.pattern)) {
    errors.city = 'Nazwa miasta musi zaczynać się z wielkiej litery i mieć co najmniej 3 znaki'
  }
  return errors;
}

function showValidationErrors(errors) {
  Object.keys(errors).map(function(key, index) {
    document.getElementById(key + 'Error').innerHTML = errors[key];
  });
}

function showServerError(error){
    document.getElementById('serverError').innerHTML = error;
}

function sendRequest(validatedData) {
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
  console.log(data);
  $.ajax({
    url: 'http://localhost:8080/geoanalityka-web/rest/auth/register',
    type: 'POST',
    contentType: "application/json",
    dataType: 'json',
    success: (function(data) {
      alert('Rejestracja konta ' + data.message + ' powiodła się!');
      console.log(data);
    }),
    error: (function(xhr, ajaxOptions, thrownError) {
      console.log(xhr);
        if(xhr.statusText.toLocaleLowerCase()==='internal server error')
            showServerError(JSON.parse(xhr.responseText).message);
        else
            showValidationErrors(JSON.parse(JSON.parse(xhr.responseText).message))
    }),
    data: JSON.stringify(data)
  });
}

function isEmptyObject(obj) {
  for (var prop in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, prop)) {
      return false;
    }
  }
  return true;
}
