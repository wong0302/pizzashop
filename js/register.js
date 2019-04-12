// Registration

//Global Variables
// let firstName = "", 
// lastName = "",
// email = "", 
// password = "",
// staff = "";

document.addEventListener('DOMContentLoaded', () => {
    addListeners();
});

function addListeners() {
    document.getElementById('confirmBtn').addEventListener('click', sendSignUpInfo);
    //document.getElementById('cancelBtn').addEventListener('click', ) //Bootstrap should handle cancel button
}

function sendSignUpInfo(ev) {
    //user label input
    let userFirstName = document.getElementById('firstName').value, 
    userLastName = document.getElementById('lastName').value,
    userEmail = document.getElementById('signUpEmail').value,
    userPassword = document.getElementById('signUpPassword').value;
    // how do I get option chosen? userType =
    // ASK AKEL*********

    ev.preventDefault();
    //define the end point for the request
    let url = "http://127.0.0.1:3030/auth/users";

    let userInput = {
        firstName: userFirstName,
        lastName: userLastName,
        email: userEmail,
        password: userPassword,
        // isStaff: userType: ;
    };

    let jsonData = JSON.stringify(userInput);

    let headers = new Headers();
    //append the Authorization header
    //headers.append('Authorization', 'Bearer ' + token);
    headers.append('Content-Type', 'application/json;charset=UTF-8');

    console.log("User input is:", userInput);

     //create a Request Object
     let req = new Request(url, {
        headers: headers,
        method: 'POST',
        mode: 'cors',
        //credentials: 'include',
        body: jsonData
    });

    //body is the data that goes to the API
    //now do the fetch
    fetch(req)
    .then(response => {
        if (!response.ok) {
            throw new Error('Guess what. It is not ok. ' + response.status + ' ' + response.statusText);
        } else {
            // document.getElementById('output').textContent =
            //     'Hey we got a response from the server! They LOVED our token.';
            console.log("Akel is the best!");
        }
    })
    .catch(err => {
        //there will be an error because this is not a valid URL
        console.error(err.code + ': ' + err.message);
    })

}

