import models from '../models/index.js';

export const saveBankDetails = async (req, res) => {
  try {
    const { bank_name, bank_code, account_number, account_name } = req.body;

    // 1. Validation
    if (!bank_name || !bank_code || !account_number || !account_name) {
      return res.status(400).json({
        status: 'error',
        message: 'All bank details (bank_name, bank_code, account_number, account_name) are required'
      });
    }

    const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
    if (!paystackSecret) {
      console.error('PAYSTACK_SECRET_KEY is not defined in environment variables');
      return res.status(500).json({
        status: 'error',
        message: 'Payment configuration error. Please contact admin.'
      });
    }

    // 2. Call Paystack Subaccount API
    console.log(`Creating Paystack subaccount for instructor ${req.user.name} (${req.user.email})`);
    const paystackResponse = await fetch('https://api.paystack.co/subaccount', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${paystackSecret}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        business_name: account_name,
        settlement_bank: bank_code,
        account_number: account_number,
        percentage_charge: 20
      })
    });

    const paystackData = await paystackResponse.json();

    if (!paystackResponse.ok || !paystackData.status) {
      console.error('Paystack subaccount creation failed:', paystackData);
      return res.status(400).json({
        status: 'error',
        message: paystackData.message || 'Failed to create subaccount with Paystack'
      });
    }

    const subaccountCode = paystackData.data.subaccount_code;
    console.log(`Successfully created Paystack subaccount: ${subaccountCode}`);

    // 3. Save or Update InstructorProfile
    let profile = await models.InstructorProfile.findOne({
      where: { user_id: req.user.id }
    });

    if (profile) {
      profile.bank_name = bank_name;
      profile.bank_code = bank_code;
      profile.account_number = account_number;
      profile.account_name = account_name;
      profile.paystack_subaccount_code = subaccountCode;
      await profile.save();
    } else {
      profile = await models.InstructorProfile.create({
        user_id: req.user.id,
        bank_name,
        bank_code,
        account_number,
        account_name,
        paystack_subaccount_code: subaccountCode
      });
    }

    return res.status(200).json({
      status: 'success',
      message: 'Bank details saved and subaccount created successfully',
      data: {
        id: profile.id,
        bank_name: profile.bank_name,
        account_number: profile.account_number,
        account_name: profile.account_name,
        paystack_subaccount_code: profile.paystack_subaccount_code
      }
    });

  } catch (error) {
    console.error('Error in saveBankDetails:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error while saving bank details'
    });
  }
};

export const getEarningsStats = async (req, res) => {
  try {
    const instructorId = req.user.id;

    // 1. Calculate aggregated stats using Sequelize aggregate operations
    // We join Transaction with Course to filter transactions belonging to the instructor's courses
    const statsResult = await models.Transaction.findOne({
      attributes: [
        [models.sequelize.fn('COALESCE', models.sequelize.fn('SUM', models.sequelize.col('instructor_share')), 0), 'totalEarnings'],
        [models.sequelize.fn('COUNT', models.sequelize.col('Transaction.id')), 'totalCoursesSold']
      ],
      include: [{
        model: models.Course,
        as: 'course',
        where: { instructor_id: instructorId },
        attributes: []
      }],
      where: { status: 'success' },
      raw: true
    });

    const totalEarnings = parseFloat(statsResult.totalEarnings || 0);
    const totalCoursesSold = parseInt(statsResult.totalCoursesSold || 0, 10);

    // 2. Fetch the last 10 successful sales
    const recentSales = await models.Transaction.findAll({
      where: { status: 'success' },
      include: [
        {
          model: models.Course,
          as: 'course',
          where: { instructor_id: instructorId },
          attributes: ['title']
        },
        {
          model: models.User,
          as: 'student',
          attributes: ['name', 'email']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: 10
    });

    // Formulate formatted Sales object
    const formattedSales = recentSales.map(sale => ({
      courseTitle: sale.course?.title || 'Unknown Course',
      date: sale.createdAt,
      username: sale.student?.name || sale.student?.email || 'Student',
      amount: parseFloat(sale.total_amount)
    }));

    return res.status(200).json({
      status: 'success',
      data: {
        totalEarnings,
        totalCoursesSold,
        recentSales: formattedSales
      }
    });

  } catch (error) {
    console.error('Error in getEarningsStats:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error while fetching earnings statistics'
    });
  }
};
