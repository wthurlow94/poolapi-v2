import User from '../models/user.model'

class UserController {
    static getAllUsers(req, res) {
        
        User.find((err,users) => {
            if(err)
                return res.status(500).json({
                    message: "Error Received " + err
                });
        
            return res.status(200).json({
                users,
                message: (users.length == 0) ? "No users exist in db" : "All Users returned"
            });
        });
    }


}

export default UserController;