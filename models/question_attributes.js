'use strict';
module.exports = (sequelize, DataTypes) => {
    const QuestionAttributes = sequelize.define('question_attributes', {
        title: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        value: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        seq: {
            type: DataTypes.INTEGER,
            allowNull: false,
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

    QuestionAttributes.associate = function (models) {
        QuestionAttributes.belongsTo(models.questions, {
            as: 'question',
            foreignKey: 'question_id',
        });
    };

    return QuestionAttributes;
};
