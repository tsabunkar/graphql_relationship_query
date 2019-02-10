import {
    GraphQLServer
} from 'graphql-yoga';



const USERS_DATA = [{
        id: 1,
        name: "tejas",
        email: "tsabunkar",
        age: 24
    },
    {
        id: 2,
        name: "usha",
        email: "ushasabunkar@gmail.com",
        age: 48
    },
    {
        id: 3,
        name: "shailesh",
        email: "shaileshsabunkar@gmail.com",
        age: 50
    },
];

const POSTS_DATA = [{
        id: 10,
        title: "Java",
        body: "Java is OOP paradim language",
        published: true,
        author: 1
    },
    {
        id: 20,
        title: "Javascript",
        body: "Javascript is functional paradim language",
        published: true,
        author: 1
    },
    {
        id: 30,
        title: "C",
        body: "C is structural paradim language",
        published: false,
        author: 2
    },
];

const COMMENTS_DATA = [{
        id: 100,
        text: 'You have written a great post',
        author: 1,
        post: 20
    },
    {
        id: 200,
        text: 'worst post ever seen',
        author: 2,
        post: 30
    },
    {
        id: 300,
        text: 'Not recommended post',
        author: 1,
        post: 10
    },
    {
        id: 400,
        text: 'Best post read ever',
        author: 1,
        post: 20
    },
];


// ! Type definations -> is also called application schema, (here we define our custome data-type, All of the 
// ! operations that can be perfomed on the API, We can also define how our data-type looks like)

// Scalar types (builtin data-type) -> String, Boolean, Int, Float, ID
// User-> Custom/User defined data-type (Non-Scalar data-type) -> User, Post, Comment

const typeDefs = `
    type Query {
        users: [User!]!
        searchUsers(queryFor: String): [User!]!
        posts(searchFor: String): [Post!]!
        comments: [Comment!]!
    }
    type User {
        id: ID!
        name: String!
        email: String!
        age: Int
        posts: [Post!]!
        comments: [Comment!]!
    }

    type Post {
        id: ID!
        title: String!
        body: String!
        published: Boolean!
        author: User!
        comments: [Comment!]!
    }

    type Comment {
        id: ID!
        text: String!
        author: User!
        post: Post!

    }
`;


// ! Resolvers -> Application is resolvers are set of functions
const resolvers = {
    Query: { // Create only one method for one query
        users(parent, args, ctx, info) {
            return USERS_DATA;
        },

        searchUsers(parent, args, ctx, info) {
            if (!args.queryFor)
                return USERS_DATA;

            return USERS_DATA.filter(user => {
                return user.name.toLowerCase().includes(args.queryFor.toLowerCase());
                //if this condition is true then only that element will be returned, else that element will
                // be filtered out.
            });
        },

        posts(parent, args, ctx, info) {
            if (!args.searchFor)
                return POSTS_DATA;
            // !This posts resolver has non-scalar data-type like- author: User, So 
            // ! graphql will call Post.author() resolver foreach individual post object And each post 
            // ! object is present in parent argument in author() function

            return POSTS_DATA.filter(post => {
                return post.title.toLowerCase().includes(args.searchFor.toLowerCase()) ||
                    post.body.toLowerCase().includes(args.searchFor.toLowerCase());
            });
        },

        comments(parent, args, ctx, info) {
            return COMMENTS_DATA;
        }




    },
    // ! Mapping relationship b/w Post and author
    Post: {

        // below author methods/resolver  -> will be called everytime, user has queried for
        /* posts {
            author {
                name
                email
            }
        } */

        // !Making assocation/relationship b/w users type and post
        author(parent, args, ctx, info) { // resolver function
            // 'Post' Object data -> is present in 'parent' argument in author() method

            return USERS_DATA.find((user) => { // find return individual user object
                return user.id === parent.author
            });
        },

        // !resolver func for the Post comments filed that returns all the comments belonging to that post
        comments(parent, args, ctx, info) {
            // 'Post' Object data -> is present in 'parent' argument in comments() method
            return COMMENTS_DATA.filter(comment => {
                return comment.post === parent.id
            })
        }
    },
    // !User type has posts filed which is Custom/Scalar type so we need to make relationship b/w User with Post
    User: {
        // posts -> filed (So creating resolver func)
        posts(parent, args, ctx, info) {
            //  'User' Object data -> is present in 'parent' argument in posts() method
            return POSTS_DATA.filter(post => {
                return post.author === parent.id
            })
        },

        comments(parent, args, ctx, info) {
            //  'User' Object data -> is present in 'parent' argument in comments() method
            return COMMENTS_DATA.filter(comment => {
                return comment.author === parent.id
            })
        }
    },


    Comment: {
        //! Resolver function for the Comment type, author field (this resolver func will return the user who 
        // ! wrote the comment)
        author(parent, args, ctx, info) {
            //  'Comment' Object data -> is present in 'parent' argument in author() method
            return USERS_DATA.find((user) => { // find return individual user object
                return user.id === parent.author
            });
        },
        // !Resolver func for the Comments post field that will return the post that the comment belongs to.
        post(parent, args, ctx, info) {
            //  'Comment' Object data -> is present in 'parent' argument in post() method
            return POSTS_DATA.find(post => {
                return post.id === parent.post
            });
        }
    }
}


const server = new GraphQLServer({
    typeDefs: typeDefs,
    resolvers: resolvers
});

server.start(() => {
    console.log('Server is running');
});