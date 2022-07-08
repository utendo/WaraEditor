const fs = require('fs');
const {PythonShell} = require('python-shell');
var TGA = require('tga');
var PNG = require('pngjs').PNG;

function randomNum(min, max) {
	return Math.floor(Math.random() * (max - min)) + min; // You can remove the Math.floor if you don't want it to be an integer
}

exports.toPNG = function toPNG(data, callback) {
    let id = randomNum(1111111, 9999999);

    fs.writeFile(__dirname + '/python/'+id+'.txt', data, function(err) {
        if (err) throw err;

        PythonShell.run(__dirname + '/python/mv2tga.py', {args:[__dirname + '/python/'+id+'.txt']}, function (err, results) {
            if (err) throw err;

            // read new tga
            var tga = new TGA(fs.readFileSync(__dirname + '/python/'+id+'.tga'));
            var png = new PNG({
                width: tga.width,
                height: tga.height
            });
            png.data = tga.pixels;
            png.pack();
            var chunks = [];
            png.on('data', function (chunk) {
                chunks.push(chunk);
            });
            png.on('end', function () {
                var result = Buffer.concat(chunks);
                // delete all files
                fs.unlinkSync(__dirname + '/python/'+id+'.tga');
                fs.unlinkSync(__dirname + '/python/'+id+'.txt');
                callback(result.toString('base64'));
            });
        });
    });
}

exports.toTGA = function toTGA(data, callback) {
    const buffer = Buffer.from(data, "base64");
    var png = new PNG().parse(buffer, function (err, data) {
        if (err) throw err;

        let tga = TGA.createTgaBuffer(png.width, png.height, png.data);
        fs.writeFileSync(__dirname + '/python/input.tga', tga);
        
        PythonShell.run(__dirname + '/python/tga2mv.py', null, function (err, results) {
            if (err) throw err;

            var mv = fs.readFileSync(__dirname + '/python/input2.txt');
            callback(mv.toString());
        });
    });
}