/** @format */
require('dotenv').config();
const zmq = require('zeromq');
const mysql = require('mysql');
var con = mysql.createPool({
    host: "185.28.20.4",
    user: "u398363217_benternet",
    password: "Bkd!hFd9",
    database: "u398363217_benternet"
});

const BROKER_URL_PUSH = "tcp://benternet.pxl-ea-ict.be:24041";
const BROKER_URL_SUB = "tcp://benternet.pxl-ea-ict.be:24042";
const TOPIC = "DNS";
var numMessages = 0;
var dns = [
    ['google.com', '172.217.17.142'],
    ['cyrilknops.com', '84.193.168.7'],
    ['youtube.com', '172.217.17.78']
];

function pushMessage(msg = false) {
    const pushsock = new zmq.socket("push");
    try {
        pushsock.connect(BROKER_URL_PUSH)
        //console.log("Publisher bound")
    } catch (e) {
        console.log(e);
    }
    if(!msg){
        msg = TOPIC+"?>cyrilknops.com";
    }
    try {
        //console.log("sending a message");
        pushsock.send(msg);
    } catch (e) {
        console.log(e);
    }
    console.log("message send");
    pushsock.disconnect(BROKER_URL_PUSH)
}

function getMessage() {
    // con.on('error', function(err) {
    //     //console.log('db error', err);
    //     if(err.code === 'PROTOCOL_CONNECTION_LOST' || err.code === 'PROTOCOL_ENQUEUE_AFTER_FATAL_ERROR') { // Connection to the MySQL server is usually
    //         handleDisconnect();                         // lost due to either server restart, or a
    //     } else {                                      // connnection idle timeout (the wait_timeout
    //         throw err;                                  // server variable configures this)
    //     }
    // });
    subsock.on("message", function(topic, message) {
        numMessages++;
        console.log("Number of messages received:", String(numMessages));
        //console.log(String(topic));
        var msg = "";
        if(String(topic).includes(TOPIC+'?>')) {
            msg = String(topic).split(">")[1];
            //var IP = urlToIp(String(msg));
            var IP = false;
                con.query("SELECT * FROM DNS WHERE url LIKE " + mysql.escape(String(msg)), function (err, result, fields) {
                    if (err) throw err;
                    //console.log(result);
                    try {
                        IP = result[0].ip;
                    }catch (e) {
                        IP=false
                    }
                    //console.log(IP);
                    if (!IP) {
                        //console.log("DNS!>I don't know the ip of", String(msg));
                        pushMessage(TOPIC+"!>" + String(msg)+":unknown");

                    } else {
                        //console.log("DNS!>The IP of:", String(msg), "is:", String(IP));
                        pushMessage(TOPIC+"!>" + String(msg) +":"+ String(IP));
                    }
                });
        }else if(String(topic).includes(TOPIC+'ADD?>')) {
            url = String(topic).split(">")[1];
            ip = String(topic).split(">")[2];
            //var IP = urlToIp(String(msg));
            var IP = false;
            con.query("INSERT INTO DNS (url, ip) VALUES("+mysql.escape(String(url))+", "+mysql.escape(String(ip))+") ON DUPLICATE KEY UPDATE " +
                "url="+mysql.escape(String(url))+", ip="+mysql.escape(String(ip)),function (err, result, fields) {
                if (err) throw err;
                //console.log(result);
                try {
                    IP = result[0].ip;
                }catch (e) {
                    IP=false
                }
                //console.log(IP);
                if (!IP) {
                    //console.log("DNS!>I don't know the ip of", String(msg));
                    pushMessage(TOPIC+"ADD!>" + String(url)+":Updated");

                } else {
                    //console.log("DNS!>The IP of:", String(msg), "is:", String(IP));
                    pushMessage(TOPIC+"ADD!>" + String(url) +":Added");
                }
            });
        }
    });
}
function err(e) {

}
function urlToIp(url) {
    try {
        var IP = getIndexOfK(dns, url);
        return dns[IP[0]][1];
    }catch (e) {
        return false;
    }
}
const subsock = new zmq.socket("sub");
subsock.connect(BROKER_URL_SUB);
subsock.subscribe(TOPIC);
//pushMessage("DNS?>google.com");
//pushMessage("DNS?>iwg-it.com");
console.log("Server started");
getMessage();

function handleDisconnect() {

}
function getIndexOfK(arr, k) {
    for (var i = 0; i < arr.length; i++) {
        var index = arr[i].indexOf(k);
        if (index > -1) {
            return [i, index];
        }
    }
}