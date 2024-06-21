const port = 4000;
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const cors = require("cors");

app.use(express.json());
app.use(cors());

// Database Connection with MongoDb
mongoose.connect("mongodb+srv://Visara:DVWDAlwis@cluster0.0izcjt1.mongodb.net/e-commerce");

// API creation
app.get("/", (req, res) => {
    res.send("Express App is Running");
});

// Image storage Engine
const storage = multer.diskStorage({
    destination: './upload/images',
    filename: (req, file, cb) => {
        return cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({ storage: storage });

// Creating Upload Endpoint for images
app.use('/images', express.static('upload/images'));
app.post("/upload", upload.single('product'), (req, res) => {
    res.json({
        success: 1,
        image_url: `http://localhost:${port}/images/${req.file.filename}`
    });
});

// Schema for creating products
const productSchema = new mongoose.Schema({
    id: {
        type: Number,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    new_price: {
        type: Number,
        required: true,
    },
    old_price: {
        type: Number,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
    available: {
        type: Boolean,
        default: true,
    },
});

const Product = mongoose.model("Product", productSchema);

//Creating API for Adding product
app.post('/addproduct', async (req, res) => {
    let products = await Product.find({});
    let id;
    if (products.length > 0) {
        let last_product_array = products.slice(-1);
        let last_product = last_product_array[0];
        id = last_product.id + 1;
    } else {
        id = 1;
    }
    const product = new Product({
        id: id,
        name: req.body.name,
        image: req.body.image,
        category: req.body.category,
        new_price: parseFloat(req.body.new_price.replace(/,/g, '')),
        old_price: parseFloat(req.body.old_price.replace(/,/g, '')),
    });

    console.log(product);
    await product.save();
    console.log("saved");

    res.json({
        success: true,
        name: req.body.name,
    });
});

//Creating API for Deleting Products
app.post('/removeproduct', async (req, res) => {
    await Product.findOneAndDelete({ id: req.body.id });
    console.log("Removed");
    res.json({
        success: true,
        name: req.body.name
    })
})


//Creating API for getting all products
app.get('/allproducts', async (req, res) => {
    let products = await Product.find({});
    console.log("All products fetched");
    res.send(products);
})


// Creating API to get a single product by ID
app.get('/product/:id', async (req, res) => {
    try {
        const product = await Product.findOne({ id: req.params.id });
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }
        res.json({ success: true, product });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});


// API to update product by ID

app.put('/updateproduct/:id', async (req, res) => {
    const productId = req.params.id;
    
    try {
        const updatedFields = {
            category: req.body.category,
            new_price: parseFloat(req.body.new_price.replace(/,/g, ''))
        };

        const updatedProduct = await Product.findOneAndUpdate(
            { id: productId },
            { $set: updatedFields },
            { new: true }
        );

        if (!updatedProduct) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        res.json({ success: true, product: updatedProduct });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});


//Schema Creating for user model
const Users = mongoose.model('Users', {
    name: {
        type: String,
    },
    email: {
        type: String,
        unique: true,
    },
    password: {
        type: String,
    },
    cartData: {
        type: Object,
    },
    date: {
        type: Date,
        default: Date.now,
    }
})

//Creating Endpoint for registering the user
app.post('/signup', async (req, res) => {
    let check = await Users.findOne({ email: req.body.email });
    if (check) {
        return res.status(400).json({ success: false, errors: "Existing user found with the same Email" })
    }
    let cart = {};
    for (let i = 0; i < 300; i++) {
        cart[i] = 0;
    }

    const user = new Users({
        name: req.body.username,
        email: req.body.email,
        password: req.body.password,
        cartData: cart,
    })

    await user.save();

    const data = {
        user: {
            id: user.id,
        }
    }

    const token = jwt.sign(data, 'secret_ecom');
    res.json({ success: true, token })
})

//Creating End point for user login
app.post('/login', async (req, res) => {
    let user = await Users.findOne({ email: req.body.email })
    if (user) {
        const passCompare = req.body.password === user.password;
        if (passCompare) {
            const data = {
                user: {
                    id: user.id
                }
            }
            const token = jwt.sign(data, 'secret_ecom')
            res.json({ success: true, token });
        } else {
            res.json({
                success: false, errors: "Wrong Password"
            });
        }
    } else {
        res.json({ success: false, errors: "Wrong Email ID" })
    }
})

//Creating Endpoint for newcollection data
app.get('/newcollection', async (req, res) => {
    let products = await Product.find({});
    let newcollection = products.slice(1).slice(-8);
    console.log("Newcollection Fetched");
    res.send(newcollection);
})

//Creating Endpoint for popular in laptops
app.get('/popularinlaptops', async (req, res) => {
    let products = await Product.find({ category: "laptops" })
    let popular_in_laptops = products.slice(0, 4);
    console.log("Popular in laptops fetched");
    res.send(popular_in_laptops);
});

//Creating Endpoint for popular in phones
app.get('/popularinphones', async (req, res) => {
    let products = await Product.find({ category: "phones" })
    let popular_in_phones = products.slice(0, 4);
    console.log("Popular in phones fetched");
    res.send(popular_in_phones);
});

//Creating Endpoint for popular in televisions
app.get('/popularintelevisions', async (req, res) => {
    let products = await Product.find({ category: "televisions" })
    let popular_in_televisions = products.slice(0, 4);
    console.log("Popular in televisions fetched");
    res.send(popular_in_televisions);
});

//creating middleware to fetch user
const fetchUser = async (req, res, next) => {
    const token = req.header('auth-token');
    if (!token) {
        res.status(401).send({ errors: "Please authenticate using valid token" })
    } else {
        try {
            const data = jwt.verify(token, 'secret_ecom');
            req.user = data.user;
            next();
        } catch (error) {
            res.status(401).send({ errors: "Please authenticate using a valid token" })
        }
    }
}

//Creating endpoint for Adding product to cart data
app.post('/addtocart', fetchUser, async (req, res) => {
    console.log("Added", req.body.itemId);
    let userData = await Users.findOne({ _id: req.user.id });
    userData.cartData[req.body.itemId] += 1;
    await Users.findOneAndUpdate({ _id: req.user.id }, { cartData: userData.cartData })
    res.send("Added");
});

//creating endpoint to remove product from cartData
app.post('/removefromcart', fetchUser, async (req, res) => {
    console.log("Removed", req.body.itemId);
    let userData = await Users.findOne({ _id: req.user.id });
    if (userData.cartData[req.body.itemId] > 0)
        userData.cartData[req.body.itemId] -= 1;
    await Users.findOneAndUpdate({ _id: req.user.id }, { cartData: userData.cartData })
    res.send("Removed");
});

//creating endpoint to get cart data
app.post('/getcart', fetchUser, async (req, res) => {
    console.log("GetCart");
    let userData = await Users.findOne({ _id: req.user.id });
    res.json(userData.cartData);
})

app.listen(port, (error) => {
    if (!error) {
        console.log("server running on Port " + port);
    } else {
        console.log("Error: " + error);
    }
});
