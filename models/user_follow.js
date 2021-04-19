'use strict';
module.exports = (sequelize, DataTypes) => {
    const user_follow = sequelize.define('user_follow', {
        follower_id: {
            type: DataTypes.INTEGER,
            references: {
                model: 'users',
                key: 'id',
            }
        },
        following_id: {
            type: DataTypes.INTEGER,
            references: {
                model: 'users',
                key: 'id',
            }
        },
        created_at:{
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize.fn('NOW'),
        },
        updated_at:{
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize.fn('NOW'),
        }
    }, { timestamps: false, underscored: true });
    user_follow.associate = function (models) {
    // associations can be defined here
        user_follow.belongsTo(models.users, { as: 'follower', foreignKey: 'follower_id' });
        user_follow.belongsTo(models.users, { as: 'following', foreignKey: 'following_id' });
    };
    return user_follow;
};