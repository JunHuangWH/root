const http = require("http");
const url = require("url");
const fs = require("fs");
const path = require("path");
const querystring = require("querystring");
const ejs = require("ejs");

let server = http.createServer(function (req, res) {
    //获取用户路径
    let urlPath = url.parse(req.url);
    let pathName = urlPath.pathname;
    let params = querystring.parse(urlPath.query);
    /*----------默认首页-------------*/
    if (pathName == "/") {
        pathName = "/index.html";
    }

    /*----------系统相册-------------*/
    if (pathName == "/alive-photo-main.html") {
        //获取相册模板数据
        pathName = "views/alive-photo-main.ejs";//模板
        let files = fs.readdirSync("album");
        //获取数据
        let data = [];
        for (let i = 0; i < files.length; i++) {
            let stat = fs.statSync("album/" + files[i]);
            if (stat.isDirectory()) {
                let directory = {};
                directory["name"] = files[i];
                directory["img"] = "img/directory.png";
                directory["url"] = "/alive-photo-detail.html?name=" + files[i];
                data.push(directory);
            }
        }
        //获取模板
        let template = fs.readFileSync(pathName, "UTF-8");
        let info = {
            data: data
        };
        //组装
        let html = ejs.render(template, info);
        res.writeHead(200, {"Content-type": "text/html;charset=UTF8"});
        res.end(html);
        return;
    }

    /*----------相册详情-------------*/
    if (pathName == "/alive-photo-detail.html") {
        pathName = "views/alive-photo-detail.ejs";//模板
        let files = fs.readdirSync("album/" + params.name);
        //获取数据
        let data = [];
        for (let i = 0; i < files.length; i++) {
            let stat = fs.statSync("album/" + params.name + "/" + files[i]);
            if (stat.isFile()) {
                let img = {};
                img["name"] = files[i];
                img["url"] = "album/" + params.name + "/" + files[i];
                img["remark"] = "图片说明";
                data.push(img);
            }
        }
        //获取模板
        let template = fs.readFileSync(pathName, "UTF-8");
        let info = {
            title: params.name,
            data: data
        };
        //组装
        let html = ejs.render(template, info);
        res.writeHead(200, {"Content-type": "text/html;charset=UTF8"});
        res.end(html);
        return;
    }

    /*----------加载引用文件-------------*/
    //获取拓展名
    let extName = path.extname(pathName);
    let filepath = "static" + pathName;
    console.log("---------------" + filepath + "---------------");
    //相册图片过滤
    if (filepath.indexOf("static/album") != -1) {
        filepath = filepath.replace("static/album", "album");
    }
    //读取文件
    fs.readFile(filepath, (err, data) => {
        if (err) {
            console.log(err);
            fs.readFile("static/404.html", (err, data) => {
                res.writeHead(404, {"Content-type": "text/html;charset=UTF8"});
                res.end(data);
            });
            return;
        }
        //确定MIME类型
        getMime(extName, (mime) => {
            res.writeHead(200, {"Content-Type": mime + ";charset=UTF8"});
        });
        res.end(data);
    });
});


function getMime(extName, callback) {
    fs.readFile("mime.json", function (err, data) {
        if (err) {
            throw Error("读取mime文件失败！");
            return;
        }
        //JSON
        let mimeJSON = JSON.parse(data);
        let mime = mimeJSON[extName] || "text/plain";
        callback(mime);
    });
}

server.listen(80, "127.0.0.1");