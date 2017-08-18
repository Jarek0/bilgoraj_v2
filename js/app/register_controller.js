define(['js/app/register','js/app/handleUserSignin','js/app/user'], function(register,handleUserSignin, user) {
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
      register_controller.container.loadTemplate('js/app/register.html', {}, {
        prepend: true,
        complete: function() {
          registerControllerReady.resolve();
          $('#registerButton').on('click', function() {
            $.publish('registerUsr');
          });
          $('#comeBackButton').on('click',function(){
          	$(register_controller.container).html("");
          	$(register_controller.container).addClass('smallSidebar');
          	$("link[href='css/register.css']").remove();
          	handleUserSignin.availabilities.guest = true;
          	user.launch(config,splash);
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
