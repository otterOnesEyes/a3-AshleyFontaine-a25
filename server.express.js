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
      if( req.url != "/login"){
        req.json.grade = await gradeScore(req.json.score)
      }
      next()
    })

  } else {
    next()
  }
}

const updateLeaderboard = async (req, res, next) => {
  let foundEntry = false

  if(req.url === "/entry"){
    // Search for the existing entry.
    await console.log("Going to make an entry!")
    await console.log("After next: " + req.json)
    for(let i = 0 ; i < req.lb.length; i++){
      if(req.lb[i].username == req.json.username){
        if(req.lb[i].password == req.json.password){
          // If player name and password match, update with new data.
          foundEntry = true
          console.log(req.json.completion)
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
    if(req.url != "/login"){
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
    }
  } finally {
    await client.close()
    next()
  }
}

const loginUser = async (req, res, next) => {
  if(req.url == "/login"){
    json = {
      username: req.json.username,
      password: req.json.password
    }
    let foundEntry = false
    for(let i = 0 ; i < req.lb.length; i++){
      if(req.lb[i].username == req.json.username){
        foundEntry = true
        if(req.lb[i].password == req.json.password){
          json.success = true
          userScore = req.lb[i].score
          userCombo = req.lb[i].combo
          userComplete = req.lb[i].complete
          json.newForms = `<div class="form">
          <form id="entryForm">
            <label for="score">Score</label>
            <input type="number" id="score" value="` + userScore + `" min="0" max="1000000">
            <br>
            <label for="combo">Max Combo</label>
            <input type="number" id="combo" value="` + userCombo + `" min="0" max="1000">
            <br>
            <br></br>
            <input type="radio" id="am" name="completion" value="All Marvelous" `
          if(userComplete == "All Marvelous"){
            json.newForms += `checked`
          }
          json.newForms += `>
            <label for="am">All Marvelous</label>
            <br>
            <input type="radio" id="fc" name="completion" value="Full Combo"`
          if(userComplete == "Full Combo"){
            json.newForms += `checked`
          }
          json.newForms += `>
            <label for="fc">Full Combo</label>
            <br>
            <input type="radio" id="ml" name="completion" value="Missless"`
          if(userComplete == "Missless"){
            json.newForms += `checked`
          }
          json.newForms += `>
            <label for="ml">Missless</label>
            <br>
            <input type="radio" id="cl" name="completion" value="Clear"`
          if(userComplete == "Clear"){
            json.newForms += `checked`
          }
          json.newForms += `>
            <label for="cl">Clear</label>
            <br>
            <input type="radio" id="nc" name="completion" value="Not Clear"`
          if(userComplete == "Not Clear"){
            json.newForms += `checked`
          }
          json.newForms += `>
            <label for="nc">Not Clear</label>
            <br><br>
            <button id="entrybutton">Submit</button>
            <button id="deletebutton">Delete</button>
          </form>
          </div>`
          res.write(JSON.stringify(json))
          next()
        } else {
          console.log("Incorrect Password!")
          json.success = false
          next()
        }
      }
    }
    if(!foundEntry){
      json.success = true
      json.newForms += `<form id="entryForm">
            <label for="score">Score</label>
            <input type="number" id="score" value="0" min="0" max="1000000">
            <br>
            <label for="combo">Max Combo</label>
            <input type="number" id="combo" value="0" min="0" max="1000">
            <br>
            <br>
            <input type="radio" id="am" name="completion" value="All Marvelous">
            <label for="am">All Marvelous</label>
            <br>
            <input type="radio" id="fc" name="completion" value="Full Combo">
            <label for="fc">Full Combo</label>
            <br>
            <input type="radio" id="ml" name="completion" value="Missless">
            <label for="ml">Missless</label>
            <br>
            <input type="radio" id="cl" name="completion" value="Clear">
            <label for="cl">Clear</label>
            <br>
            <input type="radio" id="nc" name="completion" value="Not Clear">
            <label for="nc">Not Clear</label>
            <br><br>
            <button id="entrybutton">Submit</button>
            <button id="deletebutton">Delete</button>
          </form>`
      res.write(JSON.stringify(json))
      next()
    }
  } else {
    next()
  }
}

app.use(start_connection)
app.use(getDataString)
app.use(updateLeaderboard)
app.use(constructLeaderboard)
app.use(loginUser)

app.post("/entry", async ( req, res ) => {
  res.end()
})

app.post("/delete", async (req, res) => {
  res.end()
})

app.get("/load", async ( req, res ) => {
  res.end()
})

app.post("/login", async (req, res) => {
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