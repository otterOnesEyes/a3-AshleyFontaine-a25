const express = require( 'express' ),
      app = express()

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

const middleware_post = async (req, res, next) => {
    
  collection = await client.db("lb").collection("entries");
  leaderboard = await collection.find({}).toArray()

  if(req.method === 'POST'){
    await updateLeaderboard(req, leaderboard, collection)
  }

  next()
}

const updateLeaderboard = async (req, leaderboard, collection) => {
    console.log("Post request received")
    let dataString = ''

    req.on( 'data', function( data ) {
      dataString += data 
    })

    req.on( 'end', async function() {
      await client.connect(
        err => {
          console.log("err :", err);
          client.close();
        }
      );  
      console.log("All data loaded")
      const json = await JSON.parse( dataString )
      json.grade = await gradeScore(json.score)

      if(req.url === "/entry"){
        // Search for the existing entry.
        console.log("Going to make an entry!")
        let foundEntry = false
        for(let i = 0 ; i < leaderboard.length; i++){
          if(leaderboard[i].username == json.username){
            if(leaderboard[i].password == json.password){
              // If player name and password match, update with new data.
              foundEntry = true
              await collection.updateOne(
                {username: json.username},
                { $set:{score:json.score}},
                { $set:{grade:json.grade}},
                { $set:{combo:json.combo}},
                { $set:{completion:json.completion}}
              )
            } else {
              // If password doesn't match, cancel the whole operation
              console.log("Incorrect Password!")
            }
          }
        }
        if(!foundEntry){
          console.log("Going to input entry!")
          // Create and add new entry
          await collection.insertOne(json)
          console.log("Uploaded to DB!")
        }
      } else if (req.url === "/delete"){
      // Search for an existing entry
      let foundEntry = false
      for(let i = 0 ; i < leaderboard.length; i++){
        if(leaderboard[i].username == json.username){
          foundEntry = true
          if(leaderboard[i].password == json.password){
            // Remove entry if password is correct
            await collection.deleteOne({
              username:json.username
            })
          } else {
            console.log("Incorrect Password!")
          }
        }
      }
      if(!foundEntry){
        console.log("User not found")
      }
    }
    client.close();
  })
}

app.use(middleware_post)

app.post("/entry", async ( req, res ) => {
    res.writeHead( 200, { 'Content-Type': 'application/json'})
    res.end( await constructLeaderboard() )
})

app.post("/delete", async (req, res) => {
    res.writeHead( 200, { 'Content-Type': 'application/json'})
    res.end( await constructLeaderboard() )
})

app.get("/load", async ( req, res ) => {
    res.writeHead( 200, { 'Content-Type': 'application/json'})
    res.end( await constructLeaderboard() )
})

const constructLeaderboard = async function () {
  try {
    await client.connect(
      err => {
        console.log("err :", err);
        client.close();
      }
    );  
    collection = await client.db("lb").collection("entries");
    leaderboard = await collection.find({}).toArray()
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
  } finally {
    client.close()
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