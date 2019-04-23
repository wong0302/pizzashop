 let pages = null //SPA
 let tokenKey = 'tokenKey'
 let currentUser = null; //Currently logged in useer
 let mode = null; // Add/Edit mode
 let pizzaIngredientInfo = [];
 let extraToppingsArray = [];

 document.addEventListener('DOMContentLoaded', () => {
     pages = document.querySelectorAll('.page');
     pages[0].classList.add('display');
     getIngredients();
     getPizzas();
     changeURL();
     addListeners();
 });

 function addListeners() {
     document.querySelectorAll('.navigation').forEach(item => {
         item.addEventListener('click', navigate);
     });
     document.getElementById('confirmBtn').addEventListener('click', sendSignUpInfo);
     document.getElementById('logInBtn').addEventListener('click', sendSignInInfo);

     document.querySelector('#signOutButton').addEventListener('click', onSignOut)

     //Add Mode for Ingredients
     document.getElementById('addIngredientsButton').addEventListener('click', () => {
         mode = 'add';
         document.getElementById('ingredientsForm').reset();
     })
     //Add Mode for Pizzas
     document.getElementById('addPizzaButton').addEventListener('click', () => {
         mode = 'add';
         document.getElementById('pizzaForm').reset();
     })

     //Add/Edit modal submit buttons
     document.getElementById('submitIngredientBtn').addEventListener('click', addIngredients);
     document.getElementById('submitPizzaButton').addEventListener('click', addPizza);

     document.querySelector('.change-pswd-btn').addEventListener('click', onClickChangePassword);
     document.getElementById('showPassword').addEventListener('click', showPassword);
     document.getElementById('savePassword').addEventListener('click', checkPassword);
 }
 /**************************
       PASSWORD CHANGE
 **************************/

 function onClickChangePassword() {
     document.querySelector('#pswd-name').textContent = `${currentUser.data.firstName} ${currentUser.data.lastName}`
     document.querySelector('#pswd-email').textContent = currentUser.data.email
 }

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

 function changePassword() {
     // user input 
     let newPassword = document.getElementById('newPassword').value;

     // define the end point for the request
     let url = 'http://127.0.0.1:3030/auth/users/me';

     let authToken = JSON.parse(localStorage.getItem(tokenKey));

     let userInput = {
         password: newPassword
     };

     let jsonData = JSON.stringify(userInput);

     //create a Headers object
     let headers = new Headers();
     headers.append('Content-Type', 'application/json;charset=UTF-8');
     headers.append('Authorization', 'Bearer ' + authToken)

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

     //console.log("User input is:", userInput);

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
             localStorage.setItem(tokenKey, JSON.stringify(data));
             // navbar for signed in user


             getCurrentUser(data);
             getUsers();
         })
         .catch(err => {
             console.error('We are failing');
         })

 }

/**************************
      GET CURRENT USER
**************************/
 function getCurrentUser(authToken) {
     let url = 'http://127.0.0.1:3030/auth/users/me';

     const headers = new Headers();
     headers.append('Content-Type', 'application/json;charset=UTF-8');
     headers.append('Authorization', 'Bearer ' + authToken)

     //console.log("TOKEN:", authToken);

     //create a Request Object
     let req = new Request(url, {
         headers: headers,
         method: 'GET',
         mode: 'cors',
     });

     fetch(req)
         .then(response => {
             return response.json();
         })
         .then(data => {
             currentUser = data;
             adminNav(currentUser);
             //console.log("current user:", currentUser);
         })
         .catch(err => {
             console.log("Woops!", err);
         })
 }

/**************************
        SIGN OUT
**************************/
function onSignOut(){
    localStorage.clear();
    let notSignedIn = document.querySelectorAll('.notSignedIn');
        notSignedIn.forEach(item => {
            item.style.display = 'block';
        })
        let signedOut = document.querySelectorAll('.signedIn');
        signedOut.forEach(item => {
            item.style.display = 'none';
        })
        let adminSignedOut = document.querySelectorAll('.adminSignedIn');
        adminSignedOut.forEach(item => {
            item.style.display = 'none';
        })
}

