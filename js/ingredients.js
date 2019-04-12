    //Add Ingredients
    //TO DO: Figure out how to grab file input when the user adds a picture for the ingredient they are adding. 
    //Mack 

    document.addEventListener('DOMContentLoaded', () => {
        addListeners();
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

    }