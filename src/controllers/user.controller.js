import User from '../models/user.model'

class UserController {
    static getAllUsers(req, res) {
        
        User.find((err,users) => {
            if(err)
                return res.status(500).json({
                    message: "Error Received " + err
                });
            var returnUsers = [];
            users.forEach((user) => {
                var restrictedUser = UserController.filterUserData(user);
                returnUsers.push(restrictedUser)

            })

            return res.status(200).json({
                returnUsers,
                message: (users.length == 0) ? "No users exist in db" : "All Users returned"
            });
        });
    }

    static getUserById(req,res) {
        User.findById(req.params._id, (err,user) => {
            if (err)
                return res.status(500).json({
                    message: "Error received" + err
                })

            if (user == null)
                return res.status(404).json({
                    message: "User does not exist"
                })              
             
            var returnUser = UserController.filterUserData(user);

            return res.status(200).json({
                returnUser,
                message: "User returned"
            })

        })

    }

    static filterUserData(user){
        return {
                    _id: user._id,
                    email: user.email,
                    elo: user.elo
                }
    }

}

export default UserController;