// const User = require('./userModel');
const User = require('./userModel').User;

async function handleUserPost(username, post){
    console.log('Post Requested');

    try {
        // Find the user by their username
        const user = await User.findOne({ username });
    
        // Update the user's posts array with the new post data
        post.id = user.posts.length;
        user.posts.push(post);
    
        // Save the updated user data
        await user.save();
        // console.log(user)
    
        // Return the updated user object or any other response as needed

        return user;

      } catch (error) {
        // Handle the error
        console.log(error);
        throw new Error('Failed to handle post submission');
      }
}


module.exports = {handleUserPost};