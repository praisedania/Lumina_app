import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import User from './User.js';
import Course from './Course.js';
import Lesson from './Lesson.js';
import Enrollment from './Enrollment.js';
import Conversation from './Conversation.js';
import Message from './Message.js';
import InstructorProfile from './InstructorProfile.js';
import Transaction from './Transaction.js';

dotenv.config();

import dbConfig from '../config/database.cjs';

const env = process.env.NODE_ENV || 'development';
const config = {
  ...dbConfig[env],
  logging: false // Keep logging disabled to avoid console clutter
};

let sequelize;
if (config.use_env_variable && process.env[config.use_env_variable]) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

const models = {
  User: User(sequelize, Sequelize.DataTypes),
  Course: Course(sequelize, Sequelize.DataTypes),
  Lesson: Lesson(sequelize, Sequelize.DataTypes),
  Enrollment: Enrollment(sequelize, Sequelize.DataTypes),
  Conversation: Conversation(sequelize, Sequelize.DataTypes),
  Message: Message(sequelize, Sequelize.DataTypes),
  InstructorProfile: InstructorProfile(sequelize, Sequelize.DataTypes),
  Transaction: Transaction(sequelize, Sequelize.DataTypes),
};

// Apply associations
Object.keys(models).forEach(modelName => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

models.sequelize = sequelize;
models.Sequelize = Sequelize;

export default models;
