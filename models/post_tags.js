'use strict';
module.exports = (sequelize, DataTypes) => {
    const post_tags = sequelize.define('post_tags', {
        post_tag_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true,
        },
        tag_x_position: {
            type: DataTypes.STRING,
            defaultValue: ''
        },
        tag_y_position: {
            type: DataTypes.STRING,
            defaultValue: ''
        },
        tagged_user_id: {
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
    post_tags.associate = function (models) {
    // associations can be defined here
        post_tags.belongsTo(models.posts, { foreignKey: 'post_id' });
        post_tags.belongsTo(models.users, {
            as: 'tagged_user_detail',
            foreignKey: {
                name: 'tagged_user_id',
                key: 'id',
                allowNull: false
            }
        });
    };
    return post_tags;
};