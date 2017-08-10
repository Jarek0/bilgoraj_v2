function register() {
  var data = collectData();
  console.log(data);
  data.captcha = grecaptcha.getResponse();
  if (data)
    $.ajax({
      url: 'http://localhost:8080/geoanalityka-web/rest/auth/register',
      type: 'POST',
      contentType: "application/json",
      dataType: 'json',
      success: (function(data) {
        this.props.setPage(data);
      }).bind(this),

      success: (function(data) {
        alert("Udało się zarejestrować. Prosimy zweryfikować adres e-mail.");
        console.log(data);
        var link = document.createElement('a');
        link.href = 'sukces.html';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }),
      error: (function(xhr, ajaxOptions, thrownError) {
        console.log(xhr);
      }),

      data: JSON.stringify(data)
    });
  else return;
}

function collectData() {
  var error = document.getElementById('firstnameError');
  error.innerHTML = '';
  var nameField = document.getElementById('firstname');
  var name = nameField.value;
  var pattern = new RegExp(nameField.pattern);
  var jsonString = getSurname();
  if (name.match(pattern) && name.length <= 30) {

    if (jsonString) {
      var firstName = { "name": name };
      jsonString.firstname = name;
      return jsonString;
    } else
      return false;
  } else {
    error.innerHTML = 'Imię powinno zaczynać się z wielkiej litery, mieć jedną dużą literę i co najmniej jedną małą oraz być krótsze od 30 znaków';
    return false;
  }
}

function getSurname() {
  var error = document.getElementById('lastnameError');
  error.innerHTML = '';
  var lastNameField = document.getElementById('lastname');
  var name = lastNameField.value;
  var pattern = new RegExp(lastNameField.pattern);
  var jsonString = getMail();
  if (name.match(pattern) && name.length <= 30) {

    if (jsonString) {
      var lastName = { "lastName": name };
      jsonString.lastname = name;
      return jsonString;
    } else
      return false;
  } else {

    error.innerHTML = 'Nazwisko powinno zaczynać się z wielkiej litery, mieć jedną dużą literę i co najmniej jedną małą oraz być krótsze od 30 znaków';
    return false;
  }
}

function getMail() {
  var error = document.getElementById('emailError');
  error.innerHTML = '';
  var mailField = document.getElementById('email');
  var mail = mailField.value;
  var pattern = new RegExp(mailField.pattern);
  var jsonString = getPass();
  if (mail.match(pattern)) {

    if (jsonString) {
      jsonString.username = mail;
      return jsonString;

      var data = collectData();
      var errors = validateData(data);
      if (!isEmptyObject(errors)) {
        showErrors(errors)
      } else {
        sendRequest(data);
      }
    }
  }
}

function collectData() {
  return {
    firstname: document.getElementById('firstname'),
    lastname: document.getElementById('lastname'),
    username: document.getElementById('email'),
    password: document.getElementById('password'),
    confirmPassword: document.getElementById('password-confirm'),
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
  if (!(data.firstname.value).match(data.firstname.pattern)) {
    errors.firstname = 'Imię musi zaczynać się z wielkiej litery i mieć co najmniej 3 znaki'
  }
  if (!(data.lastname.value).match(data.lastname.pattern)) {
    errors.lastname = 'Nazwisko musi zaczynać się z wielkiej litery i mieć co najmniej 3 znaki'
  }
  if ((data.password.value.length) < 6) {
    errors.password = 'Hasło powinno zawierać co najmniej 6 znaków'
  } else if (data.password.value !== data.confirmPassword.value) {
    errors.confirmPassword = 'Hasło nie pokrywają się'
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
  if (!(data.address.flatNumber.value).match(data.address.flatNumber.pattern)) {
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

function showErrors(errors) {
  Object.keys(errors).map(function(key, index) {
    document.getElementById(key + 'Error').innerHTML = errors[key];
  });
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
      console.log(data);
    }),
    error: (function(xhr, ajaxOptions, thrownError) {
      console.log(xhr);
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
