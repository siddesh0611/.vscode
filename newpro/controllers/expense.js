const { where } = require('sequelize');
const Expense = require('../models/expense');
const User = require('../models/user');
const sequelize = require('../util/database');



exports.postExpense = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { expenseName, expenseAmount } = req.body;
        const userId = req.user.id;
        const totalExpense = Number(expenseAmount) + Number(req.user.totalExpense)

        const newExpense = await req.user.createExpense({ expenseName, expenseAmount }, { transaction: t });
        await User.update({ totalExpense: totalExpense }, { where: { id: userId }, transaction: t });

        await t.commit();
        res.status(201).json({ newExpense });

    } catch (err) {
        console.log('transaction failed', err)
        await t.rollback();
        res.status(500).json({ error: err.message });
    }
};
exports.getExpense = async (req, res) => {
    try {
        const page = +req.query.page || 1;
        const NUMBER_OF_EXPENSE_PER_PAGE = +req.query.rows || 2;

        const totalItems = await Expense.count({ where: { userId: req.user.id } });

        const expenses = await Expense.findAll({
            where: { userId: req.user.id },
            offset: (page - 1) * NUMBER_OF_EXPENSE_PER_PAGE,
            limit: NUMBER_OF_EXPENSE_PER_PAGE,
        });

        const pagination = {
            currentPage: page,
            hasNextPage: NUMBER_OF_EXPENSE_PER_PAGE * page < totalItems,
            nextPage: page + 1,
            hasPrevPage: page > 1,
            prevPage: page - 1,
            lastPage: Math.ceil(totalItems / NUMBER_OF_EXPENSE_PER_PAGE),
        };

        res.status(200).json({ expenses, pagination, success: true });

    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Error inside getExpense', err, success: false });
    }
};

// exports.getExpense = async (req, res) => {
//     try {
//         const userId = req.user.id;
//         const expenses = await Expense.findAll({ where: { userId } });
//         res.status(200).json({ expenses });
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// };

exports.deleteExpense = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const id = req.params.id;
        const userId = req.user.id;

        const expense = await Expense.findOne({ where: { id, userId } });
        if (!expense) {
            return res.status(404).json({ message: 'Expense not found' });
        }

        const newTotal = Number(req.user.totalExpense) - Number(expense.expenseAmount);

        await User.update(
            { totalExpense: newTotal },
            { where: { id: userId }, transaction: t })
        await expense.destroy({ transaction: t });

        await t.commit();
        res.status(204).json({ message: 'Expense deleted' });
    } catch (err) {
        await t.rollback();
        res.status(500).json({ error: err.message });
    }
};
