    //Add Ingredients
    //TO DO: Figure out how to grab file input when the user adds a picture for the ingredient they are adding. 
    //Mack 

    document.addEventListener('DOMContentLoaded', () => {
        //addListeners();
        createIngredientCard();
    });

    function addListeners() {
        document.getElementById('submitIngredientBtn').addEventListener('click', addIngredients);

    }

    function addIngredients(ev) {
        let productName = document.getElementById('productName').value,
            price = document.getElementById('price').value,
            quantity = document.getElementById('quantity').value;

        //Check if Gluten Free is Checked & Set Value
        if (document.getElementById("isGlutenFree").checked = true) {
            isGlutenFree = true;
        } else {
            isGlutenFree = false;
        }

        //Determine Categorie Picked
        let categoriesSelected = document.getElementById("categories");
        if (categoriesSelected.selectedIndex == 0) {
            console.log('select one answer');

        } else {
            categories = categoriesSelected.options[categoriesSelected.selectedIndex].text;
        }
        ev.preventDefault();
        //define the end point for the request
        let url = "http://127.0.0.1:3030/api/ingredients";

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
        fetch(req)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Guess what. It is not ok. ' + response.status + ' ' + response.statusText);
                } else {
                    // document.getElementById('output').textContent =
                    //     'Hey we got a response from the server! They LOVED our token.';
                    console.log("Mack is the best!!!");
                }
            })
            .catch(err => {
                console.error(err.code + ': ' + err.message);
            })
<<<<<<< HEAD

        }


        function createIngredientCard() {
            let contentDiv = document.querySelector('.card-deck');
            let cardDiv = document.createElement('div');
            let img = document.createElement('img');
            let bodyDiv = document.createElement('div');
            let title = document.createElement('h5');
            let price = document.createElement('p');
            let category = document.createElement('p');
            let quantity = document.createElement('p');
            let gluten = document.createElement('p');
            let btnDiv = document.createElement('div');
            let delBtn = document.createElement('button');
            let editBtn = document.createElement('button');
            let editLink = document.createElement('a');

            contentDiv.appendChild(cardDiv);
            cardDiv.appendChild(img);
            cardDiv.appendChild(bodyDiv);
            bodyDiv.appendChild(title);
            bodyDiv.appendChild(price);
            bodyDiv.appendChild(category);
            bodyDiv.appendChild(quantity);
            bodyDiv.appendChild(gluten);
            cardDiv.appendChild(btnDiv);
            btnDiv.appendChild(editBtn);
            editBtn.appendChild(editLink);
            btnDiv.appendChild(delBtn);

            cardDiv.setAttribute('class', 'card');
            img.setAttribute('class', 'card-img-top');
            img.setAttribute('src', '/css/imgs/cheese.jpg'); // insert image variable
            img.setAttribute('alt', 'Card image cap');
            bodyDiv.setAttribute('class', 'card-body');
            title.setAttribute('class', 'card-title');
            price.setAttribute('class', 'card-text');
            category.setAttribute('class', 'card-text');
            quantity.setAttribute('class', 'card-text');
            gluten.setAttribute('class', 'card-text');
            btnDiv.setAttribute('class', 'btn-group');
            editBtn.setAttribute('class', 'btn btn-sm btn-outline-secondary');
            editLink.setAttribute('class', 'nav-link');
            editLink.setAttribute('href', '/view/admin/ingredient-edit.html');
            delBtn.setAttribute('type', 'button');
            delBtn.setAttribute('class', 'btn btn-sm btn-outline-secondary');


            title.textContent = 'ingredient variable'; // insert ingredient name variable
            price.textContent = 'price variable'; // insert price variable
            category.textContent = 'category variable'; // insert category variable
            quantity.textContent = 'quantity variable'; // insert quantity variable
            gluten.textContent = 'gluten free variable'; // insert gluten variable
            editLink.textContent = 'Edit';
            delBtn.textContent = 'Delete';

        }
=======

    }
>>>>>>> da4bda08fbc65859b5adba4f8ec856a890e85b5e
