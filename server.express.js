const express = require( 'express' ),
      app = express()
      leaderboard = [{"_id":{"$oid":"68d06534bce0726f32e02c5c"},
                      "username":"Player1",
                      "password":"123",
                      "score":1000000,
                      "grade":"SSS+",
                      "combo":1000,
                      "complete":"All Marvelous"}]

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.USERNM}:${process.env.PASS}@${process.env.HOST}/?retryWrites=true&w=majority&appName=leaderboard`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

let collection = null

async function run() {
  try {
    await client.connect(
	err => {
		console.log("err :", err);
		client.close();
	}

    );  
    collection = await client.db("lb").collection("entries");
    console.log(collection.find({}).toArray())
    // Send a ping to confirm a successful connection
    await client.db("lb").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

 } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}

run().catch(console.dir);

app.use( express.static( 'public' ) )

const middleware_post = (req, res, next) => {
    if(req.method === 'POST'){
        console.log("Post request received")
        let dataString = ''

        req.on( 'data', function( data ) {
            dataString += data 
        })

        req.on( 'end', function() {
            const json = JSON.parse( dataString )
            json.grade = gradeScore(json.score)

            if(req.url === "/entry"){
                // Search for the existing entry.
                let foundEntry = false
                for(let i = 0 ; i < leaderboard.length; i++){
                    if(leaderboard[i].username == json.username){
                        if(leaderboard[i].password == json.password){
                            // If player name and password match, update with new data.
                            
                            foundEntry = true
                            const entry = leaderboard[i]

                            entry.score = json.score
                            entry.grade = json.grade
                            entry.combo = json.combo
                            entry.completion = json.completion

                            // ideally want to put this into the mongo


                        } else {
                            // If password doesn't match, cancel the whole operation
                            console.log("Incorrect Password!")
                            return
                        }
                    }
                }
                if(!foundEntry){
                    // Create and add new entry
                    leaderboard.push(json)
                    
                    // ideally want to put this into the mongo
                }
            } else if (req.url === "/delete"){
                // Search for an existing entry
                let foundEntry = false
                for(let i = 0 ; i < leaderboard.length; i++){
                    if(leaderboard[i].username == json.player){
                        foundEntry = true
                        if(leaderboard[i].password == json.password){
                            // Remove entry if password is correct
                            leaderboard.splice(i, 1)
                        } else {
                            console.log("Incorrect Password!")
                        }
                    }
                }
                if(!foundEntry){
                    console.log("User not found")
                }
            }
            next()
        })
    } else {
        next()
    }
}

app.use(middleware_post)

app.post("/entry", ( req, res ) => {
    res.writeHead( 200, { 'Content-Type': 'application/json'})
    res.end( constructLeaderboard() )
})

app.post("/delete", (req, res) => {
    res.writeHead( 200, { 'Content-Type': 'application/json'})
    res.end( constructLeaderboard() )
})

app.get("/load", ( req, res ) => {
    res.writeHead( 200, { 'Content-Type': 'application/json'})
    res.end( constructLeaderboard() )
})

const constructLeaderboard = function () {
  leaderboard.sort((a, b) => b.score - a.score)

  // Table header line
  lb = "<tr id=lbhead><th>Rank</th><th>Player</th><th>Score</th><th>Grade</th><th>Combo</th><th>Complete</th></tr>"
  // Convert each entry into HTML table text
  for(let i = 0; i < leaderboard.length; i++){
    e = leaderboard[i]
    lb += "<tr><td>" +
          (i+1) + "</td><td>" +
          e.username + "</td><td>" +
          e.score + "</td><td>" +
          e.grade + "</td><td>" +
          e.combo + "</td><td>" +
          e.complete +
          "</td></tr>"
  }
  return lb
}

// Determine "completion grade" based on score
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

app.listen( process.env.PORT || 3000 )