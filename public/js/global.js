function add_comment(token,source_type,source_id,content,to_user_id){
    var postData = {_token:token,source_id:source_id,source_type:source_type,content:content};
    if(to_user_id>0){
        postData.to_user_id = to_user_id;
    }
    $.post('/comment/store',postData,function(html){
        $("#comments-"+source_type+"-"+source_id+" .widget-comment-list").append(html);
        $("#comment-"+source_type+"-content-"+source_id).val('');
    });
}


function load_comments(source_type,source_id){
    $.get('/'+source_type+'/'+source_id+'/comments',function(html){
        $("#comments-"+source_type+"-"+source_id+" .widget-comment-list").append(html);
    });
}

function clear_comments(source_type,source_id){
    $("#comments-"+source_type+"-"+source_id+" .widget-comment-list").empty();
}

/**
 * 编辑器图片图片文件方式上传
 * @param file
 * @param editor
 * @param welEditable
 */
function upload_editor_image(file,editorId){
    data = new FormData();
    data.append("file", file);
    $.ajax({
        data: data,
        type: "POST",
        dataType : 'text',
        url: "/image/upload",
        cache: false,
        contentType: false,
        processData: false,
        success: function(url) {
            console.log(url)
            if(url == 'error'){
                alert('图片上传失败！');
                return false;
            }
            $('#'+editorId).summernote('insertImage', url, function ($image) {
                $image.css('width', $image.width() / 2);
                $image.addClass('img-responsive');
            });
        },
        error:function(){
            alert('图片上传失败，请压缩图片大小再进行上传 :)');
        }
    });
}
