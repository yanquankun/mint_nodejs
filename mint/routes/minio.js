var express = require('express');
const app = express();
var router = express.Router();
var db = require("../db/mysql"); //引入数据库封装模块
var dbConfig = require('../db/db.config');
var guid = require('../public/javascripts/guid.js');
var Minio = require('minio');
var util = require("util");
var querystring = require('querystring');
var Fs = require('fs');
var stream = require('stream');
const formidable = require('formidable');
var minioClient = new Minio.Client({
    endPoint: '39.97.119.181',
    port: 9300,
    useSSL: false,
    accessKey: 'mint',
    secretKey: 'yqk229218087'
});
var resBody = require('../db/response.body');
const e = require('express');
// 获取minio bucket集合
router.get('/bucketList', function (req, res) {
    resBody.init();
    resBody.code = res.statusCode;
    minioClient.listBuckets(function (e, buckets) {
        if (e) {
            res.msg = e;
        } else {
            resBody.data = buckets;
        }
        res.send(resBody);
    })
})
// 通过用户id获取桶内资源
/***
 * params {String userId 用户guid}
*/
router.post('/getSourceByUserId', function (req, res) {
    resBody.init();
    const userid = req.query.userId;
    // const resBody = util.inspect(resBody);// json序列
    const getSource = function (userid) {
        // 递归查询 子件夹
        /// 参数 1.bucketName 2.要列出的对象的前缀 (可选，默认值是'')  3. true代表递归查找，false代表类似文件夹查找，以'/'分隔，不查子文件夹。（可选，默认值是false）
        var stream = minioClient.listObjects(userid, '', true);
        resBody.data = [];
        stream.on('data', function (obj) {
            console.log(obj)
            resBody.data.push(obj);
        })
        stream.on('end', function () {
            stream.emit('close', () => { });
            return res.send(resBody);
        })
        stream.on('close', () => console.log('strem is closed'))
        stream.on('error', function (err) {
            console.log(err)
            res.msg = err;
            return res.send(resBody);
        })
    }
    /// 不需要每次都创建，但minio js jdk判断桶是否存在有bug，不管有没有都会返回null（存在） 坑爹
    minioClient.listBuckets(function (e, buckets) {
        if (e) {
            res.msg = e;
            return res.send(resBody);
        } else {
            if (buckets.findIndex(v => { return v['name'] == userid }) == -1) {
                minioClient.makeBucket(userid, 'cn-north-1', function (err) {
                    if (err) {
                        resBody.msg = err;
                        return res.send(resBody);
                    } else {
                        resBody.msg = `${userid} Bucket created successfully`;
                        resBody.data = [];
                        return res.send(resBody);
                    }
                })
            } else {
                getSource(userid);
            }
        }
    })
    // minioClient.bucketExists(userid, function (err) {
    //     console.log(err)
    //     if (err) {
    //         if (err.code == 'NoSuchBucket') {
    //             minioClient.makeBucket(userid, 'cn-north-1', function (err) {
    //                 if (err) {
    //                     resBody.msg = err;
    //                     return res.send(resBody);
    //                 } else {
    //                     resBody.msg = `${userid} Bucket created successfully`;
    //                     resBody.data = [];
    //                     return res.send(resBody);
    //                 }
    //             })
    //         } else {
    //             resBody.msg = err;
    //             return res.send(resBody);
    //         }
    //     } else {
    //         // 递归查询 子件夹
    //         /// 参数 1.bucketName 2.要列出的对象的前缀 (可选，默认值是'')  3. true代表递归查找，false代表类似文件夹查找，以'/'分隔，不查子文件夹。（可选，默认值是false）
    //         var stream = minioClient.listObjects(userid, '', true);
    //         stream.on('data', function (obj) {
    //             resBody.data.push(obj);
    //         })
    //         stream.on('end', function () {
    //             return res.send(resBody);
    //         })
    //         stream.on('error', function (err) {
    //             res.msg = err;
    //             return res.send(resBody);
    //         })
    //     }
    // })
})
// minio 文件上传测试页面
router.get('/test', (req, res) => {
    res.send(`
      <h2>minio文件上传测试页面</h2>
      <form action="/minio/uploadByUserId" enctype="multipart/form-data" method="post">
        <div>userid: <input type="text" name="userId" /></div>
        <div>File: <input type="file" name="someExpressFiles" multiple="multiple" /></div>
        <input type="submit" value="Upload" />
      </form>
    `);
});
// 通过用户id上传文件
/***
 * params {String userId 用户guid}
 * params {File files 上传的文件}
*/
router.post('/uploadByUserId', (req, res) => {
    resBody.init();
    // 使用multer 获去文件如下 ------------
    console.log(req.files)
    const files = req.files;
    const userid = req.body.userId;
    resBody.code = res.statusCode;
    resBody.data = [];
    resBody.msg = '';
    if (!files.length && (resBody.msg = '请选择要上传的文件')) return res.send(resBody);
    files.forEach((file, idx) => {
        // 创建一个bufferstream
        var bufferStream = new stream.PassThrough();
        //将 Buffer写入
        var fileStream = bufferStream.end(file.buffer);
        minioClient.putObject(userid, file['originalname'], fileStream, file.size, function (err, etag) {
            resBody['data'].push({
                name: file['originalname'],
                status: 200,
                msg: 'success'
            })
            resBody.msg += file['originalname'] + '上传成功;'
            if (err) {
                resBody['data'].push({
                    name: file['originalname'],
                    status: 500,
                    msg: err
                })
                resBody.msg += file['originalname'] + '上传失败;'
            }
            if (idx == files.length - 1) res.send(resBody);
        })
    })
    // 使用multer 获去文件end ------------

    // 使用formidable 获去文件如下 ------------
    // const form = formidable({ multiples: true });
    // form.parse(req, (err, fields, files) => {
    //     if (err) {
    //         next(err);
    //         resBody.msg = err;
    //         resBody.code = res.sendStatus;
    //         return;
    //     }
    //     console.log(fields)
    //     console.log(files)
    //     res.send({ fields, files });
    // });
    // 使用formidable 获去文件end ------------
});
// 通过用户id删除minio一个或多个文件
/***
 * params {String userId 用户guid}
 * params {String fileNames 删除文件名称，多个文件用;分割}
*/
router.post('/deleteFileByUserId', function (req, res) {
    resBody.init();
    var uesrid = req.query.userId;
    var filenames = req.query.fileNames;
    console.log(req.query.fileNames)
    if (typeof (filenames) === 'string') {
        filenames = filenames.split(';');
    }
    resBody.data = [];
    resBody.code = res.statusCode;
    resBody.msg = '';
    filenames.forEach((file, idx) => {
        minioClient.removeObject(uesrid, file, function (err) {
            if (err) {
                resBody.data.push({
                    filename: file,
                    msg: '删除失败',
                    code: 500,
                });
                resBody.msg += file + '删除失败;';
            }
            resBody.data.push({
                filename: file,
                msg: '删除成功',
                code: 200,
            });
            resBody.msg += file + '删除成功;';
            (filenames.length == idx + 1) && res.send(resBody);
        })
    })
})
module.exports = router;
