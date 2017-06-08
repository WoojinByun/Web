$(document).ready(function(){
});

$('.imgCover').click(function(){
  d = new Date();
  var imgSrc = $('img', this).attr('src').split('?')[0];
  $('img', this).attr('src', "/rasp/attTest.jpg?" + d.getTime());
});
