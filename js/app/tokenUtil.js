define([],
    function () {
        var tokenUtil;
        tokenUtil={
            setCookie : function(name, content, exhours) {
            exhours = exhours || 3;
            var d = new Date();
            d.setTime(d.getTime() + (exhours * 60 * 60 * 1000));
            var expires = 'expires=' + d.toUTCString();
            document.cookie = name + '=' + encodeURIComponent(content) + '; ' + expires +
                "; path=/";
        },

            setShortLivingCookie : function(name, content, seconds) {
                var d = new Date();
                d.setTime(d.getTime() + (seconds)*1000);
                var expires = 'expires=' + d.toUTCString();
                document.cookie = name + '=' + encodeURIComponent(content) + '; ' + expires +
                    "; path=/";
            },

            eraseCookie :function(name){
                this.setCookie(name,"",-1);
        },

            getCookie : function(cname) {
                var name = cname + '=';
                var ca = document.cookie.split(';');
                for (var i = 0; i < ca.length; i++) {
                    var c = ca[i];
                    while (c.charAt(0) === ' ') c = c.substring(1);
                    if (c.indexOf(name) !== -1) return decodeURIComponent(c.substring(
                        name.length, c.length));
                }
                return '';
            },

            getAllUrlParams: function (url) {

            var queryString = url ? url.split('?')[1] : window.location.search.slice(1);
            var obj = {};

            if (queryString) {
                queryString = queryString.split('#')[0];
                var arr = queryString.split('&');

                for (var i=0; i<arr.length; i++) {
                    var a = arr[i].split('=');
                    var paramNum = undefined;
                    var paramName = a[0].replace(/\[\d*\]/, function(v) {
                        paramNum = v.slice(1,-1);
                        return '';
                    });

                    var paramValue = typeof(a[1])==='undefined' ? true : a[1];
                    paramName = paramName.toLowerCase();
                    paramValue = paramValue.toLowerCase();

                    if (obj[paramName]) {
                        if (typeof obj[paramName] === 'string') {
                            obj[paramName] = [obj[paramName]];
                        }
                        if (typeof paramNum === 'undefined') {
                            obj[paramName].push(paramValue);
                        }
                        else {
                            obj[paramName][paramNum] = paramValue;
                        }
                    }
                    else {
                        obj[paramName] = paramValue;
                    }
                }
            }

            return obj;
        },

            removeURLParameter: function (url, parameter) {
            //prefer to use l.search if you have a location/link object
            var urlparts= url.split('?');
            if (urlparts.length>=2) {

                var prefix= encodeURIComponent(parameter)+'=';
                var pars= urlparts[1].split(/[&;]/g);

                //reverse iteration as may be destructive
                for (var i= pars.length; i-- > 0;) {
                    //idiom for string.startsWith
                    if (pars[i].lastIndexOf(prefix, 0) !== -1) {
                        pars.splice(i, 1);
                    }
                }

                url= urlparts[0] + (pars.length > 0 ? '?' + pars.join('&') : "");
                return url;
            } else {
                return url;
            }
        },
            eraseCookie :function(name){
                this.setCookie(name,"",-1);
            }
        };
        return tokenUtil;
});


