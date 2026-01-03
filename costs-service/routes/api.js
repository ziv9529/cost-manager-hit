const express = require('express');
const router = express.Router();

const Cost = require('../models/costs');
const User = require('../models/users');

const validCategories = ['food', 'health', 'housing', 'sports', 'education'];

router.post('/add', function (req, res) {
    // Extract all parameters from the request body
    const {description, category, userid, sum, date} = req.body;

    // Validation: Check if any required field is missing from the request body
    if(!description || !category || !userid || !sum) {
        return res.status(500).json({id: userid, message: "Missing some required parameters (description, category, userid, sum)" });
    }

    // Validation: Ensure the 'sum' parameter is not a negative number
    if(sum < 0){
        return res.status(500).json({id: userid, message: "Sum can't be negative number" });
    }

    // Validation: Verify if the provided category is in the valid categories
    if(!validCategories.includes(category)) {
        return res.status(500).json({id: userid, message: `${category} category invalid` });
    }

    // Get the current date
    const nowDate = new Date();
    let costDate;

    // Check if the user provided a specific date in the request
    // If a date is provided, validate and use it; otherwise, default to the current date
    if (date) {
        costDate = new Date(date);

        //Check if the provided date is in the past by comparing the year and the month
        const isPastYear = costDate.getFullYear() < nowDate.getFullYear(); //check if the year in the request is in the past
        const isPastMonth = (costDate.getFullYear() === nowDate.getFullYear()) &&
            (costDate.getMonth() < nowDate.getMonth());

        // Reject the request if the date is in a past month or year
        if (isPastYear || isPastMonth) {
            //throw new Error("Can't add cost with a past date");
            return res.status(500).json({id: userid, message: "Can't add cost with a past date"});
        }
    } else {
        costDate = nowDate;
    }

    // Query the database to verify that the user exists before adding the cost
    User.findOne({id: userid})
        .then(userExists => {
            // If the user is not found, throw an error to skip to the catch block
            if (!userExists) {
                throw new Error('User not found');
            }

            // Create a new cost document in the database with the validated date (that we checked before)
            return Cost.create({
                description,
                category,
                userid,
                sum,
                date: costDate
            });
        })
        .then(cost => {
            // If creation is successful, send the created cost object back to the client
            res.status(200).send(cost);
        })
        .catch(error => {
            // Catch any errors (user find failed or others) and return a 500 error
            res.status(500).json({id: userid, message: error.message});
        })

});

router.get('/about', function (req, res) {

    try{
        // Create the developers team (first + last name) in the JSON format
        const developersTeam = [
            {
                // First Developer
                first_name: "Lior",
                last_name: "Halaby"
            },
            {
                // Second Developer
                first_name: "Ziv",
                last_name: "Ashkenazi"
            }
        ]
    } catch (error) {
        // Catch any errors and return a 500 error
        res.status(500).json({id: userid, message: error.message});
    }

    // Sent the developers team to the client
    res.status(200).send(developersTeam);
});

/*router.post('/addUser', function (req, res) {

    const {id,first_name, last_name, birthday} = req.body;
    const userBirthday = new Date(birthday);

    if(!id || !first_name || !last_name || !birthday){
        return res.status(500).json({id: id, message: "Missing some required parameters (id, first_name, last_name, birthday)" });
    }

    if(userBirthday > new Date()){
        return res.status(500).json({id: id, message: "Birthday date can't be in the future" });
    }

    User.findOne({id: id})
        .then((userExists) => {
            if (userExists) {
                // If the user is found (means user already exists), throw an error to skip to the catch block
                throw new Error('User already exists');
            }

            return User.create({
                id,
                first_name,
                last_name,
                birthday: userBirthday
            });
        })
        .then(user => {
            // If creation is successful, send the created user object back to the client
            res.status(200).send(user);
        }).catch(error => {
            // Catch any errors (user find failed or others) and return a 500 error
            res.status(500).json({id: id, message: error.message});
        })
});*/

module.exports = router;
