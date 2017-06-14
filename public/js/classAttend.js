$(document).ready(function(){
});

$('.imgCover').click(function(){
  d = new Date();
  var target = $('img:first', this);
  var imgSrc = $(target).attr('src').split('?')[0];
  $(target)
    .addClass('hidden')
    .attr('src', "/rasp/attTest.jpg?" + d.getTime())
    .load(function(){
      $(this).removeClass('hidden')
             .blur();
  })

});