/**************************
     ADD INGREDIENTS
**************************/

async function addIngredients(ev) {
    ev.preventDefault();
    let productName = document.getElementById('productName').value,
        price = document.getElementById('price').value,
        quantity = document.getElementById('quantity').value;
        imgUrl = document.getElementById('ing-img-input').value


    console.log('img url:', imgUrl);
    //Check if Gluten Free is Checked & Set Value
    let checkVal = undefined;
    if(document.getElementById('isGlutenFree').checked){
        checkVal = true;
    }
    //Determine Categorie Picked
    let categoriesSelected = document.getElementById('categories');
    if (categoriesSelected.selectedIndex == 0) {
        console.log('select one answer');

    } else {
        categories = categoriesSelected.options[categoriesSelected.selectedIndex].text;
    }

    let userInput = {
        name: productName,
        price: price,
        quantity: quantity,
        isGlutenFree: checkVal,
        imageUrl: imgUrl,
        categories: categories
    };

    let jsonData = JSON.stringify(userInput);

    let authToken = JSON.parse(localStorage.getItem(tokenKey));

    let headers = new Headers();
    headers.append('Content-Type', 'application/json;charset=UTF-8');
    headers.append('Authorization', 'Bearer ' + authToken)

    console.log("mode is", mode);
    //define the end point for the request
    let url = (mode == 'add' ? 'http://127.0.0.1:3030/api/ingredients' : `http://127.0.0.1:3030/api/ingredients/${document.querySelector('#ingredients-add-edit').getAttribute('data-id')}`);
    let req = new Request(url, {
        headers: headers,
        method: mode == 'add' ? 'POST' : 'PATCH',
        mode: 'cors',
        body: jsonData
    });
    //body is the data that goes to the API
    //now do the fetch
    let ingredientsList = await fetchAPI(req);
    console.log(ingredientsList);
    getIngredients();
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
    //console.log(ingredientsList);

    createIngredientCard(ingredientsList);
    orderOptionEdit(ingredientsList);
    createPizzaIngredients(ingredientsList);
}

 /**************************
    CREATE INGREDIENT ROWS
 **************************/
 function createIngredientCard(ingredientsList) {
     //console.log("ingredients list is:", ingredientsList);
     let section = document.querySelector('.table-body');
     section.innerHTML = "";

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
         editBtn.addEventListener('click', () => onEditIngredients(item._id));
         //console.log("edit button:", editBtn);
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
     })
 }

 /**************************
     ON EDIT INGREDIENTS
 **************************/
 async function onEditIngredients(id) {
    let url = `http://127.0.0.1:3030/api/ingredients/${id}`;
    let authToken = JSON.parse(localStorage.getItem(tokenKey));

    let headers = new Headers();
    headers.append('Content-Type', 'application/json;charset=UTF-8');
    headers.append('Authorization', 'Bearer ' + authToken)

    let req = new Request(url, {
        headers: headers,
        method: 'GET',
        mode: 'cors'
    });
    let ingredients = await fetchAPI(req);

    document.getElementById('ingredients-add-edit').setAttribute('data-id', id);
    document.getElementById('productName').value = ingredients.data.name;
    document.getElementById('price').value = ingredients.data.price;
    document.getElementById('quantity').value = ingredients.data.quantity;
    let ingredValue = ingredients.data.categories;
    document.querySelector('#categories').value = ingredValue;
    document.getElementById('isGlutenFree').value = ingredients.data.isGlutenFree;
    console.log(document.getElementById('ingredients-add-edit'));

    mode = 'edit';
 }

 /**************************
     DELETE INGREDIENTS
 **************************/
 async function deleteIngredients(id) {
    let url = `http://127.0.0.1:3030/api/ingredients/${id}`;
    let authToken = JSON.parse(localStorage.getItem(tokenKey));

    let headers = new Headers();
    headers.append('Content-Type', 'application/json;charset=UTF-8');
    headers.append('Authorization', 'Bearer ' + authToken)

    let req = new Request(url, {
        headers: headers,
        method: 'DELETE',
        mode: 'cors'
    });

    let ingredientsList = await fetchAPI(req);
    //console.log(ingredientsList);

    getIngredients(ingredientsList);
 }

 /**************************
      GET PIZZAS
 **************************/
 async function getPizzas() {
     /*** No authentication reqyired ***/
     let headers = new Headers();
     headers.append('Content-Type', 'application/json;charset=UTF-8');
     let url = 'http://127.0.0.1:3030/api/pizzas';
     let req = new Request(url, {
         headers: headers,
         method: 'GET',
         mode: 'cors'
     });

     let pizzasList = await fetchAPI(req);
     //console.log("Pizzas list:", pizzasList);

     createPizzaRow(pizzasList);
     createPizzaCards(pizzasList);
 }

 /**************************
     CREATE PIZZAS ROWS
 **************************/
 function createPizzaRow(pizzasList) {
     let section = document.querySelector('#pizzas-view > .table > .table-body');
     section.innerHTML = "";
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
         editBtn.addEventListener('click', () => onEditPizza(pizza._id));

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
 CREATE PIZZA CARDS FOR MENU
 **************************/
 function createPizzaCards(pizzasList) {
     let cardDeck = document.querySelector('.card-deck');
     console.log(cardDeck);
     cardDeck.innerHTML = "";
     pizzasList.data.forEach(pizza => {
         let columnDiv = document.createElement('div');
         let cardDiv = document.createElement('div');
         let pizzaImg = document.createElement('img');
         let cardBody = document.createElement('div');
         let pizzaName = document.createElement('h5');
         //let pizzaIngredients = document.createElement('p');
         let smallText = document.createElement('p');
         let glutenFree = document.createElement('small');
         let selectBtn = document.createElement('li');
         // let selectBtn = document.createElement('a');

         //<li class="nav-item navigation nav-link active" data-target="home">

         pizzaName.textContent = pizza.name;

        //  let ingredients = pizza.ingredients.map(ingredient => {
        //      return ingredient.name;
        //  })

        //  pizzaIngredients.textContent = ingredients.join(", ");
         // Gluten free
         if (pizza.isGlutenFree == true) {
             smallText.textContent = 'Gluten Free';
         } else {
             smallText.textContent = ' ';
         }
         selectBtn.textContent = 'Select';

         columnDiv.setAttribute('class', 'col-md-6 col-xl-4 py-4 d-flex');
         cardDiv.setAttribute('class', 'card text-center cardDiv');
         pizzaImg.setAttribute('src', pizza.imageUrl);
         pizzaImg.setAttribute('class', 'card-img-top');
         pizzaImg.setAttribute('alt', pizza.name);
         cardBody.setAttribute('class', 'card-body');
         pizzaName.setAttribute('class', 'card-title');
         //pizzaIngredients.setAttribute('class', 'card-text');
         smallText.setAttribute('class', 'card-text');
         glutenFree.setAttribute('class', 'text-muted');
         selectBtn.setAttribute('class', 'nav-item nav-link btn btn-primary navigation');
         selectBtn.setAttribute('data-target', 'order-view');

         cardDeck.appendChild(columnDiv);
         columnDiv.appendChild(cardDiv);
         cardDiv.appendChild(pizzaImg);
         cardDiv.appendChild(cardBody);
         cardBody.appendChild(pizzaName);
         //cardBody.appendChild(pizzaIngredients);
         cardBody.appendChild(smallText);
         smallText.appendChild(glutenFree);
         cardBody.appendChild(selectBtn);

         selectBtn.addEventListener('click', navigate);
         selectBtn.addEventListener('click', () => getOrderedPizza(pizza._id));
     })

 }

 /**************************
CHOOSE PIZZA INGREDIENTS
**************************/

function createPizzaIngredients(ingredientsList){
    ingredientsList.data.forEach(item => {
       let addSection = document.querySelector('.admin-add-ingredients');
       let checkboxDiv = document.createElement('div');
       let checkbox = document.createElement('input');
       let ingredientName = document.createElement('label');

       ingredientName.textContent = item.name;

       checkboxDiv.setAttribute('class', 'form-check');
       checkbox.setAttribute('class', 'ingredient-input');
       checkbox.setAttribute('type', 'checkbox');
       checkbox.setAttribute('value', item.name);
       checkbox.setAttribute('data-id', item._id);
       checkbox.addEventListener('change', function() {
        if(event.target.checked) {
            pizzaIngredientInfo.push(item._id);
        }
        if(!event.target.checked) {
            pizzaIngredientInfo.pop(item._id);
        }
    });
       ingredientName.setAttribute('class', 'form-check-label');
       ingredientName.setAttribute('for', 'defaultCheck');

       addSection.appendChild(checkboxDiv);
       checkboxDiv.appendChild(checkbox);
       checkboxDiv.appendChild(ingredientName);
   })
}
 /**************************
         ADD PIZZA
 **************************/
 async function addPizza(ev) {
    ev.preventDefault();
    console.log(pizzaIngredientInfo);
    let name = document.getElementById('pizzaName').value
    //let price = document.getElementById('pizzaPrice').value
    let imgUrl = document.getElementById('pizza-img-input').value
    //Check if Gluten Free is Checked & Set Value
    
    let checkValue = undefined;
    if(document.getElementById('pizzaGluten').checked){
        checkValue = true;
    }
    console.log(checkValue);

    console.log('img url:', imgUrl);

    let userInput = {
        name: name,
       // price: price,
        imageUrl: imgUrl,
        isGlutenFree: checkValue,
        ingredients: pizzaIngredientInfo
    };

    let jsonData = JSON.stringify(userInput);
    let authToken = JSON.parse(localStorage.getItem(tokenKey));

    let headers = new Headers();
    headers.append('Content-Type', 'application/json;charset=UTF-8');
    headers.append('Authorization', 'Bearer ' + authToken)

    //console.log("mode is", mode);
    //define the end point for the request
    let url = (mode == 'add' ? 'http://127.0.0.1:3030/api/pizzas' : `http://127.0.0.1:3030/api/pizzas/${document.querySelector('#pizzas-add-edit').getAttribute('data-id')}`);
    let req = new Request(url, {
        headers: headers,
        method: mode == 'add' ? 'POST' : 'PATCH',
        mode: 'cors',
        body: jsonData
    });

    //body is the data that goes to the API
    //now do the fetch
    let pizzaUpdate = await fetchAPI(req);
    console.log(pizzaUpdate);
    pizzaIngredientInfo.splice(0);
    getPizzas();
 }

 /**************************
        ON EDIT PIZZA
 **************************/
 async function onEditPizza(id) {
    let url = `http://127.0.0.1:3030/api/pizzas/${id}`;
    let authToken = JSON.parse(localStorage.getItem(tokenKey));

    let headers = new Headers();
    headers.append('Content-Type', 'application/json;charset=UTF-8');
    headers.append('Authorization', 'Bearer ' + authToken)

    let req = new Request(url, {
        headers: headers,
        method: 'GET',
        mode: 'cors'
    });
    let pizza = await fetchAPI(req);

    document.getElementById('pizzas-add-edit').setAttribute('data-id', id);
    document.getElementById('pizzaName').value = pizza.data.name;
    document.getElementById('pizzaPrice').value = pizza.data.price;
    document.getElementById('pizzaGluten').value = pizza.data.isGlutenFree;

    console.log(document.getElementById('pizzas-add-edit'));

    mode = 'edit';
}
 /**************************
         DELETE PIZZA
 **************************/
 async function deletePizza(id) {
    let url = `http://127.0.0.1:3030/api/pizzas/${id}`;
    let authToken = JSON.parse(localStorage.getItem(tokenKey));

    let headers = new Headers();
    headers.append('Content-Type', 'application/json;charset=UTF-8');
    headers.append('Authorization', 'Bearer ' + authToken)

    let req = new Request(url, {
        headers: headers,
        method: 'DELETE',
        mode: 'cors'
    });
    await fetchAPI(req);

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
         let checkbox = document.createElement('input');
         //let actions = document.createElement('td');
         //let editBtn = document.createElement('p');
         //let deleteBtn = document.createElement('p');

         checkbox.setAttribute('class', 'ingredient-check-input');
         checkbox.setAttribute('type', 'checkbox');
         // tr.setAttribute('data-id', user._id);
         firstName.textContent = user.firstName;
         lastName.textContent = user.lastName;
         email.textContent = user.email;
         checkbox.checked = user.isStaff;
         //editBtn.textContent = 'Edit';
         //deleteBtn.textContent = 'Delete';

         //actions.setAttribute('data-id', pizza.id);

         //  editBtn.setAttribute('type', 'button');
         //  editBtn.setAttribute('class', 'btn btn-sm btn-outline-secondary');
         //  editBtn.setAttribute('data-toggle', 'modal');
         //  editBtn.setAttribute('data-target', '#edit-user');
         //  editBtn.addEventListener('click', () => editUser(user._id));

         checkbox.addEventListener('click', () => toggleStaff(user._id, checkbox.checked));

         // deleteBtn.setAttribute('type', 'button');
         // deleteBtn.setAttribute('class', 'btn btn-sm btn-outline-secondary');
         // deleteBtn.addEventListener('click', () => deleteUser(user._id));

         tbody.appendChild(tr);
         tr.appendChild(firstName);
         tr.appendChild(lastName);
         tr.appendChild(email);
         tr.appendChild(staff);
         staff.appendChild(checkbox);
         //tr.appendChild(actions);
         //actions.appendChild(editBtn);
         //actions.appendChild(deleteBtn);
     })
 }

