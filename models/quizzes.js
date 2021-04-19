'use strict';
module.exports = (sequelize, DataTypes) => {
    const quiz = sequelize.define('quizzes', {
        title: DataTypes.STRING,
        description: DataTypes.STRING,
        has_deleted: {
            type: DataTypes.ENUM('false', 'true'),
            defaultValue: 'false'
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id'
            }
        },
    }, {
        underscored: true,
        timestamps: true});
    quiz.associate = function(models) {
    // associations can be defined here
        quiz.belongsTo(models.users, {
            // onDelete: 'CASCADE',
            hooks: true,
            foreignKey: {
                name: 'user_id',
                allowNull: false
            }
        });
        quiz.hasMany(models.questions, {
            as: 'questions',
            foreignKey: 'quiz_id',
            onDelete: 'cascade',
            hooks: true
        });
    };
    return quiz;
};
