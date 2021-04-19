'use strict';
module.exports = (sequelize, DataTypes) => {
    const Answers = sequelize.define('answers', {
        title: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        imageUrl: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        score: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        seq: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        correct: {
            type: DataTypes.ENUM('false', 'true'),
            defaultValue: 'false'
        },
        has_deleted: {
            type: DataTypes.ENUM('false', 'true'),
            defaultValue: 'false'
        },
        question_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'questions',
                key: 'id'
            }
        }
    }, {
        underscored: true,
        timestamps: true
    });

    Answers.associate = function (models) {
        Answers.belongsTo(models.questions, {
            as: 'question',
            foreignKey: 'question_id',
        });
    };

    return Answers;
};
