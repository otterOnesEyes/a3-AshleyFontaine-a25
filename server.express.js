const express = require( 'express' ),
      app = express()
      leaderboard = []

app.use( express.static( 'public' ) )

const middleware_post = (req, res, next) => {
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

app.use(middleware_post)

app.post('/entry', ( req, res ) => {
    res.writeHead( 200, { 'Content-Type': 'application/json'})
    res.end( req.json )
})

app.post('/load', ( req, res ) => {
    res.writeHead( 200, { 'Content-Type': 'application/json'})
    res.end( leaderboard )
})

app.listen( process.env.PORT || 3000 )