/**************************
        PATCH USERS
 **************************/
 async function toggleStaff(id, check) {
    let url = `http://127.0.0.1:3030/auth/users/${id}`;
    let authToken = JSON.parse(localStorage.getItem(tokenKey));

    let userInput = {
        isStaff: check === true ? 'true' : 'false'
    };

    let jsonData = JSON.stringify(userInput);

    let headers = new Headers();
    headers.append('Content-Type', 'application/json;charset=UTF-8');
    headers.append('Authorization', 'Bearer ' + authToken)

    let req = new Request(url, {
        headers: headers,
        method: 'PATCH',
        mode: 'cors',
        body: jsonData
    });

    await fetchAPI(req);
 }

 /**************************
    ORDER OPTIONS ADD                           
**************************/

function orderOptionEdit(ingredientsList) {
    ingredientsList.data.forEach(ingredients => {
        let addSectionOrder = document.querySelector('.user-add-options');
        let checkboxDivOrder = document.createElement('div');
        let checkboxOrder = document.createElement('input');
        let ingredientNameOrder = document.createElement('label');

        ingredientNameOrder.textContent = ingredients.name;

        checkboxDivOrder.setAttribute('class', 'form-check');
        checkboxOrder.setAttribute('id', 'user-order-ingredients');
        checkboxOrder.setAttribute('data-id', ingredients._id);
        checkboxOrder.addEventListener('change', function() {
            if(event.target.checked) {
                extraToppingsArray.push(checkboxOrder.getAttribute('data-id'));
            }
            if(!event.target.checked) {
                extraToppingsArray.pop(checkboxOrder.getAttribute('data-id'));
            }
            //FOR TESTING: Remove & Replace with Order Btn.
            pizzaOrderTotal(); 
        });
        checkboxOrder.setAttribute('class', 'ingredient-check-input');
        checkboxOrder.setAttribute('type', 'checkbox');
        checkboxOrder.setAttribute('value', ingredients.name);
        checkboxOrder.setAttribute('data-id', ingredients._id);
        ingredientNameOrder.setAttribute('class', 'form-check-label');
        ingredientNameOrder.setAttribute('for', 'defaultCheck');

        addSectionOrder.appendChild(checkboxDivOrder);
        checkboxDivOrder.appendChild(checkboxOrder);
        checkboxDivOrder.appendChild(ingredientNameOrder);
      //  console.log('MOREEEEEEE ID:', ingredients._id);

    })
}

