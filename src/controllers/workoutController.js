// linea temporal 
// cliente → router → controller → service → database → service → controller → cliente
// >>>>>>>>>>>>>>>>>>>**********-----------------------------------------------------

const workoutService = require("../services/workoutService");

// peticion todos ********************************************* 
const getAllWorkouts = (req, resp) => {
  
  const { mode, limit } = req.query; // coger el parametro mode de la url si existe "va despues de la ?"
  try {
    //console.log("aqui puedes ejecutar codigo, esto se imprime en consola")
    const allWorkout = workoutService.getAllWorkouts( { mode, limit } );
    //resp.send("get all workouts")
    resp.status(200).send(allWorkout)
  } catch (error) {
    console.error("error al obtener todos los workouts:", error);
    resp.status(500).send({ status: "error", message: "error al obtener los workouts desde el controller" });
  }
};

// peticion uno por id ************************************************************************************
const getOneWorkout = (req, resp) => {
  try {
    const { workoutId } = req.params;
    const workoutbuscado = workoutService.getOneWorkout(workoutId);

    if (!workoutbuscado) {
      return resp.status(404).send({ message: "workout no encontrado" });
    }

    resp.status(200).send(workoutbuscado);
  } catch (error) {
    console.error("error al obtener workout:", error);
    resp.status(500).send({ status: "error", message: "error al obtener el workout" });
  }
};

//  crear entrenamiento nuevo *****************************************************************************
const createNewWorkout = (req, resp) => {
  try {
    const { body } = req;
  
    if (
      !body.name ||
      !body.mode ||
      !body.equipment ||
      !body.exercises ||
      !body.trainerTips
    ) {
      return resp.status(400).send({ status: "error", message: "faltan campos obligatorios" });
    }
  
    const newWorkout = {
      name: body.name,
      mode: body.mode,
      equipment: body.equipment,
      exercises: body.exercises,
      trainerTips: body.trainerTips,
    };
  
    const createdNewWorkout = workoutService.createNewWorkout(newWorkout);
  
    resp.status(201).send({ status: "ok", createdNewWorkout });
  } catch (error) {
    console.error("error al crear workout:", error);
    resp.status(500).send({ status: "error", message: "error al crear el workout" });
  }
};

// actualizar uno  por id ***************************************************************************
const updateOneWorkout = (req, resp) => {
  try {
    const { workoutId } = req.params; // porque se ponen entre llaves esta declaracion
    const { body } = req;             // porque se ponen entre llaves esta declaracion  

    // req.body ya es un objeto JavaScript, no un string, gracias a que Express usa express.json()
    // JSON.parse(body); // Si no hay error, el JSON está bien formado
 

    const updated = workoutService.updateOneWorkout(workoutId, body);

    if (!updated) {
        return resp.status(404).send({ message: "workout no encontrado" });
    }

    resp.status(200).send(updated);
  } catch (error) {
    console.error("error al actualizar workout:", error);
    resp.status(500).send({ status: "error", message: "error al actualizar el workout desde  workoutService.js" });
  }
};

// borrar uno por id *******************************************************************************
const deleteWorkout = (req, resp) => {
  try {
    // const { workoutId } = req.params;
    const { params: { workoutId } } = req;

    const deleted = workoutService.deleteOneWorkout(workoutId); 

    if (!deleted) {
        return resp.status(404).send({ message: "workout no encontrado" });
    }

    resp.status(200).send({ status: "ok", message: "workout eliminado" });
  } catch (error) {
    console.error("error al eliminar workout:", error);
    resp.status(500).send({ status: "error", message: "error al eliminar el workout" });
  }
}


// coger todos los ids de los entrenamientos **********************************************************************
const getAllIdsWorkouts = (req, resp) => {
      try { const allIds = workoutService.getAllIdsWorkouts();
        resp.status(200).send(allIds);
      } catch (error) {
        console.error("error al obtener todos los ids de workouts:", error);
        resp.status(500).send({ status: "error", message: "error al obtener los ids de los workouts en controller" });
      } 
};



module.exports = {
  getAllWorkouts,
  getOneWorkout,
  createNewWorkout,
  updateOneWorkout,
  deleteWorkout,
  getAllIdsWorkouts
};
