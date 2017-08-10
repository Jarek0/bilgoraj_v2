function register() {
  var data = collectData();
  console.log(data);
  data.captcha=grecaptcha.getResponse();
  if (data)
    $.ajax({
      url: 'http://localhost:8080/geoanalityka-web/rest/auth/register',
      type: 'POST',
      contentType: "application/json",
      dataType: 'json',
        success: (function (data) {
            console.log(data);
        }),
        error: (function (xhr, ajaxOptions, thrownError) {
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
  if (name.match(pattern)) {
    var jsonString = getSurname();
    if (jsonString) {
      var firstName = { "name": name };
      jsonString.firstname = name;
      return jsonString;
    } else
      return false;
  } else {
    error.innerHTML = 'Wypełnij to pole imieniem zaczynającym się z wielkiej litery';
    return false;
  }
}

function getSurname() {
  var error = document.getElementById('lastnameError');
  error.innerHTML = '';
  var lastNameField = document.getElementById('lastname');
  var name = lastNameField.value;
  var pattern = new RegExp(lastNameField.pattern);
  if (name.match(pattern)) {
    var jsonString = getMail();
    if (jsonString) {
      var lastName = { "lastName": name };
      jsonString.lastname = name;
      return jsonString;
    } else
      return false;
  } else {

    error.innerHTML = 'Wypełnij to pole nazwiskiem zaczynającym się z wielkiej litery';
    return false;
  }
}

function getMail() {
  var error = document.getElementById('emailError');
  error.innerHTML = '';
  var mailField = document.getElementById('email');
  var mail = mailField.value;
  var pattern = new RegExp(mailField.pattern);
  if (mail.match(pattern)) {
    var jsonString = getPass();
    if (jsonString) {
      jsonString.username = mail;
      return jsonString;
    }
  } else {

    error.innerHTML = 'Wypełnij to pole mailem na przykład: "przykladowy@email.pl"';
    return false;
  }
}

function getPass() {
  var field1 = document.getElementById('passwordError');
  var field2 = document.getElementById('confirmError');
  field2.innerHTML = '';
  field1.innerHTML = '';
  var pass1 = document.getElementById('password').value;
  var pass2 = document.getElementById('password-confirm').value;
  if (pass1.length >= 6) {
    if (pass1 == pass2) {
      var jsonString = getStreet();
      if (jsonString) {
        jsonString.password = pass1;
        jsonString.confirmPassword = pass2;
        return jsonString;
      } else
        return false;
    } else {

      field2.innerHTML = 'Hasła nie pokrywają się';
    }
  } else {

    field1.innerHTML = 'Hasło powinno zawierać co najmniej 6 znaków';
    return false;
  }
}

function getStreet() {
  var error = document.getElementById('streetError');
  error.innerHTML = '';
  var streetField = document.getElementById('address-street');
  var street = streetField.value;
  var pattern = new RegExp(streetField.pattern);
  if (street.match(pattern)) {
    var jsonString = getNumber();
    if (jsonString) {
      jsonString.address.street = street;
      return jsonString;
    } else
      return false;
  } else {
    error.innerHTML = 'Podaj nazwę ulicy zaczynającej się od wielkiej litery';
    return false;
  }
}

function getNumber() {
  var error = document.getElementById('buildingNumberError');
  error.innerHTML = '';
  var number = parseInt(document.getElementById('address-number').value);
  if (!isNaN(number) && number > 0) {
    var jsonString = getOffice();
    if (jsonString) {
      jsonString.address.buildingNumber = number;
      return jsonString;
    } else
      return false;
  } else {
    error.innerHTML = 'podaj liczbę';
    return false;
  }
}

function getOffice() {
  var office = document.getElementById('address-office').value;
  var jsonString = getZip();
  if (jsonString) {
    if (office)
      jsonString.address.flatNumber = office;
    return jsonString;
  } else
    return false;
}

function getZip() {
  var error = document.getElementById('zipError');
  error.innerHTML = '';
  var zipField = document.getElementById('address-zip');
  var zip = zipField.value;
  var pattern = new RegExp(zipField.pattern);
  if (zip.match(pattern)) {
    var jsonString = getCity();
    if (jsonString) {
      jsonString.address.zipCode = zip;
      return jsonString;
    } else
      return false;
  } else {
    error.innerHTML = 'Podaj kod pocztowy w formacie jak w przykładzie "22-222"';
    return false;
  }
}

function getCity() {
  var error = document.getElementById('cityNameError');
  error.innerHTML = '';
  var cityField = document.getElementById('address-city');
  var city = cityField.value;
  var pattern = new RegExp(cityField.pattern);
  if (city.match(pattern)) {
    var jsonString = getPhone();
    if (jsonString) {
      jsonString.address.city = city;
      return jsonString;
    } else
      return false;
  } else {
    error.innerHTML = 'Podaj nazwę miejscowości zaczynjącą się od wielkiej litery';
    return false;
  }
}

function getPhone() {
    var error = document.getElementById('phoneNumberError');
    error.innerHTML = '';
  var phoneField = document.getElementById('address-phone');
  phone = phoneField.value;
  pattern = phoneField.pattern;
  if (phone.match(pattern)) {
    var jsonString = {};
    var address = {
      "phone": phone
    };
    jsonString.address = address;
    return jsonString;
  } else {
    error.innerHTML = 'Wpisz poprawny numer telefonu';
    return false;
  }
}
