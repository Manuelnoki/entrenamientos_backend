// linea temporal 
// cliente → router → controller → service → utilidad_database → service → controller → cliente
// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> ********** ----------------------------------------

// importar uuid para gererar los id de los nuevos entrenamientos
const { v4: uuid } = require("uuid");

// crear una instancia de utilidad_dbjson "importa la clase utilidad_dbjson"
const UTILIDADDBJSON = require("../database/utilidad_dbJson");






// ACTUALIZACION: FILTER devolver una lista con los que coincidan **************************************************************************************
// devolver todos los workouts
//**************************************************************************************************************************************************
const getAllWorkouts = (filterParams) => {
  try {
    const allWorkouts = UTILIDADDBJSON.getAllWorkouts(filterParams);
    return allWorkouts;
  } catch (error) {
    console.error("error al obtener todos los workouts:", error);
    return { status: "error", message: "error al obtener los workouts desde el service" };
  }
};





// devolver un workout por id pasado 
//**************************************************************************************************************************************************
const getOneWorkout = (workoutId) => {
  try {
    const oneWorkout = UTILIDADDBJSON.getByIdWorkouts(workoutId);
    return oneWorkout;
  } catch (error) {
    console.error("error al obtener workout:", error);
    return { status: "error", message: "error al obtener el workout" };
  }
};

// devuelve el objeto pasado por parametro newWorkout agregando el id fechas creacion y actualizacion desde el metodo que se llamo
//**************************************************************************************************************************************************
const createNewWorkout = (newWorkout) => {

  const workoutToInsert = {
    ...newWorkout, // crea una copia del objeto y pone todos sus atributos aqui, los siguientes son los que se añaden
    id: uuid(),
    createdAt: new Date().toLocaleDateString("en-US", { timeZone: "UTC" }),
    updatedAt: new Date().toLocaleDateString("en-US", { timeZone: "UTC" }),
  };

  try {
    const createdWorkout = UTILIDADDBJSON.createNewWorkout(workoutToInsert);
    console.log(createdWorkout);
    return createdWorkout; // devuelve el creado
  } catch (error) {
    console.error("error al crear workout:", error);
    return { status: "error", message: "error al crear el workout" };
  }
};

// devuelve el objeto actualizado updatedWorkout 
//**************************************************************************************************************************************************
const updateOneWorkout = (workoutId, body) => {
  try {
    const updatedWorkout = UTILIDADDBJSON.updateOneWorkout(workoutId, body);
    return updatedWorkout;
  } catch (error) {
    console.error("error al actualizar workout:", error);
    return { status: "error", message: "error al actualizar el workout desde  workoutService.js" };
  }
};

//**************************************************************************************************************************************************
// borrar un elemento buscado por id delegado al modulo utilidad_dbjson
const deleteOneWorkout = (workoutId) => {
  try {
    return UTILIDADDBJSON.deleteOneWorkout(workoutId);
  } catch (error) {
    console.error("error al borrar workout:", error);
    return { status: "error", message: "error al borrar el workout" };
  }
};

// devolver una lista con todos los id existentes **************************************************************************************
const getAllIdsWorkouts = () => {
  try {
    const allIds = UTILIDADDBJSON.getAllIds();
    return allIds;
  } catch (error) {
    console.error("error al obtener todos los ids de workouts:", error);
    return { status: "error", message: "error al obtener los ids de los workouts en service" };
  }
};



// esta linea declara las constantes (funciones anonimas o flecha) se quieren exportar de este archivo
module.exports = {
  getAllWorkouts,
  getOneWorkout,
  createNewWorkout,
  updateOneWorkout,
  deleteOneWorkout,
  getAllIdsWorkouts
};
