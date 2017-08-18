define(['js/app/register','js/app/handleUserSignin','app/user'], function(register,handleUserSignin, user) {
  "use strict";
  var register_controller;
  register_controller = {
  	config: null,
  	splash: null,
    init: function(_container) {
      $(document.getElementById('splashInfoPanel')).removeClass('smallSidebar');
      register_controller.container = $("#" + _container + "");
      $(register_controller.container).empty();
      var registerControllerReady = $.Deferred();
      register_controller.container.loadTemplate('register.html', {}, {
        prepend: true,
        complete: function() {
          registerControllerReady.resolve();
          $('#registerButton').on('click', function() {
            $.publish('registerUsr');
          });
          $('#comeBackButton').on('click',function(){
          	var link = document.createElement('a');
          	$(link).attr('href', 'index.html');
          	$('body').append(link);
          	link.click();
          	link.remove();      
          });
        }
      })
    },
    emit: function() {
      $.publish('showRegisterPanel');
    }
  }
  return register_controller;
});
