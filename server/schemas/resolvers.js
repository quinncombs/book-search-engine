const { AuthenticationError } = require('apollo-server-express');
const { User } = require('../models');
const { signToken } = require('../utils/auth');

const resolvers = {
    Query: {
        me: async (parent, args, context) => {
            if (context.uder) {
                return User.findOne({ _id: context.user._id });
            }
            throw new AuthenticationError('Must be logged in to continue.')
        },
    },

    Mutation: {
        login: async (parent, { email, password }) => {
            const user = await User.findOne({ email });

            if (!user) {
                throw new AuthenticationError('Email is not connected to an account.');
            }
            const correctPw = await user.isCorrectPassword(password);
            if (!correctPw) {
                throw new AuthenticationError('Incorrect password.');
            }
            const token = signToken(user);
            return { token, user };
        },

        addUser: async(parent, { username, email, password }) => {
            const user = await User.create({ username, email, password });
            const token = signToken(user)
            return { token, user }
        },

        saveBook: async (parent, book, context) => {
            if (context.user) {
                return User.findOneAndUpdate(
                    { _id: context.user._id },
                    { $addToSet: { savedBooks: book }},
                    { new: true, runValidators: true }
                )
            }
            throw new AuthenticationError('Must be logged in to continue.')
        }
    }

}


module.exports = resolvers;