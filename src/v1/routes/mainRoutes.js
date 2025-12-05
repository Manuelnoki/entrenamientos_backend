// linea temporal
// cliente → router → controller → service → database → service → controller → cliente

const express = require("express");
const apicache = require("apicache");

const workoutController = require("../../controllers/workoutController");
const memberController = require("../../controllers/memberController");

const router = express.Router();

const cache = apicache.middleware;

// todas las rutas de aqui cuelgan de /api/v1 porque se puso asi en index.js
// app.use("/api/v1", v1WorkoutRouter)


// *********************************************************************
// ********************* RUTAS DE WORKOUT *******************************
// *********************************************************************

// get http://localhost:3000/api/v1/workouts
router.get("/workouts", cache("1 minutes"), workoutController.getAllWorkouts);

// get http://localhost:3000/api/v1/workouts/:workoutId
router.get("/workouts/:workoutId", workoutController.getOneWorkout);

// post http://localhost:3000/api/v1/workouts
router.post("/workouts", workoutController.createNewWorkout);

// patch http://localhost:3000/api/v1/workouts/:workoutId
router.patch("/workouts/:workoutId", workoutController.updateOneWorkout);

// delete http://localhost:3000/api/v1/workouts/:workoutId
router.delete("/workouts/:workoutId", workoutController.deleteWorkout);

// get http://localhost:3000/api/v1/workoutsall
router.get("/workoutsall", workoutController.getAllIdsWorkouts);


// *********************************************************************
// ********************** RUTAS DE MEMBERS *******************************
// *********************************************************************

// get http://localhost:3000/api/v1/members
// get http://localhost:3000/api/v1/members?name=a&gender=female&limit=1
router.get("/members", cache("1 minutes"), memberController.getAllMembers);

// get http://localhost:3000/api/v1/members/:memberId
//http://localhost:3000/api/v1/members/12a410bc-849f-4e7e-bfc8-4ef283ee4b19
router.get("/members/:memberId", memberController.getOneMember);

// post http://localhost:3000/api/v1/members
router.post("/members", memberController.createNewMember);

// patch http://localhost:3000/api/v1/members/:memberId
router.patch("/members/:memberId", memberController.updateOneMember);

// delete http://localhost:3000/api/v1/members/:memberId
router.delete("/members/:memberId", memberController.deleteMember);

// get http://localhost:3000/api/v1/allmembers
router.get("/allmembers", memberController.getAllIdsMembers);


// exportar router para index.js
module.exports = router;