/**************************
GET PIZZA DETAILS FOR ORDER
**************************/

async function getOrderedPizza(id) {
    console.log('THIS PIZZA DATA: ', id, );
    let headers = new Headers();
    headers.append('Content-Type', 'application/json;charset=UTF-8');
    let url = `http://127.0.0.1:3030/api/pizzas/${id}`;
    let req = new Request(url, {
        headers: headers,
        method: 'GET',
        mode: 'cors'
    });

    let pizza = await fetchAPI(req);
    updateOrderPrams(pizza);
}

/**************************
    ORDER OPTION DETAILS 
**************************/

function updateOrderPrams(pizza){
    console.log("LAUREN TESTING MORE SHITTTTT YYYASSSSS:", pizza);
    let section = document.querySelector('.order-details');
    section.innerHTML = "";
    let pizzaName = document.createElement('h5');
    let pizzaIngredients = document.createElement('p');
    let isGlutenFree = document.createElement('p');
    let smallText = document.createElement('small');

    pizzaName.setAttribute('class', 'card-title');
    pizzaIngredients.setAttribute('class', 'card-text');
    isGlutenFree.setAttribute('class', 'card-text');
    smallText.setAttribute('class', 'text-muted');

    pizzaName.textContent = pizza.data.name;

    let ingredients = pizza.data.ingredients.map(ingredient => {
        return ingredient.name;
    })

    pizzaIngredients.textContent = ingredients.join(", ");

    let pizzaToppings = pizza.data.ingredients;
    let checkbox = document.querySelectorAll('.ingredient-check-input');

    pizzaToppings.forEach(ingredient => {
        for (let i = 0; i < checkbox.length; i++) {
            if (ingredient._id === checkbox[i].getAttribute('data-id')) {
                checkbox[i].checked = true;
            }else{
                checkbox[i].checked = false;
            }
        }
    })

    // Gluten free
    if(pizza.data.isGlutenFree == true) {
        smallText.textContent = 'Gluten Free';
    } else {
        smallText.textContent = ' ';
    }
    section.appendChild(pizzaName);
    section.appendChild(pizzaIngredients);
    section.appendChild(isGlutenFree);
    isGlutenFree.appendChild(smallText);

    let totalsSection = document.querySelector('.add-to-order');
    let pizzaPrice = document.createElement('h1');
    let extrasPrice = document.createElement('p');
    pizzaPrice.setAttribute('id', 'pizzaPriceTitle');
    pizzaPrice.setAttribute('data-id', pizza.data._id);

    pizzaPrice.textContent = `Total: $${pizza.data.price} + extras`;
    extrasPrice.textContent = `Extras: extras price variable (all added together)`;

    totalsSection.appendChild(pizzaPrice);
    totalsSection.appendChild(extrasPrice);
    orderSummaryList();
}

