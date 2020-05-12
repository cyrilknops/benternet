/** @format */
require('dotenv').config();
const zmq = require('zeromq');
const readline = require("readline");
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});


const BROKER_URL_PUSH = "tcp://benternet.pxl-ea-ict.be:24041";
const BROKER_URL_SUB = "tcp://benternet.pxl-ea-ict.be:24042";
const TOPIC = "DNS";
var numMessages = 0;

function pushMessage(msg = false) {
    const pushsock = new zmq.socket("push");
    try {
        pushsock.connect(BROKER_URL_PUSH)
        //console.log("Publisher bound")
    } catch (e) {
        console.log(e);
    }
    if(!msg){
        msg = "DNS?>cyrilknops.com";
    }
    try {
        //console.log("sending a message");
        pushsock.send(msg);
    } catch (e) {
        console.log(e);
    }
    //console.log("request "+msg);
    pushsock.disconnect(BROKER_URL_PUSH);
    getCommand();
}

function getMessage() {
    subsock.on("message", function(topic, message) {
        numMessages++;
        //console.log("Number of messages received:", String(numMessages));
        var msg = "";
        if (String(topic).includes('DNS!>')) {
            msg = String(topic).split(">")[1];
            //var IP = urlToIp(String(msg));
            console.log(String(msg));
            //pushMessage("I don't know the ip of " + String(msg));

        }else{
            if (String(topic).includes('DNSADD!>')) {
                msg = String(topic).split(">")[1];
                //var IP = urlToIp(String(msg));
                console.log(String(msg));
                //pushMessage("I don't know the ip of " + String(msg));

            }
        }
    });
}
function getCommand() {
    rl.question("", function(url) {
        if(url == 'help'){
            console.log("To find a ip just type the url, example facebook.com");
            console.log("To add a ip just type the url:ip, example facebook.com:6.6.6.6");
            getCommand();
        }else if(String(url).includes(':')){
            msg = String(url).split(":");
            pushMessage(TOPIC+"ADD?>"+msg[0]+">"+msg[1]);
        }else{
            pushMessage(TOPIC+"?>"+url);
        }

    });
}

const subsock = new zmq.socket("sub");
subsock.connect(BROKER_URL_SUB);
subsock.subscribe(TOPIC);
console.log("Type help for more information");
getCommand();
getMessage();
