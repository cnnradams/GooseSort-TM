const port = process.env.PORT || 8080;

const express = require("express");
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

let imgUpvoteMap = new Map();
imgUpvoteMap.set("a", { votes: 0, path: "images/attack.jpg", sortPosition: 3 });
imgUpvoteMap.set("b", { votes: 0, path: "images/cat.jpg", sortPosition: 2 });
imgUpvoteMap.set("c", { votes: 0, path: "images/coat.jpg", sortPosition: 0 });
imgUpvoteMap.set("d", { votes: 0, path: "images/devil.jpeg", sortPosition: 0 });
imgUpvoteMap.set("e", { votes: 0, path: "images/flying.jpeg", sortPosition: 0 });
imgUpvoteMap.set("f", { votes: 0, path: "images/gosling.jpg", sortPosition: 0 });
imgUpvoteMap.set("g", { votes: 0, path: "images/iconic.JPG", sortPosition: 0 });
imgUpvoteMap.set("h", { votes: 0, path: "images/mrgoose.jpg", sortPosition: 0 });
imgUpvoteMap.set("i", { votes: 0, path: "images/plush.jpg", sortPosition: 0 });
imgUpvoteMap.set("j", { votes: 0, path: "images/ryangosling.jpg", sortPosition: 0 });

const sorts = [["Normal", normalsort], ["Reverse", reversesort], ["Word Sort", wordsort], ["Last Digit", lastdigit]];
let currentSort = 0;
// const favicon = require("serve-favicon");
// const path = require('path');
function normalsort(map) {
    map.forEach((value, key) => {
        value.sortPosition = value.votes;
    });
}
function reversesort(map) {
    map.forEach((value, key) => {
        value.sortPosition = -value.votes;
    });
}
function wordsort(map) {
    map.forEach((value, key) => {
        value.sortPosition = convert(value.votes).length;
    });
}

function lastdigit(map) {
    map.forEach((value, key) => {
        value.sortPosition = value.votes % 10;
    });
}

function is_numeric(mixed_var) {
    return (typeof mixed_var === 'number' || typeof mixed_var === 'string') && mixed_var !== '' && !isNaN(mixed_var);
}
function convert(number) {
    let isn = number < 0;
    if (number === 0) return "zero";
    number = Math.abs(number);
    if (!is_numeric(number)) {
        console.log("Not a number = " + number);
        return "";
    }

    var quintillion = Math.floor(number / 1000000000000000000); /* quintillion */
    number -= quintillion * 1000000000000000000;
    var quar = Math.floor(number / 1000000000000000); /* quadrillion */
    number -= quar * 1000000000000000;
    var trin = Math.floor(number / 1000000000000); /* trillion */
    number -= trin * 1000000000000;
    var Gn = Math.floor(number / 1000000000); /* billion */
    number -= Gn * 1000000000;
    var million = Math.floor(number / 1000000); /* million */
    number -= million * 1000000;
    var Hn = Math.floor(number / 1000); /* thousand */
    number -= Hn * 1000;
    var Dn = Math.floor(number / 100); /* Tens (deca) */
    number = number % 100; /* Ones */
    var tn = Math.floor(number / 10);
    var one = Math.floor(number % 10);
    var res = "";

    if (quintillion > 0) {
        res += (convert_number(quintillion) + " quintillion");
    }
    if (quar > 0) {
        res += (convert_number(quar) + " quadrillion");
    }
    if (trin > 0) {
        res += (convert_number(trin) + " trillion");
    }
    if (Gn > 0) {
        res += (convert_number(Gn) + " billion");
    }
    if (million > 0) {
        res += (((res == "") ? "" : " ") + convert_number(million) + " million");
    }
    if (Hn > 0) {
        res += (((res == "") ? "" : " ") + convert_number(Hn) + " Thousand");
    }

    if (Dn) {
        res += (((res == "") ? "" : " ") + convert_number(Dn) + " hundred");
    }


    var ones = Array("", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eightteen", "Nineteen");
    var tens = Array("", "", "Twenty", "Thirty", "Fourty", "Fifty", "Sixty", "Seventy", "Eigthy", "Ninety");

    if (tn > 0 || one > 0) {
        if (!(res == "")) {
            res += " and ";
        }
        if (tn < 2) {
            res += ones[tn * 10 + one];
        } else {

            res += tens[tn];
            if (one > 0) {
                res += ("-" + ones[one]);
            }
        }
    }

    if (res == "") {
        console.log("Empty = " + number);
        res = "";
    }
    if (isn) {
        res += "Negative"
    }
    return res;
}
sorts[currentSort][1](imgUpvoteMap);
let currentTime = 10;
setInterval(() => {
    currentTime--;

    if (currentTime <= 0) {
        currentSort++;
        currentSort = currentSort % sorts.length;
        currentTime = 10;
    }
    io.emit('newsort', `Current algorithm: ${sorts[currentSort][0]}, new algorithm in ${currentTime}s`);
}, 1000);
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

io.on('connection', function (socket) {
    socket.emit('data', JSON.stringify(Array.from(imgUpvoteMap)));
    socket.on('voteChange', (name, votes) => {
        let obj = imgUpvoteMap.get(name);
        obj.votes = votes;
        imgUpvoteMap.set(name, obj);
        sorts[currentSort][1](imgUpvoteMap);
        socket.broadcast.emit('data', JSON.stringify(Array.from(imgUpvoteMap)));
        socket.emit('data', JSON.stringify(Array.from(imgUpvoteMap)));
    });
});


/* serves main page */
app.get("/", function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

app.use(express.static(__dirname + '/public'));
http.listen(port, function () {
    console.log("Listening on " + port);
});