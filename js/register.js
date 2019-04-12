// Registration


document.addEventListener('DOMContentLoaded', () => {
    addListeners();
});

function addListeners() {
    document.getElementById('confirmBtn').addEventListener('click', sendSignUpInfo);
    document.getElementById('logInBtn').addEventListener('click', sendSignInInfo);
}

function sendSignUpInfo(ev) {
    ev.preventDefault();
    //user input
    let userFirstName = document.getElementById('firstName').value, 
    userLastName = document.getElementById('lastName').value,
    userEmail = document.getElementById('signUpEmail').value,
    userPassword = document.getElementById('signUpPassword').value;
    userType = document.getElementById('userType').value;

    //define the end point for the request
    let url = "http://127.0.0.1:3030/auth/users";

    let userInput = {
        firstName: userFirstName,
        lastName: userLastName,
        email: userEmail,
        password: userPassword,
        isStaff: userType
    };

    let jsonData = JSON.stringify(userInput);

    let headers = new Headers();
    //append the Authorization header
    // headers.append('Authorization', 'Bearer ' + token);
    headers.append('Content-Type', 'application/json;charset=UTF-8');

    console.log("User input is:", userInput);

     //create a Request Object
     let req = new Request(url, {
        headers: headers,
        method: 'POST',
        mode: 'cors',
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
            console.log("Account created successfully.");
        }
    })
    .catch(err => {
        //there will be an error because this is not a valid URL
        console.error(err.code + ': ' + err.message);
    })

}

function sendSignInInfo(ev) {
    ev.preventDefault();
    // user input
    let userEmail = document.getElementById('signInEmail').value,
    userPassword = document.getElementById('signInPassword').value;

    let url = "http://127.0.0.1:3030/auth/tokens";

    let signInInput = {
        email: userEmail,
        password: userPassword
    }

    let jsonData = JSON.stringify(signInInput);

     //create a Headers object
     let headers = new Headers();
     //append the Authorization header
     headers.append('Content-Type', 'application/json;charset=UTF-8');

     //create a Request Object
     let req = new Request(url, {
        headers: headers,
        method: 'POST',
        mode: 'cors',
        body: jsonData
    });
    console.log(jsonData);
    // let fetch = new Promise(function (resolve, reject) {
    //     resolve(response);
    // })
    fetch(req)
        .then(response => {
            console.log(response);
            //from a fetch you would be using response.json()
            return response;
        })
        .then(result => {
            console.log("result is", result);
            let data = result.body;
            console.log('data', data);
           // console.log('TOKEN', data.token);
            //put this in sessionStorage
            //sessionStorage.setItem(KEY, JSON.stringify(data.token));
        })
        .catch(err => {
            console.error('We are failing');
        })

}

