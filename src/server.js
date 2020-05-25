/** @format */
require('dotenv').config();
const zmq = require('zeromq');
const mysql = require('mysql');
const express = require('express');
var cors = require('cors');
const dns = require('dns');

var con = mysql.createPool({    //needs to be createPool, createConnection wil try to stay connected and fail
    host: "185.28.20.4",
    user: "u398363217_benternet",
    password: "Bkd!hFd9",
    database: "u398363217_benternet"
});
const app = express();
const port = 3000;
app.set('trust proxy', true);
app.use(cors());

const remote = true; //set false for local
var BROKER_URL_PUSH = "";
var BROKER_URL_SUB = "";
    if(remote){
    BROKER_URL_PUSH = "tcp://benternet.pxl-ea-ict.be:24041"; //the url that the server pushes to
    BROKER_URL_SUB = "tcp://benternet.pxl-ea-ict.be:24042";  //the url that the server subs to
}else{
    BROKER_URL_PUSH = "tcp://192.168.1.15:24041"; //the url that the server pushes to
    BROKER_URL_SUB = "tcp://192.168.1.15:24042";  //the url that the server subs to
}
const TOPIC = "DNS";    //the topic that the server listens to
var numMessages = 0;    // how many messages the server receives (for debug)

function pushMessage(msg) { //push a message to the broker
    const pushsock = new zmq.socket("push");
    try {
        pushsock.connect(BROKER_URL_PUSH)
        //console.log("Publisher bound")
    } catch (e) {
        console.log(e);
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

function getMessage() { //get called every time there is a message
    subsock.on("message", function(topic, message) {
        numMessages++; //for debug
        console.log("Number of messages received:", String(numMessages)); //for debug
        var msg = "";
        if(String(topic).includes(TOPIC+'?>')) { //if the user asks for the ip of a url
            msg = String(topic).split(">")[1];
            var IP = false;
                con.query("SELECT * FROM DNS WHERE url LIKE " + mysql.escape(String(msg)), function (err, result, fields) {
                if (err) throw err;
                //console.log(result);
                try {
                    IP = result[0].ip;
                }catch (e) { //if there is no ip for a provided url
                    IP = false;
                }
                if (!IP) { //checks it there is a ip
                    //console.log("DNS!>I don't know the ip of", String(msg)); //for debug
                    dns.lookup(String(msg), (err, address, family) => {
                        pushMessage(TOPIC+"!>" + String(msg)+":"+String(address));
                        con.query("REPLACE INTO DNS (url, ip) VALUES("+mysql.escape(String(msg))+", "+mysql.escape(String(address))+")",function (err, result, fields) {
                            if (err) throw err;
                            //console.log(result);
                            try {
                                IP = result[0].ip;
                            }catch (e) {
                                IP=false
                            }
                            console.log(result.rowsAffected);
                            if (result.rowsAffected = 1) {
                                //console.log("DNS!>I don't know the ip of", String(msg));
                                //pushMessage(TOPIC+"ADD!>" + String(url)+":Updated");
                            } else {
                                //console.log("DNS!>The IP of:", String(msg), "is:", String(IP));
                                //pushMessage(TOPIC+"ADD!>" + String(url) +":Added");
                            }
                        });
                    });
                    //pushMessage(TOPIC+"!>" + String(msg)+":"+String(addrress));

                } else {
                    //console.log("DNS!>The IP of:", String(msg), "is:", String(IP)); //for debug
                    pushMessage(TOPIC+"!>" + String(msg) +":"+ String(IP));
                }
            });
        }else if(String(topic).includes(TOPIC+'ADD?>')) { //if the user want's to update or add a ip to a url
            url = String(topic).split(">")[1];
            ip = String(topic).split(">")[2];
            var IP = false;
            con.query("REPLACE INTO DNS (url, ip) VALUES("+mysql.escape(String(url))+", "+mysql.escape(String(ip))+")",function (err, result, fields) {
                if (err) throw err;
                //console.log(result);
                try {
                    IP = result[0].ip;
                }catch (e) {
                    IP=false
                }
                console.log(result.rowsAffected);
                if (result.rowsAffected = 1) {
                    //console.log("DNS!>I don't know the ip of", String(msg));
                    pushMessage(TOPIC+"ADD!>" + String(url)+":Updated");
                } else {
                    //console.log("DNS!>The IP of:", String(msg), "is:", String(IP));
                    pushMessage(TOPIC+"ADD!>" + String(url) +":Added");
                }
            });
        }else if(String(topic).includes(TOPIC+'DELETE?>')) {
            console.log(String(topic));
            url = String(topic).split(">")[1];
            con.query("DELETE FROM DNS WHERE url LIKE " + mysql.escape(String(url)), function (err, result, fields) {
                if (err) throw err;
                if (result.rowsAffected = 1) {
                    pushMessage(TOPIC+"DELETE!>" + String(url)+":Deleted");
                }
            });
        }
    });
}

const subsock = new zmq.socket("sub");
subsock.connect(BROKER_URL_SUB);
subsock.subscribe(TOPIC);
console.log("Server started");
getMessage();

app.get('/', function(request, response){
    response.sendFile(__dirname + '/html/index.html');
});

app.get('/api', function(request, response){
    var ip = "";
    if (request.query.r == 'delete'){
        pushMessage(TOPIC+"DELETE?>"+request.query.url);
        response.send("record deleted");
    } else if (request.query.r == 'add'){
        if('ip' in request.query){
            ip = request.query.ip;
        }else{
            ip = String(request.ip).split(":");
            ip = ip[3];
            console.log(ip);
            //response.send(request);
        }
        pushMessage(TOPIC+"ADD?>"+request.query.url+">"+ip);
        response.send("record added or updated");
    }else if (request.query.r == 'ask'){
        pushMessage(TOPIC+"?>"+request.query.url);
        con.query("SELECT * FROM DNS WHERE url LIKE " + mysql.escape(String(request.query.url)), function (err, result, fields) {
            if (err) throw err;
            //console.log(result);
            try {
                result = JSON.stringify(result[0]);
                //console.log(result);
                response.send(result);
            } catch (e) { //if there is no ip for a provided url
                console.log("something went wrong");
            }
        });
    } else {
        con.query("SELECT * FROM DNS", function (err, result, fields) {
            if (err) throw err;
            //console.log(result);
            try {
                result = JSON.stringify(result);
                //console.log(result);
                response.send(result);
            } catch (e) { //if there is no ip for a provided url
                console.log("something went wrong");
            }
        });
    }
});
app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`));
