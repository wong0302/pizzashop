    //TO DO: Figure out how to grab file input when the user adds a picture for the ingredient they are adding. 
    //Mack 
    let pages = null
    let tokenKey = 'tokenKey'

    document.addEventListener('DOMContentLoaded', () => {
        addListeners();
        pages = document.querySelectorAll('.page');
        pages[0].classList.add('display');
        getIngredients();
        getPizzas();
        getUsers();
    });

    function addListeners() {
        document.querySelectorAll('.navigation').forEach(item => {
            item.addEventListener('click', navigate);
        });
        document.getElementById('confirmBtn').addEventListener('click', sendSignUpInfo);
        document.getElementById('logInBtn').addEventListener('click', sendSignInInfo);

        document.getElementById('submitIngredientBtn').addEventListener('click', addIngredients);
        document.getElementById('submitPizzaButton').addEventListener('click', addPizza);

        document.getElementById('showPassword').addEventListener('click', showPassword);
        document.getElementById('savePassword').addEventListener('click', checkPassword);
    }
    /**************************
          PASSWORD CHANGE
    **************************/

    // show hidden password by checkbox
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

    // verify passwords match
    function checkPassword() {
        let password1 = document.getElementById('newPassword').value;
        let password2 = document.getElementById('reEnterPassword').value;
        // if field is left empty
        if (password1 == '')
            alert("Please enter Password");
        // if field is left empty 
        else if (password2 == '')
            alert("Please enter confirm password")
        // passwords do not match     
        else if (password1 != password2) {
            alert("\nPassword did not match: Please try again...")
            return false;
        }
        // passwords match
        else {
            changePassword();
            alert("Password Matched!")
            return true;
        }
    }

    // change password
    function changePassword() {

        // user input 
        let newPassword = document.getElementById('newPassword').value;

        // define the end point for the request
        let url = 'http://127.0.0.1:3030/auth/users/me';

        let userInput = {
            password: newPassword
        };

        let jsonData = JSON.stringify(userInput);

        //create a Headers object
        let headers = new Headers();
        //append the Authorization header
        headers.append('Content-Type', 'application/json;charset=UTF-8');

        //create a Request Object
        let req = new Request(url, {
            headers: headers,
            method: 'PATCH',
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
                    console.log('success! password has been changed');
                }
            })
            .catch(err => {
                //there will be an error because this is not a valid URL
                console.error(err.code + ': ' + err.message);
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
        fetchAPI(req);

    }

    function sendSignInInfo(ev) {


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
                // navbar for signed in user
                let notSignedIn = document.querySelectorAll('.notSignedIn');
                notSignedIn.forEach(item => {
                    item.style.display = 'none';
                })
                let signedIn = document.querySelectorAll('.signedIn');
                signedIn.forEach(item => {
                    item.style.display = 'block';
                })
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
        //console.log(ingredientsList);
    }

    /**************************
         GET INGREDIENTS
    **************************/

    async function getIngredients() {
        let headers = new Headers();
        headers.append('Content-Type', 'application/json;charset=UTF-8');
        let url = 'http://127.0.0.1:3030/api/ingredients';
        let req = new Request(url, {
            headers: headers,
            method: 'GET',
            mode: 'cors'
        });

        let ingredientsList = await fetchAPI(req);
        console.log(ingredientsList);

        createIngredientCard(ingredientsList);
    }

    /**************************
        CREATE INGREDIENT ROWS
    **************************/
    function createIngredientCard(ingredientsList) {
        console.log("ingredients list is:", ingredientsList);
        let section = document.querySelector('.table-body');
        section.innerHTML =""; 

        ingredientsList.data.forEach(item => {
                let tbody = document.querySelector('.table-body');
                let tr = document.createElement('tr');
                let ingredient = document.createElement('td');
                let price = document.createElement('td');
                let quantity = document.createElement('td');
                let category = document.createElement('td');
                let actions = document.createElement('td');
                let editBtn = document.createElement('p');
                let deleteBtn = document.createElement('p');

                ingredient.textContent = item.name // insert ingredient name variable
                price.textContent = item.price; // insert price variable
                category.textContent = item.categories; // insert category variable
                quantity.textContent = item.quantity; // insert quantity variable
                //gluten.textContent = 'gluten free variable'; // insert gluten variable
                editBtn.textContent = 'Edit';
                deleteBtn.textContent = 'Delete';
                editBtn.setAttribute('type', 'button');
                editBtn.setAttribute('class', 'btn btn-sm btn-outline-secondary');
                editBtn.setAttribute('data-toggle', 'modal');
                editBtn.setAttribute('data-target', '#editIngredients');
                console.log("edit button:", editBtn);
                deleteBtn.setAttribute('type', 'button');
                deleteBtn.setAttribute('class', 'btn btn-sm btn-outline-secondary');
                deleteBtn.setAttribute('data-id', item.id);
                deleteBtn.addEventListener('click', () => deleteIngredients(item._id));

                tbody.appendChild(tr);
                tr.appendChild(ingredient);
                tr.appendChild(price);
                tr.appendChild(quantity);
                tr.appendChild(category);
                tr.appendChild(actions);
                actions.appendChild(editBtn);
                actions.appendChild(deleteBtn);
            }

        )
    }


    /**************************
        DELETE INGREDIENTS
    **************************/
   async function deleteIngredients(id) {
    let url = `http://127.0.0.1:3030/api/ingredients/${id}`;
    let req = new Request(url, {
        method: 'DELETE',
        mode: 'cors'
    });

    let ingredientsList = await fetchAPI(req);
    console.log(ingredientsList);

    getIngredients(ingredientsList);
}

    /**************************
         GET PIZZAS
    **************************/
    async function getPizzas() {
        let headers = new Headers();
        headers.append('Content-Type', 'application/json;charset=UTF-8');
        let url = 'http://127.0.0.1:3030/api/pizzas';
        let req = new Request(url, {
            headers: headers,
            method: 'GET',
            mode: 'cors'
        });

        let pizzasList = await fetchAPI(req);
        console.log("Pizzas list:", pizzasList);

        createPizzaRow(pizzasList);
    }

    /**************************
        CREATE PIZZAS ROWS
    **************************/
    function createPizzaRow(pizzasList) {
        let section = document.querySelector('#pizzas-view > .table > .table-body');
        section.innerHTML =""; 
        pizzasList.data.forEach(pizza => {
            let tbody = document.querySelector('#pizzas-view > .table > .table-body');
            let tr = document.createElement('tr');
            let name = document.createElement('td');
            let price = document.createElement('td');
            let glutenFree = document.createElement('td');
            let actions = document.createElement('td');
            let editBtn = document.createElement('p');
            let deleteBtn = document.createElement('p');

            name.textContent = pizza.name
            price.textContent = pizza.price;
            glutenFree.textContent = pizza.isGlutenFree;
            editBtn.textContent = 'Edit';
            deleteBtn.textContent = 'Delete';

            //actions.setAttribute('data-id', pizza.id);

            editBtn.setAttribute('type', 'button');
            editBtn.setAttribute('class', 'btn btn-sm btn-outline-secondary');
            editBtn.setAttribute('data-toggle', 'modal');
            editBtn.setAttribute('data-target', '#add-edit-pizza');
            editBtn.addEventListener('click', () => editPizza(pizza._id));

            deleteBtn.setAttribute('type', 'button');
            deleteBtn.setAttribute('class', 'btn btn-sm btn-outline-secondary');
            //deleteBtn.setAttribute('data-id', pizza.id);
            deleteBtn.addEventListener('click', () => deletePizza(pizza._id));

            tbody.appendChild(tr);
            tr.appendChild(name);
            tr.appendChild(price);
            tr.appendChild(glutenFree);
            tr.appendChild(actions);
            actions.appendChild(editBtn);
            actions.appendChild(deleteBtn);
        })
    }

    /**************************
            ADD PIZZA
    **************************/
    function addPizza(ev) {
        ev.preventDefault();

        let name = document.getElementById('pizzaName').value
        let price = document.getElementById('price').value

        //Check if Gluten Free is Checked & Set Value
        if (document.getElementById('isGlutenFree').checked = true) {
            isGlutenFree = true;
        } else {
            isGlutenFree = false;
        }

        //define the end point for the request
        let url = 'http://127.0.0.1:3030/api/pizzas';

        let userInput = {
            name: name,
            price: price,
            isGlutenFree: isGlutenFree,
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
        fetchAPI(req);
        //console.log(ingredientsList);
    }

    /**************************
            DELETE PIZZA
    **************************/
    async function deletePizza(id) {
        let url = `http://127.0.0.1:3030/api/pizzas/${id}`;
        let req = new Request(url, {
            method: 'DELETE',
            mode: 'cors'
        });
       let deletedPizzas = await fetchAPI(req);
       console.log(deletedPizzas);
       getPizzas(deleteIngredients);
    }


    /**************************
            GET USERS
    **************************/
   async function getUsers() {
        let headers = new Headers();
        headers.append('Content-Type', 'application/json;charset=UTF-8');
        let url = 'http://127.0.0.1:3030/auth/users';
        let req = new Request(url, {
            headers: headers,
            method: 'GET',
            mode: 'cors'
        });

        let usersList = await fetchAPI(req);
        console.log("Users list:", usersList);
        createUserRow(usersList);
    }

    /**************************
        CREATE USERS ROWS
    **************************/
    function createUserRow(usersList) {

        usersList.data.forEach(user => {
            let tbody = document.querySelector('#users-view > .table > .table-body');
            let tr = document.createElement('tr');
            let firstName = document.createElement('td');
            let lastName = document.createElement('td');
            let email = document.createElement('td');
            let staff = document.createElement('td');
            let actions = document.createElement('td');
            let editBtn = document.createElement('p');
            //let deleteBtn = document.createElement('p');

            firstName.textContent = user.firstName
            lastName.textContent = user.lastName;
            email.textContent = user.email;
            staff.textContent = user.isStaff;
            editBtn.textContent = 'Edit';
            //deleteBtn.textContent = 'Delete';

            //actions.setAttribute('data-id', pizza.id);

            editBtn.setAttribute('type', 'button');
            editBtn.setAttribute('class', 'btn btn-sm btn-outline-secondary');
            editBtn.setAttribute('data-toggle', 'modal');
            editBtn.setAttribute('data-target', '#edit-user');
            editBtn.addEventListener('click', () => editUser(user._id));

            // deleteBtn.setAttribute('type', 'button');
            // deleteBtn.setAttribute('class', 'btn btn-sm btn-outline-secondary');
            // deleteBtn.addEventListener('click', () => deleteUser(user._id));

            tbody.appendChild(tr);
            tr.appendChild(firstName);
            tr.appendChild(lastName);
            tr.appendChild(email);
            tr.appendChild(staff);
            tr.appendChild(actions);
            actions.appendChild(editBtn);
            //actions.appendChild(deleteBtn);
        })
    }

    function editUser(){

    }

    /**************************
        FETCH FUNCTION 
    **************************/

    function fetchAPI(req) {
        return fetch(req)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Guess what. It is not ok. ' + response.status + ' ' + response.statusText);
                } else {
                    // document.getElementById('output').textContent =
                    //     'Hey we got a response from the server! They LOVED our token.';
                    console.log('We are so fetchy! YASSSS!');
                    return response.json();
                }
            })
            .catch(err => {
                console.error(err.code + ': ' + err.message);
            })
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
