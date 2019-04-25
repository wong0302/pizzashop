 let pages = null //SPA
 let tokenKey = 'tokenKey'
 let currentUser = null; //Currently logged in user
 let mode = null; // Add/Edit mode
 let pizzaIngredientInfo = [];
 //let extraToppingsArray = [];
 let pizzaCart = [];

 document.addEventListener('DOMContentLoaded', () => {
     pages = document.querySelectorAll('.page');
     pages[0].classList.add('display');
     getIngredients();
     getPizzas();
     getUsers();
     changeURL();
     addListeners();

     if(JSON.parse(localStorage.getItem(tokenKey))) {
        getCurrentUser(JSON.parse(localStorage.getItem(tokenKey)))
     }
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
     document.getElementById('deleteRowPizza').addEventListener('click', deletePizza);
     document.getElementById('deleteRow').addEventListener('click', deleteIngredients);


     document.querySelector('.change-pswd-btn').addEventListener('click', onClickChangePassword);
     document.getElementById('showPassword').addEventListener('click', showPassword);
     document.getElementById('savePassword').addEventListener('click', checkPassword);

     let dropdownSizes = document.querySelectorAll('.sizes');
     dropdownSizes.forEach(size => {
         size.addEventListener('click', selectSize);
     })

     //Add to cart button
     document.getElementById('add-button').addEventListener('click', () => {
         //check if a draft exists. Createe order if not, else update order.
         let orderId = document.querySelector('#orderSummary').getAttribute('data-id');
         let pizzaOrder = document.getElementById('pizzaPriceTitle').getAttribute('data-id');
         pizzaCart.push(pizzaOrder);

         console.log("order Id", orderId);
         orderId == null ? createOrderDraft() : updateOrder('add')
     });

     //Checkout button
     document.querySelector('#checkoutButton').addEventListener('click', () => {
         updateOrder('checkout')
     });

     // event listener for pick up and delivery radios                      
     document.querySelectorAll('.orderType').forEach(type => {
         type.addEventListener('click', addressForm);
     })

     document.querySelector('#cartBtn').addEventListener('click', CartDisplay);
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
     // userNotification("info","Password Enter Password");
     // if field is left empty 
     else if (password2 == '')
         alert("Please enter confirm password")
     //userNotification("info","Please enter confirm password");
     // passwords do not match     
     else if (password1 != password2) {
         alert("\nPassword did not match: Please try again...")
         //userNotification("warning","Password did not Match: Try Again");
         return false;
     }
     // passwords match
     else {
         changePassword();
         //alert("Password Matched!")
         userNotification("success", "Password Changed");
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

 async function sendSignUpInfo(ev) {
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
     let signedUp = await fetchAPI(req);
     let signMessage = `Thanks for Signing up ${firstName}`
     userNotification("success", signMessage);
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
             
             getCurrentUser(data);
             checkToken();
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
 function onSignOut() {
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
     checkToken();
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
     if (document.getElementById('isGlutenFree').checked) {
         checkVal = true;
     }
     if (!document.getElementById('isGlutenFree').checked) {
         checkVal = "false";
     }
     //Determine Category Picked
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
     let message = `${mode} ${ingredientsList.data.name}`;
     userNotification("info", message);
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
     categories(ingredientsList);
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
         let deletedIngredient = document.getElementById('deleteRow');
         let tr = document.createElement('tr');
         let ingredient = document.createElement('td');
         let price = document.createElement('td');
         let gluten = document.createElement('td');
         let quantity = document.createElement('td');
         let category = document.createElement('td');
         let actions = document.createElement('td');
         let editBtn = document.createElement('i');
         let deleteBtn = document.createElement('i');

         ingredient.textContent = item.name // insert ingredient name variable
         price.textContent = item.price; // insert price variable
         category.textContent = item.categories; // insert category variable
         quantity.textContent = item.quantity; // insert quantity variable
         if(item.isGlutenFree === true){
            gluten.textContent = "Gluten Free"
         }else{
            gluten.textContent = "Gluten"

         }
         //editBtn.innerHTML = '<i class="fas text-primary fa-pen"></i>';
         //deleteBtn.innerHTML = '<i class="fas fa-times text-danger"></i>';
         //editBtn.setAttribute('type', 'button');
         editBtn.setAttribute('class', 'fas text-primary fa-pen mr-4');
         editBtn.setAttribute('data-toggle', 'modal');
         editBtn.setAttribute('data-target', '#editIngredients');
         editBtn.addEventListener('click', () => onEditIngredients(item._id));
         //console.log("edit button:", editBtn);
         //deleteBtn.setAttribute('type', 'button');
         deleteBtn.setAttribute('class', 'fas fa-times text-danger');
         deleteBtn.setAttribute('data-toggle', 'modal');
         deleteBtn.setAttribute('data-target', '#deleteModal');
         deletedIngredient.setAttribute('data-id', item._id);

         tr.appendChild(ingredient);
         tr.appendChild(price);
         tr.appendChild(gluten);
         tr.appendChild(quantity);
         tr.appendChild(category);
         tr.appendChild(actions);
         tbody.appendChild(tr);
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
     document.getElementById('edit-add-ingredients-title').innerHTML = "Edit Ingredients";

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
 async function deleteIngredients() {
    let id = document.getElementById('deleteRow').getAttribute('data-id');
    console.log("Trying to delete", id);
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
     getPizzas(deleteIngredients);
     let delMessage = `Deleted: ${ingredientsList.data.name}`;
     userNotification("info", delMessage);

     //getIngredients(ingredientsList);
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
         let deletedPizza = document.getElementById('deleteRowPizza');
         let tr = document.createElement('tr');
         let name = document.createElement('td');
         let price = document.createElement('td');
         let glutenFree = document.createElement('td');
         let actions = document.createElement('td');
         let editBtn = document.createElement('i');
         let deleteBtn = document.createElement('i');

         name.textContent = pizza.name
         price.textContent = pizza.price;
         if(pizza.isGlutenFree === true){
            glutenFree.textContent = "Gluten Free"
         }else{
            glutenFree.textContent = "Gluten"

         }

        // editBtn.setAttribute('type', 'button');
         editBtn.setAttribute('class', 'fas text-primary fa-pen mr-4');
         editBtn.setAttribute('data-toggle', 'modal');
         editBtn.setAttribute('data-target', '#add-edit-pizza');
         editBtn.addEventListener('click', () => onEditPizza(pizza._id));

         deleteBtn.setAttribute('class', 'fas fa-times text-danger');
         deleteBtn.setAttribute('data-toggle', 'modal');
         deleteBtn.setAttribute('data-target', '#deleteModalPizza'); //changed
         deletedPizza.setAttribute('data-id', pizza._id);

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
         let selectBtn = document.createElement('button');
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
             smallText.textContent = 'Not Gluten Free';
         }
         selectBtn.textContent = 'Select';

         columnDiv.setAttribute('class', 'col-md-6 col-xl-4 py-4 d-flex');
         cardDiv.setAttribute('class', 'card text-center cardDiv shadow');
         pizzaImg.setAttribute('src', pizza.imageUrl);
         pizzaImg.setAttribute('class', 'card-img-top');
         pizzaImg.setAttribute('alt', pizza.name);
         cardBody.setAttribute('class', 'card-body');
         pizzaName.setAttribute('class', 'card-title');
         //pizzaIngredients.setAttribute('class', 'card-text');
         smallText.setAttribute('class', 'card-text');
         glutenFree.setAttribute('class', 'text-muted');
         selectBtn.setAttribute('class', 'nav-item nav-link btn-lg btn-primary select-button');
         //selectBtn.setAttribute('data-target', 'order-view');
        // selectBtn.setAttribute('class', 'select-button');

         cardDeck.appendChild(columnDiv);
         columnDiv.appendChild(cardDiv);
         cardDiv.appendChild(pizzaImg);
         cardDiv.appendChild(cardBody);
         cardBody.appendChild(pizzaName);
         //cardBody.appendChild(pizzaIngredients);
         cardBody.appendChild(smallText);
         smallText.appendChild(glutenFree);
         cardBody.appendChild(selectBtn);
         selectBtn.addEventListener('click', () => getOrderedPizza(pizza._id));
     })
     checkToken();
 }

/**************************
ONLY SIGNEDIN USER CAN ORDER
**************************/
function checkToken(){
    let select = document.querySelectorAll('.select-button');
    select.forEach(button => {
        if(JSON.parse(localStorage.getItem(tokenKey))) {
            button.setAttribute('class', 'nav-item nav-link btn btn-primary navigation select-button');
            button.setAttribute('data-target', 'order-view');
            button.addEventListener('click', navigate);
        } else {
            button.setAttribute('class', 'nav-item nav-link btn btn-primary select-button');
            button.removeEventListener('click', navigate);
            button.classList.remove('navigation');
            button.setAttribute('data-target', '#whoDat');
            button.setAttribute('data-toggle', 'modal')
        }
    })
}

/**************************
CHOOSE PIZZA INGREDIENTS
**************************/

 function createPizzaIngredients(ingredientsList) {
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
         checkbox.addEventListener('change', function () {
             if (event.target.checked) {
                 pizzaIngredientInfo.push(item._id);
             }
             if (!event.target.checked) {
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

     // let checkValue = undefined;
     if (document.getElementById('pizzaGluten').checked) {
         checkValue = true;
     }

     if (!document.getElementById('pizzaGluten').checked) {
         checkValue = "false";
     }


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
     let message = `${mode} ${pizzaUpdate.data.name}`;
     userNotification("info", message);
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
     document.getElementById('edit-add-pizzas-title').innerHTML = "Edit Pizza";

     document.getElementById('pizzas-add-edit').setAttribute('data-id', id);
     document.getElementById('pizzaName').value = pizza.data.name;
     // document.getElementById('pizzaPrice').value = pizza.data.price;
     document.getElementById('pizzaGluten').value = pizza.data.isGlutenFree;

     console.log(document.getElementById('pizzas-add-edit'));

     mode = 'edit';
 }

 /**************************
         DELETE PIZZA
 **************************/
 async function deletePizza() {
     let id = document.getElementById('deleteRowPizza').getAttribute('data-id');
     console.log("Trying to delete", id);
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
     let delPizza = await fetchAPI(req);
     getPizzas(deleteIngredients);
     let delMessage = `Deleted: ${delPizza.data.name}`;
     userNotification("info", delMessage);
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

         checkbox.setAttribute('class', 'user-check-input');
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
     ORDER OPTIONS EDIT                          
 **************************/


 function categories(ingredientsList) {
     //Creates ingredient List inside each category
     ingredientsList.data.forEach(ingredient => {
         switch (ingredient.categories) {
             case 'meat':
                 //Statements executed when the
                 console.log('This is meat', ingredient.name, ingredient.categories);
                 //result of expression matches value1
                 orderOptionEdit(ingredient);
                 break;
             case 'spicy':
                 //console.log('This is spicy', ingredients.name, ingredients.categories);
                 orderOptionEdit(ingredient);
                 break;
             case 'vegetarian':
                 //console.log('This is vegetarian', ingredients.name, ingredients.categories);
                 orderOptionEdit(ingredient);
                 break;
             case 'vegan':
                 //console.log('This is vegan', ingredients.name, ingredients.categories);
                 orderOptionEdit(ingredient);
                 break;
             case 'halal':
                 //console.log('This is halal', ingredients.name, ingredients.categories);
                 orderOptionEdit(ingredient);
                 break;
             case 'kosher':
                 //console.log('This is kosher', ingredients.name, ingredients.categories);
                 orderOptionEdit(ingredient);
                 break;
             case 'cheese':
                 //console.log('This is cheese', ingredients.name, ingredients.categories);
                 orderOptionEdit(ingredient);
                 break;
             case 'seasonings':
                 //console.log('This is seasonings', ingredients.name, ingredients.categories);
                 orderOptionEdit(ingredient);
                 break;

         }

     })

 }

 /**************************
 CREATE ORDER INGREDIENT LIST                          
 **************************/

 function orderOptionEdit(ingredient) {
     let editSectionOrder = document.querySelector('.' + ingredient.categories);
     let tr = document.createElement('tr');
     let tdImg = document.createElement('td');
     let tdName = document.createElement('td');
     let tdPrice = document.createElement('td');
     let tdCheck = document.createElement('td');
     let imgThumbnail = document.createElement('img');
     let checkboxDiv = document.createElement('div');
     let checkbox = document.createElement('input');

     tdImg.setAttribute('class', 'img-container-size');
     imgThumbnail.setAttribute('src', ingredient.imageUrl);
     imgThumbnail.setAttribute('alt', ingredient.name);
     imgThumbnail.setAttribute('class', 'img-fluid'); // may change based on size
     checkboxDiv.setAttribute('class', 'form-check');
     checkbox.setAttribute('id', 'user-order-ingredients');
     checkbox.setAttribute('data-id', ingredient._id);
    //  checkbox.addEventListener('change', function () {
    //      if (event.target.checked) {
    //          extraToppingsArray.push(checkbox.getAttribute('data-id'));
    //      }
    //      if (!event.target.checked) {
    //          extraToppingsArray.pop(checkbox.getAttribute('data-id'));
    //      }
    //  });
     checkbox.setAttribute('class', 'ingredient-check-input');
     checkbox.setAttribute('type', 'checkbox');
     checkbox.setAttribute('value', ingredient.name);
     checkbox.setAttribute('data-id', ingredient._id);
    
     if(ingredient.quantity < 1) {
        checkbox.disabled = true;
        tdName.innerHTML = `${ingredient.name} <i class="text-danger">(out of stock)</i>`;
    } else { 
        checkbox.disabled = false ;
        tdName.innerHTML = ingredient.name;
    }

     
     tdPrice.textContent = `$${ingredient.price}`;

     editSectionOrder.appendChild(tr);
     tr.appendChild(tdImg);
     tdImg.appendChild(imgThumbnail);
     tr.appendChild(tdName);
     tr.appendChild(tdPrice);
     tr.appendChild(tdCheck);
     tdCheck.appendChild(checkboxDiv);
     checkboxDiv.appendChild(checkbox);

     checkbox.addEventListener('click', () => {
         onCheckIngredient(ingredient.price, checkbox.checked);
     });
 }

 function onCheckIngredient(price, checked) {
     let ele = document.querySelector('#total-cost-number')
     let cost = parseFloat(ele.textContent);
     if (checked) {
         ele.textContent = `${cost + price} `;
     } else if (!checked) {
         ele.textContent = `${cost - price} `;
     }
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

 function updateOrderPrams(pizza) {
     let section = document.querySelector('.order-details');
     section.innerHTML = "";
     let pizzaName = document.createElement('h5');
     let pizzaIngredients = document.createElement('p');
     let isGlutenFree = document.createElement('p');
     let smallText = document.createElement('small');
     let pizzaImg = document.querySelector('#pizza-order-img');

     pizzaName.setAttribute('class', 'card-title');
     pizzaIngredients.setAttribute('class', 'card-text');
     isGlutenFree.setAttribute('class', 'card-text');
     smallText.setAttribute('class', 'text-muted');

     pizzaImg.setAttribute('src', pizza.data.imageUrl);
     pizzaImg.setAttribute('alt', pizza.data.name);

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
             } else {
                 checkbox[i].checked = false;
             }
         }
     })

     // Gluten free
     if (pizza.data.isGlutenFree == true) {
         smallText.textContent = 'Gluten Free';
     } else {
         smallText.textContent = ' ';
     }
     section.appendChild(pizzaName);
     section.appendChild(pizzaIngredients);
     section.appendChild(isGlutenFree);
     isGlutenFree.appendChild(smallText);

     let totalsSection = document.querySelector('.add-to-order');
     totalsSection.innerHTML = "";

     let pizzaPrice = document.createElement('h1');
     //let extrasPrice = document.createElement('p');
     pizzaPrice.setAttribute('id', 'pizzaPriceTitle');
     pizzaPrice.setAttribute('data-id', pizza.data._id);

     pizzaPrice.innerHTML = `Total: $<span id="total-cost-number">${pizza.data.price}</span + extras`;
     //extrasPrice.textContent = `Extras: extras price variable (all added together)`;

     totalsSection.appendChild(pizzaPrice);
     // totalsSection.appendChild(extrasPrice);
 }

 // size dropdown                                    

 function selectSize(ev) {

     let selectedSize = document.querySelector('.sizeBtn');
     selectedSize.innerHTML = "Size";
     selectedSize.textContent = ev.currentTarget.textContent;

 }

 /**************************
      CREATE ORDER DRAFT               
  **************************/

 async function createOrderDraft() {
     // customer is currentUser variable
     console.log('This bitch be buying pizzas', currentUser);

     let url = 'http://127.0.0.1:3030/api/orders';

     let userInput = {
         customer: currentUser.data._id,
         //type: orderType,
         pizzas: pizzaCart
     };
     let jsonData = JSON.stringify(userInput);

     let authToken = JSON.parse(localStorage.getItem(tokenKey));
     let headers = new Headers();

     headers.append('Content-Type', 'application/json;charset=UTF-8');
     headers.append('Authorization', 'Bearer ' + authToken)
     console.log("Order Input:", userInput);

     //create request object
     let req = new Request(url, {
         headers: headers,
         method: 'POST',
         mode: 'cors',
         body: jsonData
     });

     //fetch
     let order = await fetchAPI(req);
     document.querySelector('#orderSummary').setAttribute('data-id', order.data._id);

     orderSummaryList(order);
 }

 async function updateOrder(clickedOn) {
     //console.log('This bitch be buying more pizzas', currentUser);
     let address = null;
     let orderId = document.querySelector('#orderSummary').getAttribute('data-id');
     let orderType = document.querySelector('input[name="orderType"]:checked').value;
     
     if(orderType == 'delivery') address = document.querySelector('#inputAddress').value
         
    
     let url = `http://127.0.0.1:3030/api/orders/${orderId}`;

     let userInput = {
         type: orderType,
         status: clickedOn === 'checkout' ? 'ordered' : 'draft',
         pizzas: pizzaCart,
         address: address
     };
     let jsonData = JSON.stringify(userInput);

     let authToken = JSON.parse(localStorage.getItem(tokenKey));
     let headers = new Headers();

     headers.append('Content-Type', 'application/json;charset=UTF-8');
     headers.append('Authorization', 'Bearer ' + authToken)
     console.log("Order Input:", userInput);

     let req = new Request(url, {
         headers: headers,
         method: 'PATCH',
         mode: 'cors',
         body: jsonData
     });


     let order = await fetchAPI(req);

     // only on resolved promise
     if (clickedOn === 'checkout') {
         //crappy approach
         pizzaCart = [];
         document.getElementById('orderList').innerHTML = "";
         document.querySelector('#subtotal').textContent = `Sub-total: $0.00`;
         document.querySelector('#deliveryFee').textContent = `Delivery Fee: $0.00`;
         document.querySelector('#taxTotal').textContent = `Tax: $0.00`;
         document.querySelector('#totalCost').textContent = `Total: $0.00`;

         document.querySelector('#orderSummary').removeAttribute('data-id'); //not tested
         userNotification("success", signMessage);
         return;
     }
     console.log("Updated order:", order);
     CartDisplay();
 }

 /**************************
  CREATE ORDER SUMMARY LIST              
 **************************/

 function orderSummaryList(order) {
     let orderList = document.getElementById('orderList');
     // get request /api/orders
     // get list of pizzas in order, create forEach loop
     document.querySelector('.cart-count').textContent = pizzaCart.length;
     orderList.innerHTML = "";

     order.data.pizzas.forEach(pizza => {
         let orderItem = document.createElement('li');
         let itemPrice = document.createElement('span');
         let btnSection = document.createElement('span');
         let editBtn = document.createElement('button');
         let deleteBtn = document.createElement('button');
         let underItem = document.createElement('li');
         //let ingredient = document.createElement('small');

         orderItem.setAttribute('class', 'list-group-item d-flex justify-content-between align-items-center');
         editBtn.setAttribute('class', 'btn btn-primary btn-sm mx-1');
         editBtn.setAttribute('type', 'button');
         deleteBtn.setAttribute('class', 'btn btn-primary btn-sm');
         deleteBtn.setAttribute('type', 'button')
         underItem.setAttribute('class', 'list-group-item border-0');
         //ingredient.setAttribute('class', 'text-muted');

         orderItem.textContent = pizza.name;
         itemPrice.textContent = pizza.price;
         editBtn.textContent = 'Edit';
         deleteBtn.textContent = 'Delete';
         //ingredient.textContent = 'list of ingredients here' //pizza.ingredients.join(', ') displays ID

         orderList.appendChild(orderItem);
         orderItem.appendChild(itemPrice);
         orderItem.appendChild(btnSection);
         btnSection.appendChild(editBtn);
         btnSection.appendChild(deleteBtn);
         orderList.appendChild(underItem);
        // underItem.appendChild(ingredient);

         deleteBtn.addEventListener('click', () => {
             console.log('pizza id:', pizza._id);
             let index = pizzaCart.indexOf(pizza._id);
             console.log('index:', index);
             if (index != -1) pizzaCart.splice(index, 1);
             updateOrder('delete');
         })
     })

     //let orderTotalSection = document.querySelector('#orderTotal');

     document.querySelector('#subtotal').textContent = `Sub-total: $${order.data.price}`;
     document.querySelector('#deliveryFee').textContent = 'Delivery Fee: $0.00';
     document.querySelector('#taxTotal').textContent = `Tax: $${order.data.tax}`;
     document.querySelector('#totalCost').textContent = `Total: $${order.data.total}`;
 }

 function addressForm() {
     // Toggles address form
     let orderType = document.querySelector('input[name="orderType"]:checked').value;
     let addressForm = document.querySelector('.address-form');
     //console.log(orderType,'order type');
     if (orderType == 'delivery') {
         console.log('they want delivery');
         addressForm.classList.add('display');
         document.querySelector('#deliveryFee').textContent = 'Delivery Fee: $5.00';

     } else {
         console.log('they want to pick up');
         addressForm.classList.remove('display');
         document.querySelector('#deliveryFee').textContent = 'Delivery Fee: $0.00';
     }
 }

  /**************************
        EMPTY CART             
 **************************/

 // if cart is empty "view cart" button should trigger message that reads "your cart is empty" 
 function CartDisplay() {
    console.log("pizaaa cart", pizzaCart)
    if (pizzaCart.length == 0) {
        document.querySelector('#order-cart').classList.add('hide');
        document.querySelector('#cart-empty').classList.remove('hide');
        document.querySelector('#checkoutButton').disabled = true;

    } else {
        document.querySelector('#cart-empty').classList.add('hide');
        document.querySelector('#order-cart').classList.remove('hide');
        document.querySelector('#checkoutButton').disabled = false;
    }
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
                 let errmessage = `${response.status} ${response.statusText}`;
                 userNotification("warning", errmessage);
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
function userNotification(type, message) {
    let alertstrap = document.querySelector('#alertSection');
    let alertSection = document.createElement('div');
    let alertDiv = document.createElement('p');
    let alertHeading = document.createElement('h4');
    let closebutton = document.createElement('button');
    let buttonspan = document.createElement('span');
    
     alertSection.setAttribute('role','alert');
     alertSection.setAttribute('id','userNotifications');
     closebutton.setAttribute('class','close');
     closebutton.setAttribute('data-dismiss','alert');
     closebutton.setAttribute('aria-label','close');
     buttonspan.setAttribute('aria-hidden', 'true');
     buttonspan.setAttribute('class', 'closebtn');
     buttonspan.innerHTML = '&times;';

     //setTimeout((function () {
     if (type === "success") {
         alertSection.setAttribute('class', 'alert alert-success alert-dismissible fade show');
         alertHeading.textContent = 'BAM! Look at that! You wacked, we stacked!';
     }

     else if (type === "warning") {
         alertSection.setAttribute('class', 'alert alert-warning alert-dismissible fade show');
         alertHeading.textContent = 'WHHHAAAT? Something was wacked and it did not stack!';
     }

     else if (type === "info") {
         alertSection.setAttribute('class', 'alert alert-primary alert-dismissible fade show');
         alertHeading.textContent = 'HOLA from team WACKELSTACKEL!';
     }

     alertDiv.textContent = message + "!";


     closebutton.appendChild(buttonspan);
     alertSection.appendChild(closebutton);
     alertSection.appendChild(alertHeading);
     alertSection.appendChild(alertDiv);
     alertstrap.appendChild(alertSection);
     setTimeout(
        function() {
         let noti = document.getElementById("userNotifications");
          noti.remove();
        },
        5000
      );
 }

 function close() {
     document.querySelector(".closebtn").click();
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

     setPageHeader(target);
 }

/**************************
        PAGE HEADER
 **************************/
 function setPageHeader(target){
    let title = document.querySelector('.title');
    let subTitle = document.querySelector('.lead');
    switch(target) {
        case 'home':
           title.textContent = "WAKELSTACKEL Pizza";
           subTitle.textContent = "Dreams really do come true, when you have the right slice.";
           break;
       case 'menu':
           title.textContent = "Menu";
           subTitle.textContent = "Wakelstackel's Menu";
           break;
       case 'ingredients-view':
           title.textContent = "Ingredients";
           subTitle.textContent = "Wakelstackel's Ingredients Inventory";
           break;
       case 'pizzas-view':
           title.textContent = "Pizzas";
           subTitle.textContent = "Wakelstackel's Pizzas List";
           break;
       case 'users-view':
           title.textContent = "Users";
           subTitle.textContent = "Wakelstackel's Users List";
           break;
       case 'order-view':
           title.textContent = "Order Options";
           subTitle.textContent = "Pick how you want it wacked and stacked!";
           break;
    }
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