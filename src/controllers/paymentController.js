import crypto from 'crypto';
import models from '../models/index.js';

export const initializeCheckout = async (req, res) => {
  try {
    const { courseId } = req.body;

    if (!courseId) {
      return res.status(400).json({
        status: 'error',
        message: 'courseId is required'
      });
    }

    // 1. Fetch Course and verify it exists
    const course = await models.Course.findByPk(courseId);
    if (!course) {
      return res.status(404).json({
        status: 'error',
        message: 'Course not found'
      });
    }

    // 2. Check if student is already enrolled in this course
    const existingEnrollment = await models.Enrollment.findOne({
      where: { user_id: req.user.id, course_id: courseId }
    });

    if (existingEnrollment) {
      return res.status(400).json({
        status: 'error',
        message: 'You are already enrolled in this course'
      });
    }

    // 3. If Course is Free (Price === 0), Bypass Paystack entirely
    if (parseFloat(course.price) === 0) {
      console.log(`Bypassing Paystack for free course: ${course.title}. Enrolling student ${req.user.id} immediately.`);
      
      const enrollment = await models.Enrollment.create({
        user_id: req.user.id,
        course_id: courseId,
        completed_lesson_ids: []
      });

      return res.status(200).json({
        status: 'success',
        message: 'Enrolled in free course successfully',
        data: {
          enrollmentId: enrollment.id,
          free: true
        }
      });
    }

    // 4. If Course is Paid, Fetch Instructor Payout Account Details
    const instructorProfile = await models.InstructorProfile.findOne({
      where: { user_id: course.instructor_id }
    });

    if (!instructorProfile || !instructorProfile.paystack_subaccount_code) {
      return res.status(400).json({
        status: 'error',
        message: 'This course is currently unavailable for purchase. The instructor has not set up payout details.'
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

    // 5. Calculate splits (Platform takes 20%, Instructor takes 80%)
    const totalAmount = parseFloat(course.price);
    const platformShare = totalAmount * 0.20;
    const instructorShare = totalAmount * 0.80;

    // 6. Create a pending Transaction record
    const transaction = await models.Transaction.create({
      userId: req.user.id,
      courseId: courseId,
      total_amount: totalAmount,
      platform_share: platformShare,
      instructor_share: instructorShare,
      status: 'pending'
    });

    // Generate unique gateway reference mapping back to this transaction
    const gatewayReference = `ref_${transaction.id}`;
    transaction.gateway_reference = gatewayReference;
    await transaction.save();

    // 7. Call Paystack Transaction Initialize API
    console.log(`Initializing checkout for course: ${course.title}. Amount: ${totalAmount}. Reference: ${gatewayReference}`);
    const paystackResponse = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${paystackSecret}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: req.user.email,
        amount: Math.round(totalAmount * 100), // convert to kobo
        reference: gatewayReference,
        subaccount: instructorProfile.paystack_subaccount_code,
        bearer: 'subaccount', // instructor absorbs paystack gateway fee
        metadata: {
          userId: req.user.id,
          courseId: courseId,
          transactionId: transaction.id
        }
      })
    });

    const paystackData = await paystackResponse.json();

    if (!paystackResponse.ok || !paystackData.status) {
      console.error('Paystack transaction initialization failed:', paystackData);
      
      // Update transaction status to failed
      transaction.status = 'failed';
      await transaction.save();

      return res.status(400).json({
        status: 'error',
        message: paystackData.message || 'Failed to initialize payment checkout with Paystack'
      });
    }

    // 8. Return the authorization URL to the client
    return res.status(200).json({
      status: 'success',
      message: 'Checkout initialized successfully',
      data: {
        authorization_url: paystackData.data.authorization_url,
        reference: gatewayReference,
        free: false
      }
    });

  } catch (error) {
    console.error('Error in initializeCheckout:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error while initializing checkout'
    });
  }
};

