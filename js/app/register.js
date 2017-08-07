function register() {
  var data = collectData();
  console.log(data);
  if(data)
  $.ajax({
    url: '',
    type: 'POST',
    contentType: "application/json",
    dataType: 'json',
    success: (function(data) {
      this.props.setPage(data);
    }).bind(this),
    error: (function(xhr, ajaxOptions, thrownError) {
      this.props.showMessageBox({
        isShown: true,
        messageText: xhr.responseText,
        messageType: "alert-danger"
      });
    }).bind(this),
    data: JSON.stringify(data)
  });
else return;
}

function collectData() {
  var nameField = document.getElementById('firstname');
  var name = nameField.value;
  var pattern = nameField.pattern;
  if (name != '' && name.match('pattern')) {
    var jsonString = getSurname();
    if (jsonString) {
      var firstName = { "firstname": name };
      jsonString.push(firstName);
      return jsonString;
    }
  } else
    return false;
}

function getSurname() {
  var name = document.getElementById('lastname').value;
  if (name != '') {
    var jsonString = getMail();
    if (jsonString) {
      var lastName = { "lastName": name };
      jsonString.push(lastName);
      return jsonString;
    }
  } else
    return false;
}

function getMail() {
  var eMail = document.getElementById('email').value;
  if (eMail != '') {
    var jsonString = getPass();
    if (jsonString) {
      var email = { "email": eMail };
      jsonString.push(email);
      return jsonString;
    }
  } else
    return false;
}

function getPass() {
  var pass1 = document.getElementById('password').value;
  var pass2 = document.getElementById('password-confirm').value;
  if (pass1 != '' && pass2 != '' && pass1 == pass2) {
    var jsonString = getStreet();
    if (jsonString) {
      var pass1 = { "password": pass1 };
      jsonString.push(pass1);
        var pass2 = { "password-confirm": pass2 };
        jsonString.push(pass2);
      return jsonString;
    }
  } else
    return false;
}

function getStreet() {
  var street = document.getElementById('address-street').value;
  if (street != '') {
    var jsonString = getNumber();
    if (jsonString) {
      var streetName = { "street": street };
      jsonString.push(streetName);
      return jsonString;
    }
  } else
    return false;
}

function getNumber() {
  var number = document.getElementById('address-number').value;
  if (number != '') {
    var jsonString = getOffice();
    if (jsonString) {
      var buildingNumber = { "buildingNumber": number };
      jsonString.push(buildingNumber);
      return jsonString;
    }
  } else
    return false;
}

function getOffice() {
  var office = document.getElementById('address-office').value;
  if (office != '') {
    var jsonString = getZip();
    if (jsonString) {
      var officeNumber = { "flatNumber": office };
      jsonString.push(officeNumber);
      return jsonString;
    }
  } else
    return false;
}
function getZip() {
  var zip = document.getElementById('address-zip').value;
  if (zip != '') {
    var jsonString = getCity();
    if (jsonString) {
      var zipCode = { "zipCode": zip };
      jsonString.push(zipCode);
      return jsonString;
    }
  } else
    return false;
}
function getCity() {
  var city = document.getElementById('address-city').value;
  if (city != '') {
    var jsonString = getPhone();
    if (jsonString) {
      var cityName = { "city": city };
      jsonString.push(cityName);
      return jsonString;
    }
  } else
    return false;
}
function getPhone() {
  var phone = document.getElementById('address-phone').value;
  if (phone != '') {
    var jsonString = [];
      var phoneNumber = { "phone": phone };
      jsonString.push(phoneNumber);
      return jsonString;
  } else
    return false;
}