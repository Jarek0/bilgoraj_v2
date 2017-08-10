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
      success: (function(data) {
        this.props.setPage(data);
      }).bind(this),
      error: (function(xhr, ajaxOptions, thrownError) {
        console.log(xhr);
        console.log(ajaxOptions);
        console.log(thrownError);
        this.props.showMessageBox({
          isShown: true,
          messageText: xhr.responseText,
          messageType: "alert-danger"
        });
      }).bind(this),

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
  var jsonString = getSurname();
  if (name.match(pattern) && name.length<= 30) {
    
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
  if (name.match(pattern) && name.length<= 30) {
    
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
  var jsonString = getStreet();
  if (pass1.length >= 6) {
    if (pass1 == pass2) {
      
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
  var jsonString = getNumber();
  if (street.match(pattern) && street.length <=30) {
    
    if (jsonString) {
      jsonString.address.street = street;
      return jsonString;
    } else
      return false;
  } else {
    error.innerHTML = 'Podaj nazwę ulicy zaczynającej się od wielkiej litery nazwa powinna być nie dłuższa niż 30 znaków';
    return false;
  }
}

function getNumber() {
  var error = document.getElementById('buildingNumberError');
  error.innerHTML = '';
  var number = parseInt(document.getElementById('address-number').value);
  var jsonString = getOffice();
  if (!isNaN(number) && number > 0) {
    
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
  var jsonString = getCity();
  if (zip.match(pattern)) {
    
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
  var jsonString = getPhone();
  if (city.match(pattern) && city.length <=30) {
    
    if (jsonString) {
      jsonString.address.city = city;
      return jsonString;
    } else
      return false;
  } else {
    error.innerHTML = 'Podaj nazwę miejscowości zaczynjącą się od wielkiej litery oraz nie dłuższa niż 30 znaków';
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
