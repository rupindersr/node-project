'use strict';
module.exports = (sequelize, DataTypes) => {
    const Questions = sequelize.define('questions', {
        title: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        correct_answer: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        has_deleted: {
            type: DataTypes.ENUM('false', 'true'),
            defaultValue: 'false'
        },
        quiz_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'quizzes',
                key: 'id'
            }
        }
    }, {
        underscored: true,
        timestamps: true
    });

    Questions.associate = function (models) {
        Questions.belongsTo(models.quizzes, {
            as: 'quiz',
            foreignKey: 'quiz_id'
        });
        Questions.hasMany(models.answers, {
            as: 'answers',
            foreignKey: 'question_id',
            onDelete: 'cascade',
            hooks: true
        });
        Questions.hasMany(models.question_attributes, { as: 'attributes', foreignKey: 'question_id' });
    };

    return Questions;
};
