'use strict';
module.exports = (sequelize, DataTypes) => {
    const post_comments = sequelize.define('post_comments', {
        post_comment_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true,
        },
        comment: {
            type: DataTypes.STRING,
            defaultValue: ''
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id'
            }
        },
        post_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'posts',
                key: 'post_id'
            }
        }
    }, { timestamps: true, underscored: true });
    post_comments.associate = function (models) {
    // associations can be defined here
        post_comments.belongsTo(models.users, {
            foreignKey: {
                name: 'user_id',
                allowNull: false
            }
        });
        post_comments.belongsTo(models.posts, {
            foreignKey: {
                name: 'post_id',
                allowNull: false
            }
        });
    };
    return post_comments;
};