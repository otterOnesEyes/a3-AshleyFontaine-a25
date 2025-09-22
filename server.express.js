const express = require( 'express' ),
      app = express()
      leaderboard = [{"_id":{"$oid":"68d06534bce0726f32e02c5c"},
                      "username":"Player1",
                      "password":"123",
                      "score":{"$numberLong":"1000000"},
                      "grade":"SSS+",
                      "combo":{"$numberLong":"1000"},
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
    res.end( req.json )
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
  for(let i = 0; i < appdata.length; i++){
    e = entries[i]
    lb += "<tr><td>" +
          (i+1) + "</td><td>" +
          e.player + "</td><td>" +
          e.score + "</td><td>" +
          e.grade + "</td><td>" +
          e.combo + "</td><td>" +
          e.complete +
          "</td></tr>"
  }
  return lb
}

app.listen( process.env.PORT || 3000 )