
function register(){
    $.ajax({
        url: '',
        type: 'POST',
        contentType: "application/json",
        dataType: 'json',
        success: (function(data) {
            this.props.setPage(data);
        }).bind(this),
        error: (function (xhr, ajaxOptions, thrownError) {
            this.props.showMessageBox({
                isShown: true,
                messageText: xhr.responseText,
                messageType: "alert-danger"
            });
        }).bind(this),
        data:JSON.stringify(this.props.pageRequest)
    });
}
