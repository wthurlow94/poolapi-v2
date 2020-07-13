import Match from '../models/match.model'
import UserController from '../controllers/user.controller'

class MatchController {
    static async createMatch(req,res){
        let p1exists = await UserController.checkUserExists(req.body.playerOne) 
        let p2exists = await UserController.checkUserExists(req.body.playerTwo) 
        if(!p1exists 
        || !p2exists)
            return res.status(404).json({
                message: 'One player does not exist'
            });
        

        let matchExists = await MatchController.checkMatchExistsBetweenTwoPlayers(req.body.playerOne, req.body.playerTwo);
        if (matchExists){
            return res.status(403).json({
                message: 'An unresulted match already exists between these two players'
            })
        }
       
        var match = new Match();
        match.playerOne = req.body.playerOne;
        match.playerTwo = req.body.playerTwo;
        match.started = Date.now();

        match.save((err,match) => {
            if (err)
                return res.status(500).json({
                    message: 'Error received: ' + err 
                });
            return res.status(200).json({
                match,
                message: 'New Match Created'
            })
        })


    }

    static async resultMatch(req,res){
        let match = await Match.findById(req.params.id);
        match.winner = req.body.winner;
        match.resulted = Date.now();

        match.save((err,result) => {
            if (err)
                return res.status(500).json({
                    message: 'Error received: ' + err
                })
            return res.status(200).json({
                result,
                message: 'Match Resulted!'
            })
        });
    }




    static checkMatchExistsBetweenTwoPlayers(playerOneId, playerTwoId){
        return Match.exists(        
                {$and:[
                    {
                        $or:[
                            {playerOne: playerOneId},
                            {playerOne: playerTwoId}
                        ]
                    },
                    {
                        $or:[
                            {playerTwo: playerOneId},
                            {playerTwo: playerTwoId}
                        ]                    
                    },
                    {
                        resulted: {$exists: false}
                    }
                    
                ]}
        );
    }

}

export default MatchController