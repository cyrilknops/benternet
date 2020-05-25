# DNS
A DNS service for the benternet network made for nodejs
## Requirements
You need to install nodejs on a MAC OS computer. Windows is not working at the moment
## Installation
```sh
npm install
```
## How to use
### Server
```sh
npm start
```
You can access the webpage with localhost:3000 </br>
Here you can see a list of all the URL's and IP's

You can add a Domain URL to your porsonal IP by going to localhost:3000/api?url=[url of your choosing]
Or You can add a Doamin URL and IP by going to localhost:3000/api?url=[url of your choosing]&ip=[ip of your choosing]
### Client
```sh
npm run client
```
Remember to also start the server or you won't get any response back </br> </br>
To get a IP from a url just enter a url, example facebook.com </br>
To add or update a ip to a url enter url:ip, example facebook.com:6.6.6.6

## Authors
* Cyril Knops - Student EA-ICT
