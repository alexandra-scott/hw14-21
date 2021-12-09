var http = require('http');
var fs = require('fs');
var adr = require('url');
var qs = require('querystring');
const MongoClient = require('mongodb').MongoClient;
const url = "mongodb+srv://alex:scott@cluster0.k60y0.mongodb.net/stocks?retryWrites=true&w=majority"


http.createServer(function (req, res) {
    
    if (req.url == "/"){
        file="index.html";
        fs.readFile(file, function(err, txt) {
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.write("This is the home page <br>");
            res.write(txt);
            res.end();
        });
    }
    else if (req.url == "/process")
    {
        MongoClient.connect(url, { useUnifiedTopology: true }, function(err, db){

            if(err) { return console.log(err); return;}

            var dbo = db.db("stocks");
            var collection = dbo.collection("companies");
            
            console.log("Success!");
            // db.close();
        

       res.writeHead(200, {'Content-Type':'text/html'});
       
       pdata = "";
       req.on('data', data => {
         pdata += data.toString();
       });

      // when complete POST data is received
      req.on('end', () => {
          pdata = qs.parse(pdata);
          
          companyName = pdata['company'];
          stockTicker = pdata['ticker'];
          if (companyName != "") {
               theQuery = {name : companyName};
          } else {
               theQuery = {ticker : stockTicker};
          }
         
          collection.find(theQuery).toArray(function(err, items) {
              if (err) {
                  console.log("Error: " + err);
              } else {
                  var results = items;
                  db.close();
                  res.write("Results: <br/>");
                  
                  for (i = 0; i < items.length; i++) {
                     res.write("Company Name: " + results[i].name + ", Stock Ticker: " + results[i].ticker); 
                     res.write("<br/>");
                  }
                  res.end();
              }
          });

      });
      
      });

      
    }
    else {
        res.writeHead(200, {'Content-Type' : 'text/html'});
        res.write("Unknown page request");
        res.end();
    }
    
}).listen(8080);