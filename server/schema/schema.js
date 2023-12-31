const graphql = require('graphql');
var _ = require('lodash');
const User = require("../model/user")
const Hobby = require("../model/hobby")
const Post = require("../model/post")

//dummy data
// var usersData = [
//   { id: "1", name: "Bond", age: 36, profession: "Programmer" },
//   { id: "13", name: "Anna", age: 26, profession: "Baker" },
//   { id: "211", name: "Bella", age: 16, profession: "Mechanic" },
//   { id: "19", name: "Gina", age: 26, profession: "Painter" },
//   { id: "150", name: "Georgina", age: 36, profession: "Teacher" },
// ];

// var hobbiesData = [
//   {
//     id: "1",
//     title: "Programming",
//    description: "Using computers to make the world a better place",
//     userId: "150",
//   },
//   {
//     id: "2",
//     title: "Rowing",
//     description: "Sweat and feel better before eating donouts",
//     userId: "211",
//   },
//   {
//     id: "3",
//     title: "Swimming",
//     description: "Get in the water and learn to become the water",
//     userId: "211",
//   },
//   {
//     id: "4",
//     title: "Fencing",
//     description: "A hobby for fency people",
//     userId: "13",
//   },
//   {
//     id: "5",
//     title: "Hiking",
//     description: "Wear hiking boots and explore the world",
//     userId: "150",
//   },
// ];

// var postsData = [
//   { id: "1", comment: "Building a Mind", userId: "1" },
//   { id: "2", comment: "GraphQL is Amazing", userId: "1" },
//   { id: "3", comment: "How to Change the World", userId: "19" },
//   { id: "4", comment: "How to Change the World", userId: "211" },
//   { id: "5", comment: "How to Change the World", userId: "1" },
// ];

const{
    GraphQLObjectType,
    GraphQLID,
    GraphQLString,
    GraphQLInt,
    GraphQLList,
    GraphQLNonNull,
    GraphQLSchema
} = graphql

//create types
const UserType = new GraphQLObjectType({
    name: 'User',
    description: 'Documentation for user',
    fields: ()=> ({
        id: {type: GraphQLNonNull(GraphQLID)},
        name: {type: GraphQLString},
        age: {type: GraphQLInt},
        profession: {type: GraphQLString},
        posts: {
          type: new GraphQLList(PostType),
          resolve(parent, args) {
            // return _.filter(postsData, {userId: parent.id});
            return Post.find({ userId: parent.id });
          },
        },
        hobbies: {
            type: new GraphQLList(HobbyType),
            resolve(parent, args) {
              // return _.filter(hobbiesData, {userId: parent.id})
              return Hobby.find({ userId: parent.id });
            },
          },
    }),
});

const HobbyType = new GraphQLObjectType({
    name: "Hobby",
    description: "Hobby description",
    fields: () => ({
      id: {type: GraphQLID},
      title:{type: GraphQLString},
      description:{type: GraphQLString},
      userId: {type: GraphQLNonNull(GraphQLString)},
      user: {
        type: UserType,
        resolve(parent, args) {
          return User.findById(parent.userId);
          // return _.find(usersData, {id: parent.userId});
        },
      },
      // hobby: {
      //   type: HobbyType,
      //   args: { id: { type: GraphQLID } },
      //   resolve(parent, args) {
      //     //return data for our hobby
      //     return _.find(hobbiesData, {id: args.id});
      //   },
      // },
    }),
  });

  //Post type (id, comment)
const PostType = new GraphQLObjectType({
    name: "Post",
    description: "Post description",
    fields: () => ({
      id: {type: GraphQLID},
      comment: {type: GraphQLString},
      userId: {type: GraphQLString},
      user: {
        type: UserType,
        resolve(parent, args) {
          return User.findById(parent.userId);
          // return _.find(usersData, {id: parent.userId});
        },
      },
    }),
  });

//RootQuery
const RootQuery =  new GraphQLObjectType({
    name: 'RootQueryType',
    description: 'Description',
    fields: {
        user:{
            type: UserType,
            args: {id:{type: GraphQLString}},
            resolve(parent, args){
                // return _.find(usersData, {id: args.id})
                return User.findById(args.id);
            }
        },
        users: {
          type: new GraphQLList(UserType),
          resolve(parent, args){
            return User.find({});
          }
        },
        hobby: {
            type: HobbyType,
            args: {id:{type: GraphQLID}},
            resolve(parent, args){
              return Hobby.findById(args.id);
                // return _.find(hobbiesData, {id: args.id})
                //
            }
        },
        hobbies: {
          type: new GraphQLList (HobbyType),
          resolve(parent, args){
            return Hobby.find({ id: args.userId });
            // return hobbiesData;
          },
        },
        post: {
            type: PostType,
            args: {id:{type: GraphQLID}},
            resolve(parent, args) {
              return Post.findById(args.id);
              // return _.find(postsData, {id: args.id});
            },
          },
        posts: {
          type: new GraphQLList(PostType),
          resolve(parent, args){
            return Post.find({});
            // return postsData;
          }
        }
    },
});

