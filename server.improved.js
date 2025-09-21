const http = require( "http" ),
      fs   = require( "fs" ),
      // IMPORTANT: you must run `npm install` in the directory for this assignment
      // to install the mime library if you"re testing this on your local machine.
      // However, Glitch will install it automatically by looking in your package.json
      // file.
      mime = require( "mime" ),
      { mongoClient, ServerApiVersion } = require( "mongodb" ),
      uri = "mongodb+srv://madafon964:@Tf9645555@cs4241a3.4kysvlz.mongodb.net/?retryWrites=true&w=majority&appName=CS4241a3",
      dir  = "public/",
      port = 3000

// Example data to be available when the server is started
const appdata = [
  { "player": "Player1", "password": "123", "score": 1000000, "grade": "MASTER", "combo": 1000, "marvelous": 1000, "great": 0, "good": 0, "miss": 0, "completion": "All Marvelous"},
  { "player": "Player2", "password": "123", "score": 995680, "grade": "SSS+", "combo": 1000, "marvelous": 984, "great": 15, "good": 1, "miss": 0, "completion": "Full Combo"},
  { "player": "Player3", "password": "123", "score": 0, "grade": "D", "combo": 0, "marvelous": 0, "great": 0, "good": 0, "miss": 1000, "completion": "Not Clear"},
]

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true
  }
})

const server = http.createServer( function( request,response ) {
  if( request.method === "GET" ) {
    handleGet( request, response )    
  }else if( request.method === "POST" ){
    handlePost( request, response ) 
  }
})

const handleGet = function( request, response ) {
  const filename = dir + request.url.slice( 1 ) 

  if( request.url === "/" ) {
    sendFile( response, "public/index.html" )
  }else if( request.url === "/load"){
    // Functionality to load the data when requested
    sendLB( response )
  } else {
    sendFile( response, filename )
  }
}

const handlePost = function( request, response ) {
  let dataString = ""

  request.on( "data", function( data ) {
      dataString += data 
  })

  request.on( "end", function() {
    console.log( JSON.parse( dataString ) )
    jsObject = JSON.parse( dataString )
    if(request.url === "/entry"){

      // Derived field calculations
      const grade = gradeScore(jsObject.score)
      const completion = evalComplete(jsObject.marvelous, jsObject.great, jsObject.good, jsObject.miss)

      // Search for the existing entry.
      getData()
      let foundEntry = false
      for(let i = 0 ; i < appdata.length; i++){
        if(appdata[i].player == jsObject.player){
          if(appdata[i].password == jsObject.password){
            // If player name and password match, update with new data.
            foundEntry = true
            const entry = appdata[i]

            entry.score = jsObject.score
            entry.grade = grade
            entry.combo = jsObject.combo
            entry.marvelous = jsObject.marvelous
            entry.great = jsObject.great
            entry.good = jsObject.good
            entry.miss = jsObject.miss
            entry.completion = completion
          } else {
            // If password doesn't match, cancel the whole operation
            console.log("Incorrect Password!")
            return
          }
        }
      }
      if(!foundEntry){
        // Create and add new entry to the "database"
        newEntry = {
          player: jsObject.player,
          password: jsObject.password,
          score: jsObject.score,
          grade: grade,
          combo: jsObject.combo,
          marvelous: jsObject.marvelous,
          great: jsObject.great,
          good: jsObject.good,
          miss: jsObject.miss,
          completion: completion
        }
        appdata.push(newEntry)
      }

    } else if (request.url === "/delete"){

      // Search for an existing entry
      let foundEntry = false
      for(let i = 0 ; i < appdata.length; i++){
        if(appdata[i].player == jsObject.player){
          foundEntry = true
          if(appdata[i].password == jsObject.password){
            // Remove entry if password is correct
            appdata.splice(i, 1)
          } else {
            console.log("Incorrect Password!")
            return
          }
        }
      }
      if(!foundEntry){
        console.log("User not found")
        return
      }
    }

    // No matter the change, construct the updated leaderboard
    lb = constructLeaderboard()

    // Send leaderboard back to user
    response.writeHead( 200, "OK", {"Content-Type": "text/plain" })
    response.end(lb)
  })
}

// Build a leaderboard to be set as the innerHTML of a table.
const constructLeaderboard = function () {
  // Begin by sorting the entries by score
  appdata.sort((a, b) => b.score - a.score)

  // Table header line
  lb = "<tr id=lbhead><th>Rank</th><th>Player</th><th>Score</th><th>Grade</th><th>Combo</th><th>Complete</th></tr>"
  // Convert each entry into HTML table text
  for(let i = 0; i < appdata.length; i++){
    e = appdata[i]
    lb += "<tr><td>" +
          (i+1) + "</td><td>" +
          e.player + "</td><td>" +
          e.score + "</td><td>" +
          e.grade + "</td><td>" +
          e.combo + "</td><td>" +
          e.completion +
          "</td></tr>"
  }
  return lb
}

// Determine the "completion rating" based on accuracy.
const evalComplete = function (marv, great, good, miss){
  if((great + good + miss) == 0){
    return "All Marvelous"
  }
  if(miss == 0){
    return "Full Combo"
  }
  if(miss <= 5){
    return "Missless"
  }
 return "Clear"
}

// Determine "competion grade" based on score
const gradeScore = function( score ) {
  switch(true){
    case(score == 1000000):
      return "MASTER"
    case(score >= 990000):
      return "SSS+"
    case(score >= 980000):
      return "SSS"
    case(score >= 970000):
      return "SS+"
    case(score >= 950000):
      return "SS"
    case(score >= 930000):
      return "S+"
    case(score >= 900000):
      return "S"
    case(score >= 850000):
      return "AAA"
    case(score >= 800000):
      return "AA"
    case(score >= 700000):
      return "A"
    case(score > 0):
      return "B"
    case(score == 0):
      return "D"
  }
}

const sendFile = function( response, filename ) {
   const type = mime.getType( filename ) 

   fs.readFile( filename, function( err, content ) {

     // if the error = null, then we"ve loaded the file successfully
     if( err === null ) {

       // status code: https://httpstatuses.com
       response.writeHeader( 200, { "Content-Type": type })
       response.end( content )

     }else{

       // file not found, error code 404
       response.writeHeader( 404 )
       response.end( "404 Error: File Not Found" )

     }
   })
}

// Simple function to send leaderboard on a load
const sendLB = function (response) {
  response.writeHeader( 200, { "Content-Type": "text/plain" })
  response.end( constructLeaderboard() )
}

async function getData(){
  await client.connect()
  await client.db("admin").command({ ping:1 })
  console.log("Database pinged")
  await client.close()
}

server.listen( process.env.PORT || port )