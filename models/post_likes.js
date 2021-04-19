'use strict';
module.exports = (sequelize, DataTypes) => {
    const post_likes = sequelize.define('post_likes', {
        post_like_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true,
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
    post_likes.associate = function (models) {
    // associations can be defined here
        post_likes.belongsTo(models.users, {
            foreignKey: {
                name: 'user_id',
                allowNull: false
            }
        });
        post_likes.belongsTo(models.posts, {
            foreignKey: {
                name: 'post_id',
                allowNull: false
            }
        });
    };
    return post_likes;
};