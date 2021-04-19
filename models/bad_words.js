'use strict';
module.exports = (sequelize, DataTypes) => {
    const bad_words = sequelize.define('bad_words', {
        name: {
            type:DataTypes.STRING,
            allowNull:false
        }
    }, {underscored:true,timestamps:false});
    bad_words.associate = function() {
    // associations can be defined here
    };
    return bad_words;
};