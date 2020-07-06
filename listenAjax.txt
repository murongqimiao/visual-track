;(function() {
    function ajaxEventTrigger(event, params) {
     var ajaxEvent = new CustomEvent(event, { detail: this });
     if (!window.currentPageAjaxInfo) {
        window['currentPageAjaxInfo'] = {}
     }
     if (event === 'ajaxLoadEnd') { // 此时具有返回值
           const { target } = params[0]
           const { responseURL, response } = target
           const key = responseURL.split('?')[0].split(location.host)[1]
           const value = JSON.parse(response)
           window.currentPageAjaxInfo[key] = value
           console.log('请求接口与结果的映射', window.currentPageAjaxInfo)
       }
     window.dispatchEvent(ajaxEvent);
    }
    var oldXHR = window.XMLHttpRequest;
    function newXHR() {
     var realXHR = new oldXHR();
     realXHR.addEventListener('loadend', function (...params) { ajaxEventTrigger.call(this, 'ajaxLoadEnd', params); }, false);
     realXHR.addEventListener('readystatechange', function(...params) { ajaxEventTrigger.call(this, 'ajaxReadyStateChange', params); }, false);
     return realXHR;
    }
    window.XMLHttpRequest = newXHR;
   })();