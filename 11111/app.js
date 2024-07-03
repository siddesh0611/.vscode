//importing requires
const express = require('express');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const morgan = require('morgan');
const fs = require('fs');

//importing database
const sequelize = require('./util/database');
const User = require('./models/user');
const Expense = require('./models/expense');
const Order = require('./models/orders');
const ForgotPassword = require('./models/forgotPassword');
const FileLink = require('./models/fileLink');

//routes for user
const userLogin = require('./routes/user');
const userExpence = require('./routes/expense');
const purchaseRoute = require('./routes/purchase');
const premiunRoute = require('./routes/premium');
const forgotpasswordRoute = require('./routes/forgotPassword');

// const { default: orders } = require('razorpay/dist/types/orders');

const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' })

const app = express();
app.use(cors());

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(helmet());
app.use(morgan('combined', { stream: accessLogStream }));

//connecting routes
app.use('/password', forgotpasswordRoute);
app.use('/premium', premiunRoute);
app.use('/purchase', purchaseRoute);
app.use('/user', userExpence);
app.use('/user', userLogin);

//for frontned deplayment
app.use((req, res) => {
    console.log('url', req.url);
    res.sendFile(path.join(__dirname, `public/${req.url}`))
})

//database relations
User.hasMany(Expense);
Expense.belongsTo(User);

User.hasMany(Order);
Order.belongsTo(User);

User.hasMany(ForgotPassword);
ForgotPassword.belongsTo(User);

User.hasMany(FileLink);
FileLink.belongsTo(User);



sequelize.sync()
    .then(result => {
        app.listen(3000);
    })
    .catch(err => {
        console.log(err);
    });