export const handleWebhook = async (req, res) => {
  try {
    const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
    if (!paystackSecret) {
      console.error('PAYSTACK_SECRET_KEY is not defined in environment variables');
      return res.status(500).json({ status: 'error', message: 'Payment configuration error' });
    }

    // 1. Verify Signature
    const signature = req.headers['x-paystack-signature'];
    if (!signature) {
      console.error('Missing x-paystack-signature header');
      return res.status(401).json({ status: 'error', message: 'Missing signature header' });
    }

    const hash = crypto
      .createHmac('sha512', paystackSecret)
      .update(req.body) // req.body is raw Buffer because of Phase 2
      .digest('hex');

    if (hash !== signature) {
      console.error('Invalid signature hash calculated');
      return res.status(401).json({ status: 'error', message: 'Invalid webhook signature' });
    }

    // 2. Parse event data
    const event = JSON.parse(req.body.toString('utf8'));
    console.log(`Received Paystack Webhook Event: ${event.event}`);

    // 3. Process Success Charge
    if (event.event === 'charge.success') {
      const { reference, amount, metadata } = event.data;
      const { userId, courseId } = metadata || {};

      if (!userId || !courseId) {
        console.error('Webhook payload is missing metadata fields:', metadata);
        return res.status(400).json({ status: 'error', message: 'Missing metadata in payload' });
      }

      const paidAmount = parseFloat(amount) / 100;
      const platformShare = paidAmount * 0.20;
      const instructorShare = paidAmount * 0.80;

      console.log(`Webhook charge.success! Ref: ${reference}, User: ${userId}, Course: ${courseId}, Paid: ${paidAmount}`);

      // Perform idempotency check and update inside a Sequelize transaction
      await models.sequelize.transaction(async (t) => {
        // Find existing transaction by reference
        const transaction = await models.Transaction.findOne({
          where: { gateway_reference: reference },
          transaction: t
        });

        if (!transaction) {
          // If transaction wasn't found (initialized elsewhere or missing), create a success transaction record
          console.warn(`Transaction for reference ${reference} not found in DB. Creating a new success record.`);
          await models.Transaction.create({
            userId,
            courseId,
            gateway_reference: reference,
            total_amount: paidAmount,
            platform_share: platformShare,
            instructor_share: instructorShare,
            status: 'success'
          }, { transaction: t });
        } else {
          // Idempotency: check if transaction is already marked success
          if (transaction.status === 'success') {
            console.log(`Transaction ${reference} is already marked success. Webhook handled idempotently.`);
            return; // Exit transaction block early
          }

          // Update existing transaction
          transaction.status = 'success';
          transaction.total_amount = paidAmount;
          transaction.platform_share = platformShare;
          transaction.instructor_share = instructorShare;
          await transaction.save({ transaction: t });
        }

        // Check if student is already enrolled to prevent duplicates
        const existingEnrollment = await models.Enrollment.findOne({
          where: { user_id: userId, course_id: courseId },
          transaction: t
        });

        if (!existingEnrollment) {
          console.log(`Writing Enrollment in DB for Student ${userId} to Course ${courseId}`);
          await models.Enrollment.create({
            user_id: userId,
            course_id: courseId,
            completed_lesson_ids: []
          }, { transaction: t });
        } else {
          console.log(`Student ${userId} is already enrolled. Skipping enrollment creation.`);
        }
      });

      // 4. Socket.io Integration (Execute post-commit)
      try {
        const course = await models.Course.findByPk(courseId);
        if (course) {
          const io = req.app.get('socketio');
          if (io) {
            const roomName = `instructor_dashboard_${course.instructor_id}`;
            console.log(`Emitting live sale notification to instructor dashboard room: ${roomName}`);
            io.to(roomName).emit('live_sale_notification', {
              courseName: course.title,
              instructorShare: instructorShare,
              totalPaid: paidAmount,
              timestamp: new Date()
            });
          }
        }
      } catch (err) {
        console.error('Error emitting live socket sale notification:', err);
      }
    }

    // Always acknowledge event receipt to Paystack
    return res.status(200).json({
      status: 'success',
      message: 'Paystack webhook processed successfully'
    });

  } catch (error) {
    console.error('Error in handleWebhook:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error while processing webhook'
    });
  }
};