/**************************
     ORDER TOTAL               
**************************/

function pizzaOrderTotal(){

    //CURRENT USER
    console.log("current:", currentUser);

    //USER EDITED EXTRA TOPPINGS IDS
    console.log("Ingredient ID's:", extraToppingsArray);
    //PIZZA ID FOR OBJECTID REF
    let pizzaId = document.getElementById('pizzaPriceTitle').getAttribute('data-id');
    console.log("Pizza ID's", pizzaId);
}


 /**************************
  CREATE ORDER SUMMARY LIST              
 **************************/

function orderSummaryList() {
    let orderList = document.getElementById('orderList');
    // get request /api/orders
    // get list of pizzas in order, create forEach loop
    let orderItem = document.createElement('li');
    let itemPrice = document.createElement('span');
    let btnSection = document.createElement('span');
    let editBtn = document.createElement('button');
    let deleteBtn = document.createElement('button');
    let underItem = document.createElement('li');
    let ingredient = document.createElement('small');

    orderItem.setAttribute('class', 'list-group-item d-flex justify-content-between align-items-center');
    editBtn.setAttribute('class', 'btn btn-primary btn-sm mx-1');
    editBtn.setAttribute('type', 'button');
    deleteBtn.setAttribute('class', 'btn btn-primary btn-sm');
    deleteBtn.setAttribute('type', 'button')
    underItem.setAttribute('class', 'list-group-item border-0');
    ingredient.setAttribute('class', 'text-muted');

    orderItem.textContent = 'Pizza Pizza Name';
    itemPrice.textContent = '$0.00';
    editBtn.textContent = 'Edit';
    deleteBtn.textContent = 'Delete';
    ingredient.textContent = 'list of ingredients here'

    orderList.appendChild(orderItem);
    orderItem.appendChild(itemPrice);
    orderItem.appendChild(btnSection);
    btnSection.appendChild(editBtn);
    btnSection.appendChild(deleteBtn);
    orderList.appendChild(underItem);
    underItem.appendChild(ingredient);
    
}


 /**************************
     STAFF MEMBER NAV               
 **************************/

 function adminNav(currentUser) {
     console.log('CURRENT USER: ', currentUser);
     if (currentUser.data.isStaff == true) {
         console.log('user is staff', currentUser.data.isStaff);
         let notSignedIn = document.querySelectorAll('.notSignedIn');
         notSignedIn.forEach(item => {
             item.style.display = 'none';
         })
         let signedIn = document.querySelectorAll('.signedIn');
         signedIn.forEach(item => {
             item.style.display = 'block';
         })
         let adminSignedIn = document.querySelectorAll('.adminSignedIn');
         adminSignedIn.forEach(item => {
             item.style.display = 'block';
         })
     } else {
         console.log('user is customer', currentUser.data.isStaff);
         let notSignedIn = document.querySelectorAll('.notSignedIn');
         notSignedIn.forEach(item => {
             item.style.display = 'none';
         })
         let signedIn = document.querySelectorAll('.signedIn');
         signedIn.forEach(item => {
             item.style.display = 'block';
         })
     }
 }

 /**************************
     FETCH FUNCTION 
 **************************/

 function fetchAPI(req) {
    return fetch(req)
        .then(response => {
            if (!response.ok) {
                // userNotification();
                throw new Error('Guess what. It is not ok. ' + response.status + ' ' + response.statusText);
            } else {
                // userNotification();
                console.log('We are so fetchy! YASSSS!');
                return response.json();
            }
        })
        .catch(err => {
            console.error(err.code + ': ' + err.message);
        })
 }

 /**************************
     USER NOTIFICATIONS
 **************************/

