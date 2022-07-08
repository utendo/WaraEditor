// imports
const { ipcRenderer, ipcMain } = require('electron');
const WaraParser = require('waraparser');
const fs = require('fs');
const { doesNotMatch } = require('assert');
const {PythonShell} = require('python-shell');
var TGA = require('tga');
const { parse } = require('path');
var PNG = require('pngjs').PNG;

// vars
let js = {};
let topicList = document.getElementById('topicList');
let status = document.getElementById('status');
let incr;
let selectedPost = [];
let selectedTopic = 0;
let alr = false;
let appPath;

// on open file
ipcRenderer.on('get-app-path', (event, path) => {
    appPath = path;
});

ipcRenderer.on('open-file', (event, file) => {
    loadFile(file);
});

ipcRenderer.on('save-file', (event, file) => {
    saveFile(file);
});

// exec
// loadFile("C:\\Users\\Vincent\\Downloads\\1stNUP.xml");

// functions
function updateStatus(text) {
    incr = incr + 1;

    status.innerHTML += `
        <p id="status_${incr}">${text}</p>
    `;

    setTimeout(() => {
        document.getElementById(`status_${incr}`).remove();
    }, 2000);
}

function saveFile(file) {
    let data = js;
    let xml = WaraParser.rebuild(data);

    fs.writeFile(file, xml, function(err) {
        if(err) {
            console.log(err);
        } else {
            updateStatus("saved " + '"' + file + '"');
        }
    });
}


function toPNG(data, callback) {
    let id = randomNum(1111111, 9999999);

    fs.writeFile(appPath + '/python/'+id+'.txt', data, function(err) {
        if (err) throw err;

        PythonShell.run(appPath + '/python/mv2tga.py', {args:[appPath + '/python/'+id+'.txt']}, function (err, results) {
            if (err) throw err;

            // read new tga
            var tga = new TGA(fs.readFileSync(appPath + '/python/'+id+'.tga'));
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
                fs.unlinkSync(appPath + '/python/'+id+'.tga');
                setTimeout(() => {
                    fs.unlinkSync(appPath + '/python/'+id+'.txt');
                }, 200);
                callback(result.toString('base64'));
            });
        });
    });
}

function loadFile(file) {
    updateStatus("loading " + '"' + file + '"');
    fs.readFile(file, 'utf8', (err, data) => {
        if(err) {
            console.log(err);
        } else {
            fileData = WaraParser.parse(data);
            parseFile(fileData)
        }
    });
}

function parseFile(file) {
    js = file;
    topics = js.result.topics.topic;
    js.result.expire = "2033-11-21 01:11:26";

    topicList.innerHTML = "";

    for(topic in topics) {
        updateStatus("parsing " + topics[topic].name);

        let topicID = topic;
        console.log(topics[topic]);

        let classes = "";

        if(topics[topic].is_recommended) {
            classes += "recommended";
        }

        topicList.innerHTML += `
            <div class="topic ${classes}" onclick="selectTopic(${topic})">
                <div class="topicIcon">
                    <img onclick="editIcon(${topic})" src="./assets/default.png" id="icon_${topic}" alt="">
                </div>
                <p class="topicName" spellcheck="false" oninput="updateTopicName(${topic})" contenteditable id="topicname_${topic}">${topics[topic].name}</p>
                <div class="posts" id="posts_${topic}">
                    
                </div>
            </div>
        `;

        let postsDiv = document.getElementById(`posts_${topic}`);

        for(person in topics[topic].people.person) {
            console.log(topic + " " + person);
            console.log(topics[topic].people.person[person].post);
            let post = topics[topic].people.person[person].posts.post;
            
            let painting = '';

            if(post.painting !== undefined) {
                painting = `<img onclick="editPainting(${topic}, ${person})" src="./assets/placeholder.png" class="post_painting" id="painting_${post.pid}">`;
                
                toPNG(post.painting.content, (image) => {
                    updateStatus("loading painting for " + post.screen_name);
                    document.getElementById(`painting_${post.pid}`).src = `data:image/png;base64,${image}`;
                });
            }

            postsDiv.innerHTML += `
                <div class="post" id="post_${topic}_${person}" onclick="selectPost(${topic}, ${person})">
                    <div class="postIcon">
                        <img id="posticon_${topic}_${person}" src="./assets/default.png" alt="">
                    </div>
                    <p class="postName" spellcheck="false" oninput="updateScreenName(${topic}, ${person})" contenteditable id="postscreenname_${topic}_${person}">${post.screen_name}</p>
                    <p class="postContent" id="postbody_${topic}_${person}" spellcheck="false" oninput="updateBody(${topic}, ${person})" contenteditable>${post.body}</p>
                    ${painting}
                </div>
            `;
        }

        toPNG(topics[topicID].icon, (image) => {
            updateStatus("loading icon for " + topics[topicID].name);

            document.getElementById(`icon_${topicID}`).src = `data:image/png;base64,${image}`;
            document.getElementById(`icon_${topicID}`).classList.add('loaded');

            for(person in topics[topicID].people.person) {
                document.getElementById(`posticon_${topicID}_${person}`).src = `data:image/png;base64,${image}`;
            }
        });
    }
}

