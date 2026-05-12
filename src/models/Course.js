export default (sequelize, DataTypes) => {
  const Course = sequelize.define('Course', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    instructor_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    category: {
      type: DataTypes.STRING,
      allowNull: true
    },
    thumbnail_url: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    timestamps: true
  });

  Course.associate = (models) => {
    Course.belongsTo(models.User, { as: 'Instructor', foreignKey: 'instructor_id' });
    Course.hasMany(models.Lesson, { foreignKey: 'course_id', as: 'lessons' });
    Course.hasMany(models.Enrollment, { foreignKey: 'course_id', as: 'enrollments' });
  };

  return Course;
};
