let parentElement;
let buttonsOpenModal;
let buttonCloseModal;
let removeElement;
let dontRemoveElement;

function openModal(event){
    document.querySelector('.modal').classList.remove('hidden');
    document.querySelector('.overlay').classList.remove('hidden');
    parentElement = (event.srcElement.parentNode).parentNode;
}

function closeModal(){
    document.querySelector('.modal').classList.add('hidden');
    document.querySelector('.overlay').classList.add('hidden');
}

function removeFoodFromDatabase(foodName, restaurent){
    console.log(foodName, restaurent);
    fetch(`http://localhost:3000/deleteItem?foodName=${foodName}&restaurent=${restaurent}`).then(function(response){
        response.json().then(function(data){
            console.log("The Data ---> ", data)
        })
    })
}

function createFoodHtmlContent(foodItemsData, foodList){
    let imgLocation = "/images/" + foodItemsData.imageUrl; 
    let html = `<div class="food_items">
        <div class="food_item_heading"><span class="foodName">${foodItemsData.foodName}</span><span class = "item_span">x</span></div>
        <div class="food_item_img"><img class="food_img" src=${imgLocation} alt=${foodItemsData.foodName} class="image"></div>
        <div class="food_item_price">
            <span class="price">&#8377 ${foodItemsData.price}</span>
            <span class="time_edit">${foodItemsData.timeToPreapare} min</span> <a href="/editFoodItem" class="editButton"><div class="edit"><span class="edit_text">EDIT</span></div></a>
        </div>
    </div>`;
    foodList.insertAdjacentHTML("afterbegin", html);            ////afterbegin
    
}

function activateEditButton(){
    const editButtons = document.querySelectorAll('.editButton');
    for (let i=0; i<editButtons.length; i++){
        editButtons[i].addEventListener('click', function(event){
            const parentElement = event.srcElement.parentElement.parentElement.parentElement.parentElement;
            // querySelector can be used on any DOM element apart from document
            const imageLocation = parentElement.querySelector('.image').src;
            const foodName = parentElement.querySelector('.foodName').textContent;
            // Storing ImageLocation, foodName in LocalStorage
            localStorage.setItem("imageLocation", imageLocation);
            localStorage.setItem("foodName", foodName);

        });
    }
    
}

function getFoodItemsFromDatabase(callback){
    const restaurent = document.querySelector('#heading').firstElementChild.firstElementChild.textContent;
    fetch(`http://localhost:3000/getFoodData?restaurent=${restaurent}`).then(function(response){
        response.json().then(function(data){
            const foodItemsData = data;

            if (foodItemsData){
                const foodList = document.querySelector('#food-list');
                for(let i=0; i<foodItemsData.length; i++){
                    createFoodHtmlContent(foodItemsData[i], foodList, i);
                }

                // Activating the Edit Button in FoodItemBox
                activateEditButton();

                // Creating Variable to activate the modal functionality
                buttonsOpenModal = document.querySelectorAll('.item_span');
                buttonCloseModal = document.querySelector('.close-modal');
                removeElement = document.querySelector('.yes');
                dontRemoveElement = document.querySelector('.no');
                callback(buttonsOpenModal, buttonCloseModal, removeElement, dontRemoveElement);
            }
        })
    })
}

function modal(buttonsOpenModal, buttonCloseModal, removeElement, dontRemoveElement){
    // Work related to opening the modal
    for (let i = 0; i < buttonsOpenModal.length; i++ ){
        buttonsOpenModal[i].addEventListener('click', openModal);
    }

    // Work related to Closing the modal
    buttonCloseModal.addEventListener('click', closeModal);

    // Removing the FoodItem from Database if User selects Yes on Modal Window
    removeElement.addEventListener('click', function(event){
        const foodName = parentElement.firstElementChild.firstElementChild.textContent;     
        const restaurent = document.querySelector('#heading').firstElementChild.firstElementChild.textContent;
        //console.log("FoodName: ", foodName);
        removeFoodFromDatabase(foodName, restaurent);
        console.log('First Child Element ---> ', parentElement.firstElementChild.firstElementChild.textContent);
        parentElement.remove();
        closeModal();
    });

    // Action Taken on clicking on "No" button on modal window
    dontRemoveElement.addEventListener('click', closeModal);
}

getFoodItemsFromDatabase(modal);