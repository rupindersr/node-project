'use strict';
const bcrypt = require('bcrypt');
module.exports = (sequelize, DataTypes) => {

    const Users = sequelize.define('users', {
        full_name: {
            type: DataTypes.STRING,
            defaultValue: ''
        },
        user_name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        temp_password: {
            type: DataTypes.STRING,
            defaultValue: '',
        },
        profile_picture: {
            type: DataTypes.STRING,
            defaultValue: ''
        },
        gender: {
            type: DataTypes.ENUM('', 'male', 'female'),
            defaultValue: ''
        },
        date_of_birth: {
            type: DataTypes.STRING,
            defaultValue: ''
        },
        role: {
            type: DataTypes.INTEGER,
            defaultValue: 1
        },
        last_login: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        },
        has_private: {
            type: DataTypes.ENUM('false', 'true'),
            defaultValue: 'false'
        },
        has_blocked: {
            type: DataTypes.ENUM('false', 'true'),
            defaultValue: 'false'
        },
        has_deleted: {
            type: DataTypes.ENUM('false', 'true'),
            defaultValue: 'false'
        },
    }, {
        hooks: {
            beforeCreate: user => {
                if (user.password) {
                    const salt = bcrypt.genSaltSync();
                    user.password = bcrypt.hashSync(user.password, salt);
                }
            },
            beforeBulkUpdate: user => {
                if (user.attributes.password) {
                    const salt = bcrypt.genSaltSync();
                    user.attributes.password = bcrypt.hashSync(
                        user.attributes.password,
                        salt
                    );
                }
            }
        },
        underscored: true,
        timestamps: true
    });

    //Create instance method to use commonally

    Users.prototype.validatepassword = function (password, hashPassword) {
        if (hashPassword) {
            return bcrypt.compareSync(password, hashPassword);
        }
    };
    Users.prototype.toJSON = function () {
        var values = Object.assign({}, this.get());
        delete values.temp_password;
        delete values.password;
        delete values.role;
        delete values.has_deleted;
        delete values.has_blocked;
        return values;
    };
    Users.associate = function (models) {
    // Users.hasMany(models.posts);
        Users.hasMany(models.user_follow, {
            as: 'follower',
            foreignKey: 'following_id',
            onDelete: 'cascade',
            hooks: true
        });
        Users.hasMany(models.user_follow, {
            as: 'following',
            foreignKey: 'follower_id',
            onDelete: 'cascade',
            hooks: true
        });
        Users.hasMany(models.posts, {
            as: 'posts',
            foreignKey: 'user_id',
            onDelete: 'cascade',
            hooks: true
        });
        Users.hasMany(models.post_tags, {
            as: 'tagged_user_detail',
            foreignKey: 'tagged_user_id',
            onDelete: 'cascade',
            hooks: true
        });
        Users.hasMany(models.cart, {
            as: 'cart',
            foreignKey: 'user_id',
            onDelete: 'cascade',
            hooks: true
        });
        Users.hasMany(models.cart, {
            as: 'orders',
            foreignKey: 'user_id',
            onDelete: 'cascade',
            hooks: true
        });
    };
    Users.sync({ force: false, alter: true }).then(() => {
        Users.findOne({ where: { role: 2 } }).then(result => {
            if (!result) {
                const adminUser = { user_name: 'admin', email: 'admin@beyondroot.com', password: 'abc12345', role: 2 };
                Users.create(adminUser);
            }
        });

    });
    return Users;
};
