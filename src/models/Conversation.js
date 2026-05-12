import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Conversation extends Model {
    static associate(models) {
      Conversation.belongsTo(models.Course, { foreignKey: 'course_id', as: 'course' });
      Conversation.hasMany(models.Message, { foreignKey: 'conversation_id', as: 'messages' });
    }
  }

  Conversation.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    type: {
      type: DataTypes.ENUM('room', 'dm'),
      allowNull: false
    },
    course_id: {
      type: DataTypes.UUID,
      allowNull: true
    },
    participants: {
      type: DataTypes.ARRAY(DataTypes.UUID),
      defaultValue: []
    }
  }, {
    sequelize,
    modelName: 'Conversation',
  });

  return Conversation;
};
