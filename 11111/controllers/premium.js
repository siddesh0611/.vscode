// const User = require('../models/userDetails');
// const sequelize = require('../util/database');
// const Expense = require('../models/expense');
// exports.getPremium=async(req,res,next)=>{
//     try{
//         const users=await User.findAll()
//         const expenses=await Expense.findAll()
//         const userAggregatedExpenses={}
//         expenses.forEach((expense)=>{
//             if(userAggregatedExpenses[expense.userId]){
//                 userAggregatedExpenses[expense.userId] = userAggregatedExpenses[expense.userId] + expense.expenseamount
//             }else{
//                 userAggregatedExpenses[expense.userId]=expense.expenseamount
//             }
//         })
//         console.log(userAggregatedExpenses)
//         var userLeaderBoardDetails=[];
//         users.forEach((user)=>{
//             userLeaderBoardDetails.push({name:user.name,total_cost:(userAggregatedExpenses[user.id]||0)})
//         })
//         userLeaderBoardDetails.sort((a,b)=>b.total_cost-a.total_cost)
//         console.log(userLeaderBoardDetails)
//         res.status(200).json(userLeaderBoardDetails)
//     }catch(err){
//         console.log(err)
//         res.status(500).json(err)
//     }
// }

const User = require('../models/user');
const sequelize = require('../util/database');
const Expense = require('../models/expense');

exports.getPremium = async (req, res, next) => {
    try {
        const leaderboardofusers = await User.findAll({
            attributes: ['id', 'userName', 'totalExpense'],
            order: [['totalExpense', 'DESC']]
        });
        // console.log(leaderboardofusers);

        res.status(200).json(leaderboardofusers);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'An error occurred while fetching premium users' });
    }
};


// exports.getPremium = async (req, res, next) => {
//     try {
//         const leaderboardofusers = await User.findAll({
//             attributes: ['id', 'userName', [sequelize.fn('sum', sequelize.col('expenses.expenseAmount')), 'total_cost']],
//             include: [
//                 {
//                     model: Expense,
//                     attributes: []
//                 }
//             ],
//             group: ['user.id'],
//             order: [['total_cost', 'DESC']]
//         });

//         res.status(200).json(leaderboardofusers);
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ error: 'An error occurred while fetching premium users' });
//     }
// };

const { Op } = require('sequelize');


exports.report = async (req, res) => {
    try {
        const user = req.user;
        const today = new Date();
        const currentWeek = new Date(today.setDate(today.getDate() - today.getDay())); // Start of the week (Sunday)
        const currentMonth = new Date(today.getFullYear(), today.getMonth(), 1); // Start of the month
        const currentYear = new Date(today.getFullYear(), 0, 1); // Start of the year

        const weekly = await user.getExpenses({ where: { createdAt: { [Op.gte]: currentWeek } } });
        const monthly = await user.getExpenses({ where: { createdAt: { [Op.gte]: currentMonth } } });
        const yearly = await user.getExpenses({ where: { createdAt: { [Op.gte]: currentYear } } });

        res.status(200).json({ weekly, monthly, yearly });

    } catch (err) {
        console.error('inside report', err);
        res.status(500).json({ error: err.message });
    }
};

