'use strict';
module.exports = (sequelize, DataTypes) => {
    const posts = sequelize.define('posts', {
        post_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
        },
        media_type: {
            type: DataTypes.STRING,
            defaultValue: ''
        },
        media: {
            type: DataTypes.STRING,
            defaultValue: '',
        },
        media_width: {
            type: DataTypes.STRING,
            defaultValue: ''
        },
        media_height: {
            type: DataTypes.STRING,
            defaultValue: ''
        },
        caption: {
            type: DataTypes.STRING,
            defaultValue: ''
        },
        media_thumbnail: {
            type: DataTypes.STRING,
            defaultValue: ''
        },
        full_address: {
            type: DataTypes.STRING,
            defaultValue: ''
        },
        lat: {
            type: DataTypes.STRING,
            defaultValue: ''
        },
        long: {
            type: DataTypes.STRING,
            defaultValue: ''
        },
        city: {
            type: DataTypes.STRING,
            defaultValue: ''
        },
        state: {
            type: DataTypes.STRING,
            defaultValue: ''
        },
        country: {
            type: DataTypes.STRING,
            defaultValue: ''
        },
        postal_code: {
            type: DataTypes.STRING,
            defaultValue: ''
        },
        has_deleted: {
            type: DataTypes.ENUM('true', 'false'),
            defaultValue: 'false'
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id'
            }
        }
    }, { underscored: true, timestamps: true });
    posts.associate = function (models) {
    // associations can be defined here
        posts.belongsTo(models.users, {
            // onDelete: 'CASCADE',
            hooks: true,
            foreignKey: {
                name: 'user_id',
                allowNull: false
            }
        });
        posts.hasMany(models.post_tags, { foreignKey: 'post_id' });
        posts.hasMany(models.post_comments, { foreignKey: 'post_id' });
        posts.hasMany(models.post_likes, { foreignKey: 'post_id' });
    };
    return posts;
};