$(document).ready(function(){
  $('#timetable .isData').each(function(){
    $(this).click(function(){
      location.href = '/attend/' + $(this).attr('courseNum');
    })
  })
});
