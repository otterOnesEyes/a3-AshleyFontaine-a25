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
}

app.use(middleware_post)

app.post("/entry", ( req, res ) => {
    res.writeHead( 200, { 'Content-Type': 'application/json'})
    res.end( req.json )
})

app.post("/load", ( req, res ) => {
    console.log("load request happening")
    res.writeHead( 200, { 'Content-Type': 'application/json'})
    res.end( JSON.stringify(leaderboard) )
    console.log("should have sent load")
})

app.listen( process.env.PORT || 3000 )