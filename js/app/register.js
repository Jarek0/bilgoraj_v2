function register() {
  var data = collectData();
  if (data)
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
  // var pattern =new RegExp(nameField.pattern);
  if (name != '' /*&& name.match('pattern')*/ ) {
    var jsonString = getSurname();
    if (jsonString) {
      var firstName = { "name": name };
      jsonString.firstname = name;
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
      jsonString.lastname = name;
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
      jsonString.email = eMail;
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
      jsonString.password = pass1;
      jsonString.confirmPassword = pass2;
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
      jsonString.address.street = street;
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
      jsonString.address.buildingNumber = number;
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
      jsonString.address.flatNumber = office;
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
      jsonString.address.zipCode = zip;
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
      jsonString.address.city = city;
      return jsonString;
    }
  } else
    return false;
}

function getPhone() {
  var phone = document.getElementById('address-phone').value;
  if (phone != '') {
    var jsonString = {};

    var phoneNumber = { "Phone-number": phone };
    var address = {
      "Phone-number": phone
    };
    jsonString.address = address;
    return jsonString;
  } else
    return false;
}
