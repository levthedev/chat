(function (){
  function addChatLogic (){
    var script = document.createElement("script");
    script.src = './chat.js' // TODO add real src
    script.async = !0
    script.onload = function(){
      __init('') // TODO add real key
    }
    document.getElementsByTagName("head")[0].appendChild(script)
  }
  window.attachEvent ? window.attachEvent("onload", addChatLogic) : window.addEventListener("load", addChatLogic, !1)
})();
