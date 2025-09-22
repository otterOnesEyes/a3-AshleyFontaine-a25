const express = require( 'express' ),
      app = express()
      leaderboard = [{"_id":{"$oid":"68d06534bce0726f32e02c5c"},
                      "username":"Player1",
                      "password":"123",
                      "score":1000000,
                      "grade":"SSS+",
                      "combo":1000,
                      "complete":"All Marvelous"}]

app.use( express.static( 'public' ) )

const middleware_post = (req, res, next) => {
    console.log("Middleware activated")
    if(req.method === 'POST'){
        console.log("Post request received")
        let dataString = ''

        req.on( 'data', function( data ) {
            dataString += data 
        })

        req.on( 'end', function() {
            const json = JSON.parse( dataString )
            json.grade = gradeScore(json.score)

            leaderboard.push(json)

            console.log(json)
            // ideally want to put this into the mongo

            next()
        })
    }
    next()
}

app.use(middleware_post)

app.post("/entry", ( req, res ) => {
    res.writeHead( 200, { 'Content-Type': 'application/json'})
    res.end( constructLeaderboard() )
})

app.get("/load", ( req, res ) => {
    console.log("load request happening")
    res.writeHead( 200, { 'Content-Type': 'application/json'})
    res.end( constructLeaderboard() )
    console.log("should have sent load")
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