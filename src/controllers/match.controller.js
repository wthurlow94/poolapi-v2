import Match from '../models/match.model'
import UserController from '../controllers/user.controller'
import User from '../models/user.model';
import mongoose from 'mongoose';

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

    static getAllMatches(req,res){

        Match.find((err,matches) => {
            if (err)
                return res.status(500).json({
                    message: 'Error Received: ' + err
                })
            return res.status(200).json({
                matches,
                message: 'All matches retrieved'
            })

        })

    }




    static getMatchById(req,res) {


        Match.findById(req.params.id, (err,match) => {
            if (err)
                return res.status(500).json({
                    message: "Error received" + err
                })

            if (match == null)
                return res.status(404).json({
                    message: "Match does not exist"
                })              
             

            return res.status(200).json({
                match,
                message: "Match returned"
            })

        })

    }




    static async resultMatch(req,res){



        let match = await Match.findById(req.params.id);
        
        if(match == null){
            return res.status(404).json({
                message: 'Match does not exist'
            })
        }

        let winner = await User.findById(req.body.winner);

        if (winner == null){
            return res.status(403).json({
                message: 'Provided winner ID does not exist'
            })
        }
        
        let loser;
        switch (req.body.winner.toString()) {
                case match.playerOne.toString(): {
                    loser = match.playerTwo
                    break;
                }
                case match.playerTwo.toString(): {
                    loser = match.playerOne
                    break;
                }
                default :
                return res.status(403).json({
                    message: 'Provided Winner is not part of this match'
                })
            }


        match.winner = req.body.winner;
        match.resulted = Date.now();

        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            const opts = { session, new: true, validateBeforeSave: false};

            let matchDoc = await match.save(opts,(err,match) => {
                if (err)
                    return res.status(500).json({
                        message: 'Error received: ' + err
                    })
                return match
            });
            
            let result = await UserController.updateRanking(match.winner,loser,opts)

            await session.commitTransaction();
            session.endSession();

            result.match = match
            return res.status(200).json({
                result,
                message: 'Match resulted and ELOs updated'
            })

           
        } catch (err) {
            await session.abortTransaction();
            session.endSession();
            res.status(500).json({
                message: 'Error Received: ' + err
            })
        }
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