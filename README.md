# DNS
A DNS service for the benternet network made for nodejs
## Requirements
* nodejs
* tested on mac os, windows 10 and ubuntu
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
Here you can see a list of all the URL's and IP's and add a new dns record, delete a old one or search for for adns record
### Client
```sh
npm run client
```
Remember to also start the server or you won't get any response back </br> </br>
To get a IP from a url just enter a url, example facebook.com </br>
If there is a unknown url it will be searched on the top dns and added to the database</br>
</br>
To add or update a ip to a url enter url:ip, example facebook.com:6.6.6.6 </br>
To delete or a url and ip enter delete:url, example delete:facebook.com
### Zeromq requests
To get a dns record
```sh
DNS?>url
```
To add a dns record
```sh
DNSADD?>url>ip
```
To delete a dns record
```sh
DNSDELETE?>url
```
### REST API requests
To get all dns records
```sh
/api
```
To get a specific dns records
will return the ip or will look up the ip in the top dns
```sh
/api?r=ask&url=[url of your choosing]
```
To add or change a dns record with your ip
```sh
/api?r=add&url=[url of your choosing]
```
To add or change a dns record with a ip of your choosing
```sh
/api?r=add&url=[url of your choosing]&ip=[ip of your choosing]
```
To delete a dns record
```sh
/api?r=delete&url=[url of your choosing]
```

## Authors
* Cyril Knops - Student EA-ICT
