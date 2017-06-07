var fs      = require('fs');
var moment  = require('moment');
var Crawler = require('crawler');

var indexUrl="http://vision.xitek.com/vision/figure/201704/14-223178.html"
var dataDir     = "data/";
var thisTimeDir = dataDir + moment().format("YYYYMMDDHHmmss");
var imagesDir   = thisTimeDir + "/images";
var imagesFile  = thisTimeDir + "/images.txt";

var uris = new Array();

function prepareDirs() {
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir);
    }
    fs.mkdirSync(thisTimeDir);
    fs.mkdirSync(imagesDir);
}

function prepareURIs() {
    uris.push(indexUrl);
    for(var i = 2; i < 46; i++) {
        uris.push(indexUrl.replace(".html","_"+i+".html"));
    }
}

function appendFile(src) {
    fs.appendFileSync(imagesFile, src  + "\n");
}

function callback(err, response, done) {
    if(err) {
        console.log(err);
    } else {
        var $ = response.$;
        appendFile('http://i6.xitek.com/cms'+$('#bigimg').attr('src'));
    }
    done();
}

function downloadPic() {
    //node-crawler模块已经依赖了request模块
    var request = require('request');
    fs.readFile(imagesFile, function(err, dataBuffer) {
        var allText = dataBuffer.toString();
        var lineTextArray = allText.split('\n');
        lineTextArray.forEach(function(lineText, index, lineTextArray) {
            var fieldArray = lineText.split(' ');
            console.log(fieldArray);
            var uri = fieldArray[0];
            if(uri) {
                request(uri)
                .on('error', function(err) {
                    console.log(err);
                })
                .pipe(fs.createWriteStream(imagesDir + "/" + index + ".jpg"));
            }
        });
    });
}

function getImg() {
    var crawler = new Crawler({
        maxConnections: 10,
        callback: callback
    });
    crawler.queue(uris);
    crawler.on('drain', function() {
        console.log(' 抓取完成!');
        downloadPic();
    });
}


prepareDirs();
prepareURIs();
getImg();
