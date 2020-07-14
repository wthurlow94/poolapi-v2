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

    static async updateRanking(winner, loser, opts) {
        var expectedScoreWinner, expectedScoreLoser, newScoreWinner, newScoreLoser;

        let Winner = await User.findById(winner,{}, opts);
        let Loser  = await User.findById(loser,{}, opts);

        expectedScoreWinner = 1 / (1 + (10 ^ ((Loser.elo - Winner.elo) / 400)));
        expectedScoreLoser  = 1 / (1 + (10 ^ ((Winner.elo - Loser.elo) / 400)));

        newScoreWinner      = Math.floor(Winner.elo + (32 * ( 1 - expectedScoreWinner )))
        newScoreLoser       = Math.floor(Loser.elo  + (32 * ( 0 - expectedScoreLoser  )))

        


        let winnerOldElo = Winner.elo;
        let loserOldElo  = Loser.elo;
        Winner.elo = newScoreWinner;
        Loser.elo  = newScoreLoser;

        await Winner.save(opts);
        await Loser.save(opts);

        return {winner: {
                    _id: Winner._id,
                    oldElo: winnerOldElo,
                    newElo: Winner.elo
                },
                loser: {
                    _id: Loser._id,
                    oldElo: loserOldElo,
                    newElo: Loser.elo
                }
        }

    }


    static checkUserExists(id){
         return User.exists({_id: id});

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