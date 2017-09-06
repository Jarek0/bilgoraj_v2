
define([], function (){
    var adBlockTester = {
        testAdBlock: function(){
            var testAd = document.createElement('div');
            testAd.innerHTML = '&nbsp;';
            testAd.className = 'adsbox';
            document.body.appendChild(testAd);
            if (testAd.offsetHeight === 0) {
                testAd.remove();
                return true;
            }
            return false;

        }
    };

    return adBlockTester;
});