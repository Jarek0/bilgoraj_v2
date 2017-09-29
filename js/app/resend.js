function resend() {
  var data = validate();
  if(data)
  $.ajax({
    url: 'http://ankieta-test-backend.gis-expert.pl/ankieta-web/rest/auth/resendMail',
    type: 'POST',
    contentType: "application/json",
    dataType: 'json',
    success: (function(data) {
      console.log(data);
    }),
    error: (function(xhr, ajaxOptions, thrownError) {
      console.log(xhr);
      document.getElementById('error').innerHTML = 'Konto o podanym e-mailu nie istnieje';
    }),
    data: data
  });
}

function validate() {
  var login = document.getElementById('login');
  if (!(login.value).match(login.pattern)) {
    document.getElementById('error').innerHTML = 'Email ma nieprawidłowy format';
    return false;
  } else
    return login.value;
  
}
