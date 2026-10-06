export default (sequelize, DataTypes) => {
  const InstructorProfile = sequelize.define('InstructorProfile', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    bank_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    bank_code: {
      type: DataTypes.STRING,
      allowNull: false
    },
    account_number: {
      type: DataTypes.STRING,
      allowNull: false
    },
    account_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    paystack_subaccount_code: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true
    }
  }, {
    timestamps: true
  });

  InstructorProfile.associate = (models) => {
    InstructorProfile.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
  };

  return InstructorProfile;
};
