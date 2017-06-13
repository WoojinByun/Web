$(function(){
  var $_GET = {};
  document.location.search.replace(/\??(?:([^=]+)=([^&]*)&?)/g, function () {
    function decode(s) {
      return decodeURIComponent(s.split("+").join(" "));
    }
    $_GET[decode(arguments[1])] = decode(arguments[2]);
  });
  if($_GET["msg"])
    alert($_GET["msg"]);

  $('.menuButton').click(function(){
    window.scrollTo(0,0);
  });

})
