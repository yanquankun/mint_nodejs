module.exports = {
    init: function () {
        this.code = 200;
        this.msg = 'success';
    },
    code: Number | String,
    msg: String,
    data: String | Array | Object
}