function selectTopic(topic) {
    selectedTopic = topic;
};

function randomNum(min, max) {
	return Math.floor(Math.random() * (max - min)) + min; // You can remove the Math.floor if you don't want it to be an integer
}

ipcRenderer.on('toggle-recommended', (event, args) => {
    let isRecommended = js.result.topics.topic[selectedTopic].is_recommended;
    if(isRecommended) {
        js.result.topics.topic[selectedTopic].is_recommended = false;
    }
    else {
        js.result.topics.topic[selectedTopic].is_recommended = true;
    }

    updateStatus("toggled recommended for " + topics[selectedTopic].name);
    parseFile(js);
});

ipcRenderer.on('delete-post', (event, args) => {
    let topic = selectedPost[0];
    let person = selectedPost[1];

    js.result.topics.topic[topic].people.person.splice(person, 1);
    document.getElementById(`post_${topic}_${person}`).remove();

    alr = false;
});

ipcRenderer.on('duplicate-post', (event, args) => {
    let topic = selectedPost[0];
    let person = selectedPost[1];

    let post = js.result.topics.topic[topic].people.person[person].posts.post;

    let newPost = JSON.parse(JSON.stringify(post));
    newPost.pid = randomNum(1111111111, 9999999999);

    js.result.topics.topic[topic].people.person.push({
        posts: {
            post: newPost
        }
    });
    parseFile(js);
});

function selectPost(topic, person) {
    if(!alr) {
        alr = true;
    }
    else {
        document.getElementById(`post_${selectedPost[0]}_${selectedPost[1]}`).classList.remove('selected');
    }

    selectedPost = [topic, person];

    document.getElementById(`post_${selectedPost[0]}_${selectedPost[1]}`).classList.add('selected');
}

function updateBody(topic, person) {
    let body = document.getElementById(`postbody_${topic}_${person}`).innerHTML;
    let post = js.result.topics.topic[topic].people.person[person].posts.post;
    post.body = body;
};

function updateScreenName(topic, person) {
    let screenName = document.getElementById(`postscreenname_${topic}_${person}`).innerHTML;
    let post = js.result.topics.topic[topic].people.person[person].posts.post;
    post.screen_name = screenName;
}

function updateTopicName(topic) {
    let name = document.getElementById(`topicname_${topic}`).innerHTML;
    js.result.topics.topic[topic].name = name;
}

function editPainting(topic, person) {
    ipcRenderer.send('open-painting', {
        topic: topic,
        person: person
    });
}

function editIcon(topic) {
    ipcRenderer.send('open-icon', {
        topic: topic
    });
}

ipcRenderer.on('painting-updated', (event, resp) => {
    filePath = resp.file;
    // open file
    fs.copyFile(filePath, appPath + '/python/input.tga', (err) => {
        PythonShell.run(appPath + '/python/runme.py', null, function (err, results) {
            if(err) throw err;
            // results is an array consisting of messages collected during execution
            console.log('results: %j', results);
            fs.readFile(appPath + '/python/input2.txt', (err, data) => {
                js.result.topics.topic[resp.topic].people.person[resp.person].posts.post.painting.content = data.toString();
                toPNG(data, (image) => {
                    let pid = js.result.topics.topic[resp.topic].people.person[resp.person].posts.post.pid;
                    updateStatus("loading painting for " + js.result.topics.topic[resp.topic].people.person[resp.person].posts.post.screen_name);
                    document.getElementById(`painting_${pid}`).src = `data:image/png;base64,${image}`;
                }
                );
            });
        });
    })
});

ipcRenderer.on('icon-updated', (event, resp) => {
    filePath = resp.file;
    // open file
    fs.copyFile(filePath, appPath + '/python/input.tga', (err) => {
        PythonShell.run(appPath + '/python/runme.py', null, function (err, results) {
            if(err) throw err;
            // results is an array consisting of messages collected during execution
            console.log('results: %j', results);
            fs.readFile(appPath + '/python/input2.txt', (err, data) => {
                js.result.topics.topic[resp.topic].icon = data.toString();
                toPNG(data, (image) => {
                    updateStatus("loading icon for " + js.result.topics.topic[resp.topic].name);
                    document.getElementById(`icon_${resp.topic}`).src = `data:image/png;base64,${image}`;
                    for(person in topics[resp.topic].people.person) {
                        document.getElementById(`posticon_${resp.topic}_${person}`).src = `data:image/png;base64,${image}`;
                    }
                }
                );
            });
        });
    })
});