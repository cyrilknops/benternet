/** @format */
require('dotenv').config();
const zmq = require('zeromq');
const readline = require("readline");


const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
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

function pushMessage(msg) { //push a message to the broker
    const pushsock = new zmq.socket("push");
    try {
        pushsock.connect(BROKER_URL_PUSH)
    } catch (e) {
        console.log(e);
    }
    try {
        pushsock.send(msg);
    } catch (e) {
        console.log(e);
    }
    pushsock.disconnect(BROKER_URL_PUSH);
    getCommand();
}

function getMessage() { //get called every time there is a message
    subsock.on("message", function(topic, message) {
        var msg = "";
        if (String(topic).includes('DNS!>')) {
            msg = String(topic).split(">")[1];
            console.log(String(msg));

        }else if (String(topic).includes('DNSADD!>')) {
            msg = String(topic).split(">")[1];
            console.log(String(msg));
        }else if (String(topic).includes('DNSDELETE!>')) {
            msg = String(topic).split(">")[1];
            console.log(String(msg));
        }
    });
}
function getCommand() {
    rl.question("", function(url) {
        if(url == 'help'){
            console.log("To find a ip just type the url, example facebook.com");
            console.log("To add a ip just type the url:ip, example facebook.com:6.6.6.6");
            console.log("To delete a ip just type the delete:url, example delete:facebook.com");
            getCommand();
        }else if(String(url).includes('delete')){
            msg = String(url).split(":");
            pushMessage(TOPIC+"DELETE?>"+msg[1]);
        }
        else if(String(url).includes(':')){
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
