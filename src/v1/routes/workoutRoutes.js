
// línea temporal 
// Cliente → Router → Controller → Service → Database → Service → Controller → Cliente
// >>>>>>>> ******* ------------------------------------------------------------------


const express = require("express");
const apicache = require("apicache");


const workoutController = require("../../controllers/workoutController");

const router = express.Router();

const cache = apicache.middleware;


// todas las rutas empiezan por http://localhost:3000/api/v1/workouts
// viene de la siguiente linea que esta en index.js 
// app.use("/api/v1/workouts", v1WorkoutRouter);
// las siguientes direcciones se añaden a esta direccion
//  para llamar a los metodos que hay en workoutController

// acepta como parametros la ruta y varios callback separados por comas
// escucha con get http://localhost:3000/api/v1/workouts y devuelve todo el db.json
// el metodo getAllWorkouts ubicado en /controller/workoutController.js es llamado
router.get("/", cache("1 minutes"), workoutController.getAllWorkouts);

// escucha con get http://localhost:3000/api/v1/workouts/61dbae02-c147-4e28-863c-db7bd402b2d6 y devuelva el registro con esa id
router.get("/:workoutId", workoutController.getOneWorkout);

// escucha con post http://localhost:3000/api/v1/workouts y espera un json en el body para añadir al db en ram y db.json en disco
router.post("/", workoutController.createNewWorkout);

// escucha con patch http://localhost:3000/api/v1/workouts/ y espera un json en el body para actualizar al db en ram y db.json en disco
router.patch("/:workoutId", workoutController.updateOneWorkout);

// escucha con delete http://localhost:3000/api/v1/workouts/61dbae02-c147-4e28-863c-db7bd402b2d6 y devuelve el ok en el status
router.delete("/:workoutId", workoutController.deleteWorkout);

// escucha con get http://localhost:3000/api/v1/workouts/ids y devuelve todos los ids de los entrenamientos
router.get("/id/all", workoutController.getAllIdsWorkouts);


// exportar el router para poder llamar a estos metodos desde index.js (se esta importando en index.js asignada a v1WorkoutRouter )
module.exports = router;