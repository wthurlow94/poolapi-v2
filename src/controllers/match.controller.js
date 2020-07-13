import Match from '../models/match.model'


class MatchController {
    static createMatch(req,res){

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

}

export default MatchController