// Requiring express npm module
const express = require('express');
const server = express();
const mongoose = require("mongoose");


//support parsing of application/ form data
server.use(express.json());
server.use(express.urlencoded({
  extended: true
}));



// Calling the server-utilities.js file
const utils = require('./src/utils/server-utilities.js');



//setting database using mongoose module
const dbname = "Project"
mongoose.connect("mongodb://localhost:27017/" + dbname,function(err){
    if(err){
        console.log(err);
    }
    else{
        global.db = mongoose.connection.db;
    }
});



// Serving up HTML,CSS and Js static content
const path = require('path');
const dirPath = path.join(__dirname, '/public');
server.use(express.static(dirPath))




// Configuring the Server to use hbs Template Engine
server.set('view engine', 'hbs');



// Configuring the Server to serve dynamic HTML Pages
server.get('/', function(request, response){
    response.render(__dirname + '/views/frontpage');
});

server.get("/login",function(request,response){
    response.render(__dirname + '/views/loginpage');
});

server.get("/signup",function(request,response){
    response.render(__dirname + '/views/signupPage');
});

server.get('/addRestaurant',function(request, response){
    response.render(__dirname + '/views/add_restaurant');    
});

server.get('/manager', function(request, response){
    response.render(__dirname + '/views/manager');
});

server.get('/staff', function(request, response){
    response.render(__dirname + '/views/staff');
});

server.get('/food_items_manager', function(request, response){
    response.render(__dirname + '/views/food_items_manager');
});

server.get('/addItem', function(request, response){
    response.render(__dirname + '/views/add_food_item');
})

server.get('/addStaff', function(request, response){
    response.render(__dirname + '/views/add_staff');
})

server.get('/editFood', function(request, response){
    response.render(__dirname + '/views/edit_food');
})

server.get('/orders', function(request, response){
    response.render(__dirname + '/views/orders');
})

server.get('/staffDetails', function(request, response){
    response.render(__dirname + '/views/staff_details');
})

server.get('/editFoodItem', function(request, response){
    response.render(__dirname + '/views/edit_food_item');
});

server.get('/restaurant', function(request, response){
    response.render(__dirname + '/views/Restaurant');
});




server.post('/signup',function(request,response){
    const name = request.body.name;
    const email = request.body.email;
    const password = request.body.password;
    const pw_confirmation = request.body.password_check;
    if( password == pw_confirmation){
        utils.addCustomer(name, email, password, db, function(status, value){
            if (status === "success"){
                console.log(name + " added in user collection as a customer");
                response.render(__dirname + '/views/signupSuccess');
            }
            else if(status === "exist"){
                response.send(value);
            }
            else{
                response.render(__dirname + "/views/errorPage");
            }
        });
    }

    else{
        response.render(__dirname + '/views/pwError_suPage');
    }
    
    
});



server.post('/add_restaurant',function(request,response){
    const restaurant = request.body.restaurant;
    const manager = request.body.manager;
    const email = request.body.email;
    const password = request.body.password;
    const pw_confirmation = request.body.password_check;
    const address = request.body.address;
    if( password == pw_confirmation){
        utils.addRestaurant(restaurant, manager, email, password, address, db, function(status, value){
            if (status === "success"){
                console.log(manager + "added in user collection as a customer");
                response.render(__dirname + '/views/addRestaurantSuccess');
            }
            else if(status === "exist"){
                response.send(value);
            }
            else{
                response.render(__dirname + "/views/errorPage");
            }
        });
    }

    else{
        response.render(__dirname + '/views/pwError_add_Res');
    }
    
});



server.post('/login',function(request,response){
    const email = request.body.email;
    const password = request.body.password; 
    const type = request.body.type;
    utils.loginUser(email, password, type, db, function(status, value){
        if(status === "success"){ 
            const user = value;
            if(user.type === "customer"){
                response.send("Hello " + user.username); 
            }

            else if(user.type === "manager" || user.type==="staff"){
                response.send("Hello " + user.username + " of " + user.restaurant); 
            }
            
        }
        else{
            if(value === "err"){
                response.render(__dirname + "/views/errorPage");
            }
            else {
                response.send(value);
            }
            
        }
    });
});






// Setting up JSON HTTP Endpoints
server.get('/loginUser', function(request, response){
    utils.loginUser(request.query.username, request.query.password, request.query.type, db);
    response.send("[+] Congrats you exist");
});

server.get('/currentOrders', function(request, response){
    utils.addOrder(request.query.customerName, request.query.foodName, request.query.restaurent,db, function(customerName, foodName, time, 
        restaurent, db){
        // console.log("****TimeToMakeFood*****:   ", time);
        db.collection('current-orders').insertOne({
            customerName: customerName,
            foodName: foodName,
            count: 0,
            start: false,
            done: false,
            time: time,
            restaurent: restaurent
        }, function(error, result){
            if(error){
                return console.log("[-] Unable to process the order");
            }
            // Updating Current-Orders Table
            utils.updateOrders(foodName, restaurent, db);

            // Updating catalog table to increase no. of times food is ordered
            db.collection('catalog').updateMany({
                foodName: foodName,
                restaurent: restaurent
            }, {
                $inc: {
                    numberOfTimesOrdered: 1
                }
            }).then(function(result){
                //console.log(result);
            }).catch(function(error){
                //console.log(error);
            })
        });
    
    });
    response.send("[+] Order Placed!!");
});

server.get('/foodCatalog', function(request, response){
    utils.addFood(request.query.foodName, request.query.timeToPreapare, request.query.imageUrl, request.query.price, request.query.tags, 
        request.query.preaparation, request.query.ingredients, request.query.restaurent, db);
    response.send("[+] Food Added");
});

server.get('/deleteItem', function(request, response){
    //console.log(request.query.foodName, request.query.restaurent);
    utils.deleteFoodItem(request.query.foodName, request.query.restaurent, db);
    response.send("[-] Food Deleted");
});

server.get('/foodDetails', function(request, response){
    utils.extractFoodDetails(request.query.foodName, request.query.restaurent, db, function(foodData){
        response.send(foodData);
    });
})

// HTTP Endpoint to get Restaurent's Food Data
server.get('/getFoodData', function(request, response){
    const foodItems = utils.getRestaurentFood(request.query.restaurent, db, function(foodItems){
        response.send(foodItems)
    });
    
})


//page checking paths





// Starting the server at port 3000
server.listen(3000, function(){
    console.log(`[+] Server Started at Port: 3000`);
});

// Modification ---> restaurent wise count and numberOfTimesOrdered



