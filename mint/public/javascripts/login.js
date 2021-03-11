if (!window.ajax) document.write("<script src='./javascripts/myAjax.js'></script>");
function login() {
  var username = document.getElementById('username').value;
  var password = document.getElementById('password').value;
  var loginValue = document.getElementById('login').value;
  if (username == "" || password == "") {
    alert('用户名或密码不能为空');
    return;
  }
  if (loginValue == '登录') {
    ajax({
      url: '/user/loginUser',
      type: 'GET',
      data: {
        username: username,
        password: password
      },
      dataType: 'json',
      contentType: "application/json",
      success: function (text) {
        var data = JSON.parse(text);
        if (data.code == 200) alert(data.msg);
        else alert(data.msg);
      },
      //异常处理
      error: function (e) {
        console.log(e);
      }
    })
  } else if (loginValue == '注册') {
    ajax({
      url: '/user/regis',
      type: 'GET',
      data: {
        username: username,
        password: password
      },
      dataType: 'json',
      contentType: "application/json",
      success: function (res) {
        var data = JSON.parse(res);
        alert(data.msg);
        document.getElementById('username').value = "";
        document.getElementById('password').value = "";
      },
      //异常处理
      error: function (e) {
        console.log(e);
      }
    })
  }
}