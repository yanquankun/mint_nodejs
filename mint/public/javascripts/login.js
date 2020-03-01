function Ajax(json) {
    var url = json.url;
    var method = json.method;
    var success = json.success;
    var formData = json.formData;
    var request = null;
    if (window.XMLHttpRequest) {
      request = new XMLHttpRequest();
    } else {
      try {
        request = new ActiveObject('Microsoft.XMLHTTP');
      }
      catch (faild) {
        alert('Error:Ajax request faild');
      }
    }
    if (request != null) {
      request.onreadystatechange = function () {
        if (request.readyState == 4 && request.status == 200) {
          var text = request.responseText;
          success(text);
        } else {
        }
      }
      request.open(method, url, true);
      request.send(formData);
    }
  }
  function login() {
    Ajax({
      url: '/getuser',
      method: 'get',
      success: function (text) {
        var data = JSON.parse(text);
        document.getElementById('name').value = data.data[0].username;
        document.getElementById('password').value =  data.data[0].password;
      }
    })
  }