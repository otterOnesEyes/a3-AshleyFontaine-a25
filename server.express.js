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

app.use( express.static( 'public' ) )

const start_connection = async (req, res, next) => {
  await client.connect(
    err => {
      console.log("err :", err);
      client.close();
    }
  );  

  db = await client.db("lb")
  console.log("db found")
  collection = await db.collection("entries");
  console.log("collection found")
  leaderboard = await collection.find().toArray()

  req.lb = leaderboard

  res.writeHead( 200, { 'Content-Type': 'application/json'})

  next()
}

const getDataString = async (req, res, next) => {
  if(req.method === 'POST'){
    console.log("Post request received")
    let dataString = ''

    req.on( 'data', function( data ) {
      dataString += data 
    })

    req.on( 'end', async function() {
      req.json = await JSON.parse( dataString )
      console.log(req.json)
      console.log("Before next(): " + req.json.username)
      req.json.grade = await gradeScore(req.json.score)
    })

    next()
  } else {
    next()
  }
}

const updateLeaderboard = async (req, res, next) => {
  let foundEntry = false

  if(req.url === "/entry"){
    // Search for the existing entry.
    console.log("Going to make an entry!")
    console.log("After next: " + req.json)
    for(let i = 0 ; i < req.lb.length; i++){
      if(req.lb[i].username == req.json.username){
        if(req.lb[i].password == req.json.password){
          // If player name and password match, update with new data.
          foundEntry = true
          await collection.updateOne(
            {username: req.json.username},
            { $set:{score:req.json.score}},
            { $set:{grade:req.json.grade}},
            { $set:{combo:req.json.combo}},
            { $set:{completion:req.json.completion}}
          )
          req.lb[i].score = await req.json.score
          req.lb[i].grade = await req.json.grade
          req.lb[i].combo = await req.json.combo
          req.lb[i].completion = await req.json.completion
          next()
        } else {
          // If password doesn't match, cancel the whole operation
          console.log("Incorrect Password!")
          next()
        }
      }
    }
    if(!foundEntry){
      console.log("Going to input entry!")
      // Create and add new entry
      await collection.insertOne(req.json)
      await req.lb.push(req.json)
      console.log("Uploaded to DB!")
      next()
    }
  } else if(req.url === "/delete") {
    // Search for an existing entry
    let foundEntry = false
    for(let i = 0 ; i < req.lb.length; i++){
      if(req.lb[i].username == req.json.username){
        foundEntry = true
        if(req.lb[i].password == req.json.password){
          // Remove entry if password is correct
          await collection.deleteOne({
            username:req.json.username
          })
          await req.lb.splice(i, 1)
          next()
        } else {
          console.log("Incorrect Password!")
          next()
        }
      }
    }
    if(!foundEntry){
      console.log("User not found")
      next()
    }
  } else {
    next()
  }
}

const constructLeaderboard = async (req, res, next) => {
  try{
    req.lb.sort((a, b) => b.score - a.score)

    // Table header line
    lb = "<tr id=lbhead><th>Rank</th><th>Player</th><th>Score</th><th>Grade</th><th>Combo</th><th>Complete</th></tr>"
    // Convert each entry into HTML table text
    for(let i = 0; i < req.lb.length; i++){
      e = req.lb[i]
      lb += "<tr><td>" +
            (i+1) + "</td><td>" +
            e.username + "</td><td>" +
            e.score + "</td><td>" +
            e.grade + "</td><td>" +
            e.combo + "</td><td>" +
            e.complete +
            "</td></tr>"
    }
    res.write(lb)
  } finally {
    await client.close()
    next()
  }
}

app.use(start_connection)
app.use(getDataString)
app.use(updateLeaderboard)
app.use(constructLeaderboard)

app.post("/entry", async ( req, res ) => {
  res.end()
})

app.post("/delete", async (req, res) => {
  res.end()
})

app.get("/load", async ( req, res ) => {
  res.end()
})

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