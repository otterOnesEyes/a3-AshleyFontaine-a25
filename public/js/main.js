// FRONT-END (CLIENT) JAVASCRIPT HERE

let servingUsername = ""
let servingPassword = ""

const submit = async function( event ) {
  // stop form submission from trying to load
  // a new .html page for displaying results...
  // this was the original browser behavior and still
  // remains to this day
  event.preventDefault()
  
  // get the data from each entry form
  const scoreinput = document.querySelector( '#score' ),
        comboinput = document.querySelector( '#combo' ),
        completeinput = document.querySelector('#entryForm').elements["completion"],
        json = { username: servingUsername, 
                 password: servingPassword, 
                 score: scoreinput.value,
                 combo: comboinput.value,
                 complete: completeinput.value
        },
        body = JSON.stringify( json )

  const response = await fetch( "/entry", {
    method:"POST",
    body 
  })

  const text = await response.text()

  // 'text' is the new updated leaderboard
  document.querySelector("#leaderboard").innerHTML = text

  console.log( "text:", text )
}


const remove = async function( event ) {
  event.preventDefault()

  // collect data from relevant inputs
  const json = { username: servingUsername,
                 password: servingPassword
        },
        body = JSON.stringify( json )

  const response = await fetch( "/delete", {
    method:"POST",
    body
  })

  const text = await response.text()

  document.querySelector("#leaderboard").innerHTML = text
}

// Loads the table without attempting to change it
const loadTable = async function( event ) {
  event.preventDefault()

  console.log("Going to send a load!")
  const response = await fetch ( "/load", {
    method:"GET"
  })

  console.log("Load sent!")

  const text = await response.text()

  console.log("Recieved response")

  document.querySelector("#leaderboard").innerHTML = text
}

const login = async function ( event ) {
  event.preventDefault()

  const uninput = document.querySelector( '#lusername' ),
        pwdinput = document.querySelector( '#lpassword' ),
        json = { username: uninput.value,
                 password: pwdinput.value
        },
        body = JSON.stringify( json )
  
  console.log("Going to log in!")
  const response = await fetch ( "/login", {
    method:"POST",
    body
  })

  const text = await response.text()
  resJson = JSON.parse(text)

  if(resJson.success) {
    document.querySelector("#formBox").innerHTML = resJson.newForms
    await newListeners()
    servingUsername = json.username
    servingPassword = json.password
  } else {
    console.log("Log in failed!")
  }

}

const newListeners = function () {
  const entrybutton = document.querySelector("#entrybutton"),
        deletebutton = document.querySelector("#deletebutton");
        
  entrybutton.onclick = submit;
  deletebutton.onclick = remove;
}

window.onload = function() {
  const loginbutton = this.document.querySelector("#loginbutton"),
        loadbutton = document.querySelector("#loadbutton");
  loginbutton.onclick = login;
  loadbutton.onclick = loadTable;
}