function userNotification() {
    let alertSection = document.querySelector('.user-notification');
    let alertDiv = document.createElement('div');
    
    alertDiv.setAttribute('role', 'alert');
    
    // create else if statement 
    
    // setTimeout((function () {
    //     // insert message instructions
    //     this.parentElement.removeChild(this);
    // }).bind(div), 500);
    
    // Info message:
    alertDiv.classList.add('alert alert-primary');
    alertDiv.textContent = 'HOLA from team WACKELSTACKEL!';
    
    // Success message:
    alertDiv.classList.add('alert alert-success');
    alertDiv.textContent = 'BAM! Look at that! You wacked, we stacked!';
    
    // Error message: 
    alertDiv.classList.add('alert alert-warning');
    alertDiv.textContent = 'WHHHAAAT? Something was wacked and it did not stack!';
    
    alertSection.appendChild(alertDiv);
    
    }

 /**************************
             SPA
 **************************/
 function navigate(ev) {
     let tapped = ev.currentTarget;
     //console.log("tapped on:", tapped);
     document.querySelector('.display').classList.remove('display');
     let target = tapped.getAttribute('data-target');
     document.getElementById(target).classList.add('display');
 }

 /**************************
         CHANGE URL
 **************************/

 function changeURL() {
     let navLinks = document.querySelectorAll('.nav-link');
     let dropDowns = document.querySelectorAll('.dropdown-item');
     console.log('This is the navlinks: ', navLinks);
     console.log('This is the dropdowns: ', dropDowns);
     navLinks.forEach((link) => {
         link.addEventListener('click', nav);
     })
     dropDowns.forEach((item) => {
         item.addEventListener('click', nav);
     })
     history.replaceState({}, 'Home', '#home');
     window.addEventListener('hashchange', pop);
 }

 function nav(ev) {
     ev.preventDefault();
     let currentPage = ev.target.getAttribute('data-target');
     console.log('CURRENT PAGE: ', currentPage);
     history.pushState({}, currentPage, `#${currentPage}`);
 }

 function pop() {
     console.log(location.hash, 'popstate event')
 }