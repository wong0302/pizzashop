    //TO DO: Figure out how to grab file input when the user adds a picture for the ingredient they are adding. 
    //Mack 
    let pages = null
    let tokenKey = 'tokenKey'

    document.addEventListener('DOMContentLoaded', () => {
        addListeners();
        createIngredientCard();
        pages = document.querySelectorAll('.page');
       pages[0].classList.add('display');
    });

    function addListeners() {

        document.querySelectorAll('.navigation').forEach( item => { item.addEventListener('click', navigate); });
        document.getElementById('confirmBtn').addEventListener('click', sendSignUpInfo);
        document.getElementById('logInBtn').addEventListener('click', sendSignInInfo);
        document.getElementById('submitIngredientBtn').addEventListener('click', addIngredients);
        document.getElementById('showPassword').addEventListener('click', showPassword);
        
        
    }

    /**************************
                SPA
    **************************/

    function navigate(ev) {

        let tapped = ev.currentTarget;
            console.log(tapped);
            document.querySelector('.display').classList.remove('display');
            let target = tapped.getAttribute('data-target');
            document.getElementById(target).classList.add('display');

    }

    /**************************
           SHOW PASSWORD
    **************************/

    function showPassword() {
        let target = document.querySelectorAll('.passwordChange');

        target.forEach(password => {
            if (password.type === "password") {
                password.type = "text";
                console.log('show password');
              } else {
                password.type = "password";
                console.log('hide password');
              }
          })
        }
    
    /**************************
           REGISTRATION
    **************************/

   function sendSignUpInfo(ev) {
    ev.preventDefault();
    //user input
    let userFirstName = document.getElementById('firstName').value, 
    userLastName = document.getElementById('lastName').value,
    userEmail = document.getElementById('signUpEmail').value,
    userPassword = document.getElementById('signUpPassword').value;
    userType = document.getElementById('userType').value;

    //define the end point for the request
    let url = 'http://127.0.0.1:3030/auth/users';

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
            console.log('Account created successfully.');
        }
    })
    .catch(err => {
        //there will be an error because this is not a valid URL
        console.error(err.code + ': ' + err.message);
    })

}

function sendSignInInfo(ev) {
    // navbar for signed in user
    let notSignedIn = document.querySelectorAll('.notSignedIn');
    notSignedIn.forEach(item => {
        item.style.display = 'none';
    })
    let signedIn = document.querySelectorAll('.signedIn');
    signedIn.forEach(item => {
        item.style.display = 'block';
    })

    ev.preventDefault();
    // user input
    let userEmail = document.getElementById('signInEmail').value,
    userPassword = document.getElementById('signInPassword').value;

    let url = 'http://127.0.0.1:3030/auth/tokens';

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
            //console.log(response);
            //from a fetch you would be using response.json()
            return response.json();
        })
        .then(result => {
            let data = result.data.token;
            console.log('data', data);
            sessionStorage.setItem(tokenKey, JSON.stringify(data));
        })
        .catch(err => {
            console.error('We are failing');
        })

}

    /**************************
           ADD INGREDIENTS
    **************************/

    async function addIngredients(ev) {
        let productName = document.getElementById('productName').value,
            price = document.getElementById('price').value,
            quantity = document.getElementById('quantity').value;

        //Check if Gluten Free is Checked & Set Value
        if (document.getElementById('isGlutenFree').checked = true) {
            isGlutenFree = true;
        } else {
            isGlutenFree = false;
        }

        //Determine Categorie Picked
        let categoriesSelected = document.getElementById('categories');
        if (categoriesSelected.selectedIndex == 0) {
            console.log('select one answer');

        } else {
            categories = categoriesSelected.options[categoriesSelected.selectedIndex].text;
        }
        ev.preventDefault();
        //define the end point for the request
        let url = 'http://127.0.0.1:3030/api/ingredients';

        let userInput = {
            name: productName,
            price: price,
            quantity: quantity,
            isGlutenFree: isGlutenFree,
            categories: categories
        };

        let jsonData = JSON.stringify(userInput);

        let headers = new Headers();
        headers.append('Content-Type', 'application/json;charset=UTF-8');

        console.log("User input is:", userInput);

        let req = new Request(url, {
            headers: headers,
            method: 'POST',
            mode: 'cors',
            body: jsonData
        });

        //body is the data that goes to the API
        //now do the fetch
        let ingredientsList = await fetchAPI(req);
        console.log(ingredientsList);

        }

        function fetchAPI(req) {
            fetch(req)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Guess what. It is not ok. ' + response.status + ' ' + response.statusText);
                } else {
                    // document.getElementById('output').textContent =
                    //     'Hey we got a response from the server! They LOVED our token.';
                    console.log('We are so fetchy! YASSSS!');
                }
            })
            .catch(err => {
                console.error(err.code + ': ' + err.message);
            })
        }


        function createIngredientCard() {

            let tbody = document.querySelector('.table-body');
            let tr = document.createElement('tr');
            let ingredient = document.createElement('td');
            let price = document.createElement('td');
            let quantity = document.createElement('td');
            let category = document.createElement('td');
            let actions = document.createElement('td');
            let editBtn = document.createElement('p');
            let deleteBtn = document.createElement('p');

            ingredient.textContent = 'ingredient variable'; // insert ingredient name variable
            price.textContent = 'price variable'; // insert price variable
            category.textContent = 'category variable'; // insert category variable
            quantity.textContent = 'quantity variable'; // insert quantity variable
            //gluten.textContent = 'gluten free variable'; // insert gluten variable
            editBtn.textContent = 'Edit';
            deleteBtn.textContent = 'Delete';

            editBtn.setAttribute('type', 'button');
            editBtn.setAttribute('class', 'btn btn-sm btn-outline-secondary');
            editBtn.setAttribute('data-toggle', 'modal');
            editBtn.setAttribute('data-target', '#editIngredients');
            console.log("edit button:",editBtn);
            deleteBtn.setAttribute('type', 'button');
            deleteBtn.setAttribute('class', 'btn btn-sm btn-outline-secondary');

            tbody.appendChild(tr);
            tr.appendChild(ingredient);
            tr.appendChild(price);
            tr.appendChild(quantity);
            tr.appendChild(category);
            tr.appendChild(actions);
            actions.appendChild(editBtn);
            actions.appendChild(deleteBtn);
        }

        // data-toggle="modal"
        //         data-target="#successModal" 
