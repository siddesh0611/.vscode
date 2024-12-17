const path = require('path');
const express = require('express');
// const helmet=require('helmet')
const dotenv = require('dotenv');
dotenv.config();
const bodyParser = require('body-parser');
var cors = require('cors')
const sequelize = require('./util/database');

const app = express();
// app.use(helmet())
app.use(cors())
app.use(bodyParser.json());

// const User = require('./models/users');
// const Expense=require('./models/expenses');
// const Order=require('./models/orders');
// const Forgotpassword=require('./models/forgotpassword')
// const Filelink=require('./models/filelink')
//importing database
const sequelize = require('./util/database');
const User = require('./models/user');
const Expense = require('./models/expense');
const Order = require('./models/orders');
const ForgotPassword = require('./models/forgotPassword');

// User.hasMany(Expense)
// Expense.belongsTo(User)

// User.hasMany(Order)
// Order.belongsTo(User)


// User.hasMany(Forgotpassword);
// Forgotpassword.belongsTo(User);

// User.hasMany(Filelink);
// Filelink.belongsTo(User)

User.hasMany(Expense);
Expense.belongsTo(User);

User.hasMany(Order);
Order.belongsTo(User);

User.hasMany(ForgotPassword);
ForgotPassword.belongsTo(User);



// const UserRoutes=require('./routes/user')
// const ExpenseRoutes=require('./routes/expense')
// const PremiumRoutes=require('./routes/premium')
// const ForgotpasswordRoutes=require('./routes/forgotpassword')
// const RazorpayRoutes=require('./routes/razorpay')

//routes for user
const userLogin = require('./routes/user');
const userExpence = require('./routes/expense');
const purchaseRoute = require('./routes/purchase');
const premiunRoute = require('./routes/premium');
const forgotpasswordRoute = require('./routes/forgotPassword');



// app.use(UserRoutes)
// app.use(ExpenseRoutes)
// app.use(PremiumRoutes)
// app.use(ForgotpasswordRoutes)
// app.use(RazorpayRoutes)
app.use('/password', forgotpasswordRoute);
app.use('/premium', premiunRoute);
app.use('/purchase', purchaseRoute);
app.use('/user', userLogin);
app.use('/user', userExpence);


app.use((req, res) => {
    console.log('urlll', req.url)
    res.sendFile(path.join(__dirname, `public/${req.url}`));

})
sequelize
    .sync()
    .then(result => {
        console.log(result)
        app.listen(4000)
    })
    .catch((err) => {
        console.log(err)
    })