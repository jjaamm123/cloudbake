const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/product');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const products = [
    {
        name: "Cloud Nine Cake",
        description: "Fluffy vanilla sponge with cloud buttercream and delicate decorations.",
        price: 1499, // NPR
        category: "cake",
        image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
        rating: 5.0,
        isAvailable: true
    },
    {
        name: "Chocolate Fudge Cake",
        description: "Rich chocolate layers with fudge frosting and chocolate shavings.",
        price: 1200, // NPR
        category: "cake",
        image: "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
        rating: 4.8,
        isAvailable: true
    },
    {
        name: "Red Velvet Dream",
        description: "Classic red velvet with cream cheese frosting and red velvet crumbs.",
        price: 1599, // NPR
        category: "cake",
        image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
        rating: 4.9,
        isAvailable: true
    },

    {
        name: "Fresh-Baked Croissant (2pcs)",
        description: "Buttery, flaky croissant with golden crust, baked fresh daily.",
        price: 100, // NPR
        category: "pastry",
        image: "img/croissant.jpg",
        rating: 4.7,
        isAvailable: true
    },
    {
        name: "Fluffy Muffins (Pack of 6)",
        description: "Moist muffins with a fluffy texture and rich homemade flavor.",
        price: 180, // NPR
        category: "pastry",
        image: "img/muffins.jpg",
        rating: 4.8,
        isAvailable: true
    },
    {
        name: "Fruit Tart",
        description: "Sweet pastry crust filled with custard and topped with fresh seasonal fruits.",
        price: 200, // NPR
        category: "pastry",
        image: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
        rating: 4.6,
        isAvailable: true
    },

    {
        name: "Fresh-Baked Donuts (Pack of 3)",
        description: "Fluffy donuts baked fresh daily with a variety of glazes and toppings.",
        price: 150, // NPR
        category: "donuts",
        image: "img/donuts.jpg",
        rating: 4.5,
        isAvailable: true
    },
    {
        name: "Classic Glazed Donuts (Pack of 6)",
        description: "Soft, pillowy donuts with a sweet, shiny glaze that melts in your mouth.",
        price: 220, // NPR
        category: "donuts",
        image: "https://images.unsplash.com/photo-1551106652-a5bcf4b29ab6?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
        rating: 4.9,
        isAvailable: true
    },
    {
        name: "Chocolate Sprinkle Donuts (Pack of 4)",
        description: "Chocolate glazed donuts topped with colorful sprinkles.",
        price: 180, // NPR
        category: "donuts",
        image: "https://images.unsplash.com/photo-1626094309830-abbb0c99da4a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
        rating: 4.7,
        isAvailable: true
    },

    {
        name: "Artisan Sourdough",
        description: "Traditional sourdough with crisp crust and tangy, airy interior.",
        price: 599, // NPR
        category: "breads",
        image: "https://images.unsplash.com/photo-1549931319-a545dcf3bc73?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
        rating: 4.8,
        isAvailable: true
    },
    {
        name: "Buttery Brioche",
        description: "Rich, tender bread with high egg and butter content.",
        price: 799, // NPR
        category: "breads",
        image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
        rating: 4.9,
        isAvailable: true
    },

    {
        name: "Kulfi-Inspired Pastry",
        description: "Flaky pastry infused with traditional kulfi flavors and pistachios.",
        price: 499, // NPR
        category: "seasonal",
        image: "img/o-kulfi.jpg",
        rating: 5.0,
        isAvailable: true
    },
    {
        name: "Pumpkin Spice Muffins (Pack of 6)",
        description: "Warm spiced muffins with pumpkin puree and cream cheese filling.",
        price: 200, // NPR
        category: "seasonal",
        image: "https://images.unsplash.com/photo-1483695028939-5bb13f8648b0?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
        rating: 4.7,
        isAvailable: true
    }
];

const importData = async () => {
    try {
        console.log(' Deleting old products...');
        await Product.deleteMany(); 

        console.log(' Planting new products...');
        await Product.insertMany(products);

        console.log('Data Imported Successfully!');
        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

importData();