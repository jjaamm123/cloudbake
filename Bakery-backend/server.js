const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const mongoose = require('mongoose');


dotenv.config();


const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cloudbakes', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB Connected'))
.catch(err => {
    console.error('MongoDB connection error:', err);
    console.log('⚠️  Continuing without database...');
});



app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to CloudBakes API!',
        endpoints: {
            auth: '/api/auth',
            products: '/api/products',
            orders: '/api/orders',
            health: '/api/health'
        }
    });
});


app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});


app.get('/api/products', (req, res) => {
    res.json({
        success: true,
        data: [
            {
                id: 1,
                name: "Chocolate Cake",
                description: "Rich chocolate cake with buttercream",
                price: 29.99,
                category: "cake"
            },
            {
                id: 2,
                name: "Red Velvet Cupcake",
                description: "Classic red velvet with cream cheese frosting",
                price: 4.99,
                category: "cupcake"
            }
        ]
    });
});


app.get('/api/auth/test', (req, res) => {
    res.json({ 
        success: true,
        message: 'Auth endpoint working' 
    });
});


app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    
    console.log('Login attempt:', { email, password });
    
 
    const points = email.includes('wholesale') ? 2500 : 
                   email.includes('customer') ? 850 : 100;
    

    const tier = points >= 2000 ? 'platinum' :
                 points >= 1000 ? 'gold' :
                 points >= 500 ? 'silver' : 'bronze';
    

    const role = email.includes('wholesale') ? 'wholesale' : 'customer';
    
    res.json({
        success: true,
        data: {
            _id: 'user_' + Date.now(),
            name: email.split('@')[0] || 'User',
            email: email,
            role: role,
            points: points,
            tier: tier,
            token: 'jwt_test_token_' + Date.now()
        }
    });
});


app.post('/api/auth/register', (req, res) => {
    const { name, email, password } = req.body;
    
    console.log('Register attempt:', { name, email });
    

    const points = 100;
    const tier = 'bronze';
    
    res.json({
        success: true,
        data: {
            _id: 'user_' + Date.now(),
            name: name,
            email: email,
            role: 'customer',
            points: points,
            tier: tier,
            token: 'jwt_test_token_' + Date.now()
        }
    });
});


app.get('/api/auth/profile', (req, res) => {
    const token = req.headers.authorization;
    const { email } = req.query;
    
    console.log('Fetching profile for:', email);
    

    const mockProfiles = {
        'customer@cloudbake.com': {
            name: 'Alex Morgan',
            email: 'customer@cloudbake.com',
            role: 'customer',
            points: 850,
            tier: 'silver',
            orders: 12,
            joinDate: '2024-01-15',
            phone: '(555) 123-4567',
            birthday: '1990-05-15',
            favorite: 'Chocolate Cake',
            addresses: [
                {
                    type: 'home',
                    street: '123 Baker Street',
                    city: 'New York',
                    state: 'NY',
                    zip: '10001',
                    country: 'USA',
                    isDefault: true
                }
            ]
        },
        'wholesale@cloudbake.com': {
            name: 'Sarah Chen',
            email: 'wholesale@cloudbake.com',
            role: 'wholesale',
            points: 2500,
            tier: 'platinum',
            orders: 45,
            joinDate: '2023-08-22',
            phone: '(555) 987-6543',
            birthday: '1992-11-30',
            favorite: 'Red Velvet Tower'
        },
        'test@example.com': {
            name: 'Test User',
            email: 'test@example.com',
            role: 'customer',
            points: 100,
            tier: 'bronze',
            orders: 0,
            joinDate: new Date().toISOString().split('T')[0],
            phone: '(555) 000-0000',
            birthday: '',
            favorite: 'None yet'
        }
    };
    
    const profile = mockProfiles[email] || {
        name: email?.split('@')[0] || 'User',
        email: email || 'unknown@example.com',
        role: 'customer',
        points: 100,
        tier: 'bronze',
        orders: 0,
        joinDate: new Date().toISOString().split('T')[0],
        phone: '',
        birthday: '',
        favorite: 'None yet'
    };
    
    res.json({
        success: true,
        data: profile
    });
});


app.put('/api/auth/profile', (req, res) => {
    const { name, email, phone, birthday } = req.body;
    const token = req.headers.authorization;
    
    console.log('Updating profile:', { name, email, phone, birthday });
    

    res.json({
        success: true,
        message: 'Profile updated successfully',
        data: {
            name,
            email,
            phone,
            birthday,
            updatedAt: new Date().toISOString()
        }
    });
});


app.get('/api/orders', (req, res) => {
    const token = req.headers.authorization;
    

    const mockOrders = [
        {
            id: 'CB-78945',
            date: '2024-03-15',
            status: 'delivered',
            total: 39.99,
            items: [
                { name: 'Cloud Nine Cake', quantity: 1, price: 24.99 },
                { name: 'Fresh-Baked Donuts', quantity: 2, price: 7.50 }
            ]
        },
        {
            id: 'CB-78944',
            date: '2024-03-10',
            status: 'preparing',
            total: 18.00,
            items: [
                { name: 'Fluffy Muffins', quantity: 1, price: 18.00 }
            ]
        }
    ];
    
    res.json({
        success: true,
        data: {
            orders: mockOrders,
            total: mockOrders.length
        }
    });
});


app.post('/api/auth/test-login', (req, res) => {
    const { email, password } = req.body;
    
    res.json({
        success: true,
        data: {
            _id: 'test123',
            name: 'Test User',
            email: email || 'test@example.com',
            role: 'customer',
            points: 500,
            tier: 'silver',
            token: 'test_jwt_token_123'
        }
    });
});

app.post('/api/auth/test-register', (req, res) => {
    res.json({
        success: true,
        data: {
            _id: 'test123',
            name: 'Test User',
            email: 'test@example.com',
            role: 'customer',
            points: 100,
            tier: 'bronze',
            token: 'test_jwt_token_123'
        }
    });
});


app.use((req, res, next) => {
    res.status(404).json({ 
        success: false,
        message: `Route not found: ${req.method} ${req.originalUrl}`
    });
});


app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ 
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📡 API available at http://localhost:${PORT}`);
    console.log(`🌐 Try: http://localhost:${PORT}/api/products`);
    console.log(`🔐 Test auth: POST http://localhost:${PORT}/api/auth/login`);
});


process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err);
});