//=== Mutations ===//
const Mutation = new GraphQLObjectType({
  name: "Mutation",
  fields: {
    createUser:{
      type: UserType,
      args: {
        name: {type: GraphQLNonNull(GraphQLString)},
        age: {type: GraphQLNonNull(GraphQLInt)},
        profession: {type: GraphQLString},
      },
      resolve(parent, args){
        let user = User({
          name: args.name,
          age: args.age,
          profession: args.profession
        });
        return user.save();
        // let user = {
        //   name: args.name,
        //   age: args.age,
        //   profession: args.profession
        // };
        // return user;
      },
    },
    //Update User
    UpdateUser: {
      type: UserType,
      args: {
        id: { type: GraphQLNonNull(GraphQLString) },
        name: { type: GraphQLNonNull(GraphQLString) },
        age: { type: GraphQLNonNull(GraphQLInt) },
        profession: { type: GraphQLString },
      },
      resolve(parent, args) {
        return (updateUser = User.findByIdAndUpdate(
          args.id,
          {
            $set: {
              name: args.name,
              age: args.age,
              profession: args.profession,
            },
          },
          { new: true } // send back the updated objecttype
        ));
      },
    },
    //Remove User
    RemoveUser:{
      type: UserType,
      args: {
        id: {type: GraphQLNonNull(GraphQLString)},
      },
      resolve(parent, args){
        let removedUser = User.findByIdAndRemove(args.id).exec();
        if (!removedUser){
          throw new "Error"();
        }
        return removedUser;
      }
    },
    //todo: CreatePost mutation
    createPost: {
      type: PostType,
      args: {
        // id: {type: GraphQLString},
        userId: {type: GraphQLNonNull(GraphQLString)},
        comment: {type: GraphQLNonNull(GraphQLString)},
      },
      // resolve(parent, args){
      //   let post = {
      //     comment: args.comment,
      //     userId: args.userId,
      //   };
      //   return post;
      // }
      resolve(parent, args) {
        let post = Post({
          comment: args.comment,
          userId: args.userId,
        });
        return post.save();
      },
    },
    //update post
    UpdatePost: {
      type: PostType,
      args: {
        id: { type: GraphQLNonNull(GraphQLString) },
        comment: { type: GraphQLNonNull(GraphQLString) },        
      },
      resolve(parent,args){
        return (updatePost = Post.findByIdAndUpdate(
          args.id,
          {
            $set: {
              comment: args.comment,
            }
          },
          {new : true}
        ))
      }
    },
    //Remove Post
    RemovePost: {
      type: PostType,
      args: {
        id: { type: GraphQLNonNull(GraphQLString) },
      },
      resolve(parent, args) {
        let removedPost = Post.findByIdAndRemove(args.id).exec();

        if (!removedPost) {
          throw new "Error"();
        }
        return removedPost;
      },
    },
    //RemovePosts
    RemovePosts: {
      type: PostType,
      args: {
        ids: { type: GraphQLList(GraphQLString) },
      },
      resolve(parent, args) {
        let removedPosts = Post.deleteMany({
          _id: args.ids,
        });
        if (!removedPosts) {
          throw new "Error"();
        }
        return removedPosts;
      },
    },
    //todo: CreateHobby Mutation
    createHobby: {
      type: HobbyType,
      args: {
        // id: {type: GraphQLID},
        title: {type: GraphQLNonNull(GraphQLString)},
        description: {type: GraphQLNonNull(GraphQLString)},
        userId: {type: GraphQLNonNull(GraphQLString)}
      },
      // resolve(parent, args){
      //   let hobby = {
      //     title: args.title,
      //     description: args.description,
      //     userId: args.userId,
      //   }
      //   return hobby;
      // }
      resolve(parent, args) {
        let hobby = Hobby({
          title: args.title,
          description: args.description,
          userId: args.userId,
        });
        return hobby.save();
      },
    },
    //Update Hobby
    UpdateHobby: {
      type: HobbyType,
      args: {
        id: { type: GraphQLNonNull(GraphQLString) },
        title: { type: GraphQLNonNull(GraphQLString) },
        description: { type: GraphQLNonNull(GraphQLString) },
      },
      resolve(parent, args) {
        return (updatedHobby = Hobby.findByIdAndUpdate(
          args.id,
          {
            $set: {
              title: args.title,
              description: args.description,
            },
          },
          { new: true }
        ));
      },
    },
  //Remove Hobby
  RemoveHobby: {
    type: HobbyType,
    args: {
      id: { type: GraphQLNonNull(GraphQLString) },
    },
    resolve(parent, args) {
      let removedHobby = Hobby.findByIdAndRemove(args.id).exec();
      if (!removedHobby) {
        throw new "Error"();
      }
      return removedHobby;
    },
  },

  //RemoveHobbies
  RemoveHobbies: {
    type: HobbyType,
    args: {
      ids: { type: GraphQLList(GraphQLString) },
    },
    resolve(parent, args) {
      let removedHobbies = Hobby.deleteMany({
        _id: args.ids,
      }).exec();
      if (!removedHobbies) {
        throw new "Error"();
      }
      return removedHobbies;
    },
  },
  }
})

module.exports =  new GraphQLSchema ({
    query: RootQuery,
    mutation: Mutation
})