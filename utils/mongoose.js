// 'use strict';
// module.exports = (sequelize, DataTypes) => {
//   const user_follow = sequelize.define('user_follow', {
//     user_follow_id: {
//       type: DataTypes.INTEGER,
//       allowNull: false,
//       primaryKey: true,
//       autoIncrement: true
//     },
//     follower: {
//       type: DataTypes.INTEGER,
//       allowNull: false,
//       references: {
//         model: 'users',
//         key: 'id'
//       }
//     },
//     following: {
//       type: DataTypes.INTEGER,
//       allowNull: false,
//       references: {
//         model: 'users',
//         key: 'id'
//       }
//     },
//   }, { timestamps: true, underscored: true });
//   user_follow.associate = function (models) {
//     // associations can be defined here
//     user_follow.belongsTo(models.users, {
//       // onDelete: 'CASCADE',
//       hooks: true,
//       foreignKey: {
//         name: 'follower',
//         allowNull: false
//       }
//     })

//   };
//   return user_follow;
// };