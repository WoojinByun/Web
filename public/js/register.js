$(".upload-file").filestyle();
function noPreview() {
  $('#preview-img').attr('src', 'noimage.jpg');
}

function selectImage(e) {
  $('.upload-file').css("color", "green");
  $('.preview-img').attr('src', e.target.result);
  $('.preview-img').css('width', '100%');
}

$(document).ready(function (e) {

  var maxsize = 5 * 1024 * 1024; // 5 MB

  $('#max-size').html((maxsize/1024).toFixed(2));
  //
  // $('#upload-image-form').on('submit', function(e) {
  //
  //   e.preventDefault();
  //
  //   $('#message').empty();
  //   $('#loading').show();
  //
  //   $.ajax({
  //     url: "/register/upload",
  //     type: "POST",
  //     data: new FormData(this),
  //     contentType: false,
  //     cache: false,
  //     processData: false,
  //     success: function(data)
  //     {
  //       $('#loading').hide();
  //       $('#message').html(data);
  //     }
  //   });
  //
  // });

  $(document).on('change','.upload-file',function() {
    $('#message').empty();

    var file = this.files[0];
    var match = ["image/jpeg", "image/png", "image/jpg"];

    if ( !( (file.type == match[0]) || (file.type == match[1]) || (file.type == match[2]) ) )
    {
      noPreview();

      $('#message').html('<div class="alert alert-warning" role="alert">Unvalid image format. Allowed formats: JPG, JPEG, PNG.</div>');

      return false;
    }

    if ( file.size > maxsize )
    {
      noPreview();

      $('#message').html('<div class=\"alert alert-danger\" role=\"alert\">The size of image you are attempting to upload is ' + (file.size/1024).toFixed(2) + ' KB, maximum size allowed is ' + (maxsize/1024).toFixed(2) + ' KB</div>');

      return false;
    }

    var reader = new FileReader();
    reader.onload = selectImage;
    reader.readAsDataURL(file);

  });

});
