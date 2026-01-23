
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;


        const generateToken = (id) => {
            return `jwt_token_${id}_${Date.now()}`;
        };


        res.json({
            _id: 'user_' + Date.now(),
            name: email.split('@')[0], 
            email: email,
            role: 'user',
            token: generateToken('test')
        });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};