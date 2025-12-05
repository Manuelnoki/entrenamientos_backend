// linea temporal 
// cliente → router → controller → service → utilidad_database → service → controller → cliente
// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> ***************** ---------------------------------

const fs = require("fs");
const DB = require("./db.json");


// ACTUALIZACION: FILTER devolver una lista con los que coincidan **************************************************************************************
// este metodo devuelve todo el json que hay en db.json ***************************************************************
const getAllWorkouts = (filterParams) => {

  try {
    let workoutsPostFiltered = DB.workouts; 

    // para filtrar por el atributo "mode"
    if (filterParams.mode) {
      workoutsPostFiltered = workoutsPostFiltered.filter(
        workout => workout.mode.toLowerCase().includes(String(filterParams.mode).toLowerCase())
      );
    }

    // para ordenar por fecha de creacion o actualizacion
    if (filterParams.sortBy) {
      const sortBy = filterParams.sortBy;
    
      // si manndan varios sortBy larzar error, porque javascript los convierte en array
      if (Array.isArray(sortBy)) {
        throw { status: 400, message: "solo se permite un valor en sortBy" };
      }
    
      //  validacion
      if (sortBy !== "createdAt" && sortBy !== "updatedAt") {
        throw { status: 400, message: "parametro sortBy invalido" };
      }

      // order aplicado dentro del sort 
      let order = filterParams.order ? String(filterParams.order).toLowerCase() : "desc";
      if (order !== "asc" && order !== "desc") {
        throw { status: 400, message: "parametro order invalido en utilidad_dbJson" };
      }

      workoutsPostFiltered = workoutsPostFiltered.sort((a, b) => {
        const A = new Date(a[sortBy]);
        const B = new Date(b[sortBy]);


        if (order === "asc") return A - B;   //  antiguo a reciente
        else return B - A;                   //  reciente a antiguo
      });
    }

    // aplicamos el LIMIT siempre lo ultimo
    if (filterParams.limit !== undefined) {
      // convertir a numero y validar
      const limit = Number(filterParams.limit);
      if (!Number.isNaN(limit) && limit > 0) {
        workoutsPostFiltered = workoutsPostFiltered.slice(0, limit); // devuelve solo los primeros limit registros
      } else {
        throw { status: 400, message: "parametro limit invalido en utilidad_dbJson" };
      }
    }



    console.log("workoutsPostFiltered:", workoutsPostFiltered.length); // cantidad final de resultados en debug
    return workoutsPostFiltered; // retornar resultado final filtrado y limitado
    

    // FALTA PAGINAR RESULTADOS

  } catch (error) {
    // si ya es un error con status, se lo pasamos al controller lo gestione
    if (error && error.status) throw error;
    throw { status: 500, message: "error al leer los workouts desde el utilidad_dbJson" };
  }


  //METODO ANTERIOR SIN FILTRO
  /* try {
    return DB.workouts; 
  } catch (error) {
    console.error("error al obtener todos los workouts:", error);
    return { status: "error", message: "error al leer los workouts" };
  } */

};


// este metodo devuelve el mapa de uno de los registros de la lista buscado por la key id  *****************************
const getByIdWorkout = (id) => {
  try {
    return DB.workouts.find(workout => workout.id === id);
  } catch (error) {
    console.error("error al obtener workout por id:", error);
    return { status: "error", message: "error al leer el workout" };
  }
};


// crear un registro con id *********************************************************************************************
const createNewWorkout = (workoutToInsert) => {
  try {
    // buscar en DB si ya existe un workout.id que coincida con el workoutToInsert.id que queremos insertar
    const workoutExists = DB.workouts.find(workout => workout.id === workoutToInsert.id);

    if (!workoutExists) {
      
      DB.workouts.push(workoutToInsert); // metemos el objeto en el array de workouts esto es guardar en ram
      
      saveToDatabase(DB); // esto es guardar en disco duro
      
      console.log("el nuevo objeto se ha guardado en ram y disco");

      return workoutToInsert;
    } else {
      console.log(`el id ${workoutToInsert.id} ya existe en la base de datos`);
      return { error: "el id ya existe" };
    }
  } catch (error) {
    console.error("error al crear workout:", error);
    return { status: "error", message: "error al crear el workout" };
  }
};


// actualizar un registro por id *******************************************************************************************
const updateOneWorkout = (id, changes) => {
  try {
    // buscar indice del workout a actualizar
    const index = DB.workouts.findIndex(w => w.id === id);

    if (index === -1) return null; // no encontrado

    // crear el objeto actualizado
    const updated = {
      ...DB.workouts[index],
      ...changes,
      updatedAt: new Date().toLocaleString("en-US", { timeZone: "UTC" }), // esto es con la fecha original del json hora de españa creo
    };

    // reemplazar el workout antiguo por el actualizado
    DB.workouts[index] = updated; // esto es guardar en ram

    saveToDatabase(DB); // esto es guardar en disco duro

    return updated;
  } catch (error) {
    console.error("error al actualizar workout:", error);
    return { status: "error", message: "error al actualizar el workout desde  utilidad_dbJson.js" };
  }

};


// borrar un registro por id *********************************************************************************************
const deleteOneWorkout = (id) => {
  try {
    const index = DB.workouts.findIndex(w => w.id === id);

    if (index === -1) return null;

    const deleted = DB.workouts[index];

    DB.workouts.splice(index, 1); // esto es guardar en ram

    saveToDatabase(DB); // esto es guardar en disco duro

    return deleted;
  } catch (error) {
    console.error("error al borrar workout:", error);
    return { status: "error", message: "error al borrar el workout" };
  }
};


// devolver una lista con todos los id existentes **********************************************************************************
const getAllWorkoutIds = () => {
  try {
    const allIds = DB.workouts.map(workout => workout.id);
    // console.log(allIds);
    return allIds;
  } catch (error) {
    console.error("error al obtener todos los ids:", error);
    return { status: "error", message: "error al leer los ids en utilidad" };
  }
};


// metodo para guardar en disco duro la base de datos **********************************************************************************
const saveToDatabase = (DB) => {
  try {
    fs.writeFileSync(
      "./src/database/db.json",
      JSON.stringify(DB, null, 2),
      { encoding: "utf8" }
    );
  } catch (error) {
    console.error("error al guardar en disco:", error);
  }
};


/* A PARTIR DE AQUI TODOS LOS METODOS SON PARA LOS MEMBERS*/
// ************************************************************************* 
// ******  METODOS PARA MEMBERS  *********************************************
// ************************************************************************* 


// metodo para filtrar y devolver todos los members ********************************************
const getAllMembers = (filterParams) => {
  try {

    let membersFiltered = DB.members; // lista original de members en ram


    // filtro por name (coincidencia parcial)
    if (filterParams.name) {
      const nameFilter = String(filterParams.name).toLowerCase();
      membersFiltered = membersFiltered.filter(
        m => m.name.toLowerCase().includes(nameFilter)
      );
    }


    // filtro por gender (male o female)
    if (filterParams.gender) {
      const genderFilter = String(filterParams.gender).toLowerCase();
      membersFiltered = membersFiltered.filter(
        m => m.gender.toLowerCase() === genderFilter
      );
    }


    // filtro por email (coincidencia parcial)
    if (filterParams.email) {
      const emailFilter = String(filterParams.email).toLowerCase();
      membersFiltered = membersFiltered.filter(
        m => m.email.toLowerCase().includes(emailFilter)
      );
    }


    // filtro por fecha de nacimiento exacta (formato: dd/mm/yyyy)
    if (filterParams.dateOfBirth) {
      membersFiltered = membersFiltered.filter(
        m => m.dateOfBirth === filterParams.dateOfBirth
      );
    }


    // filtro limit (siempre lo ultimo)
    if (filterParams.limit !== undefined) {
      const limit = Number(filterParams.limit);
      if (!isNaN(limit) && limit > 0) {
        membersFiltered = membersFiltered.slice(0, limit);
      } else {
        throw { status: 400, message: "parametro limit invalido" };
      }
    }


    // debug para ver cuantos quedan despues de filtrar
    console.log("membersFiltered:", membersFiltered.length);

    return membersFiltered;


  } catch (error) {
    if (error && error.status) throw error;
    throw { status: 500, message: "error al leer los members desde utilidad_dbJson" };
  }
};


// este metodo devuelve el mapa de uno de los registros de la lista buscado por la key id  *****************************
const getByIdMember = (id) => {
  try {
    return DB.members.find(member => member.id === id);
  } catch (error) {
    console.error("error al obtener member por id:", error);
    return { status: "error", message: "error al leer el member" };
  }
};


// crear un registro con id *********************************************************************************************
const createNewMember = (memberToInsert) => {
  try {
    const memberExists = DB.members.find(member => member.id === memberToInsert.id);

    if (!memberExists) {
      
      DB.members.push(memberToInsert); 
      saveToDatabase(DB); 
      
      console.log("el nuevo objeto se ha guardado en ram y disco");

      return memberToInsert;
    } else {
      console.log(`el id ${memberToInsert.id} ya existe en la base de datos`);
      return { error: "el id ya existe" };
    }
  } catch (error) {
    // corregido: antes ponias "workout"
    console.error("error al crear member:", error);
    return { status: "error", message: "error al crear el member" };
  }
};



// actualizar un registro por id *******************************************************************************************
const updateOneMember = (id, changes) => {
  try {
    const index = DB.members.findIndex(w => w.id === id);

    if (index === -1) return null;

    const updated = {
      ...DB.members[index],
      ...changes,
      updatedAt: new Date().toLocaleString("en-US", { timeZone: "UTC" }),
    };

    DB.members[index] = updated;
    saveToDatabase(DB);

    return updated;
  } catch (error) {
    // corregido: antes ponias workout
    console.error("error al actualizar member:", error);
    return { status: "error", message: "error al actualizar el member desde utilidad_dbJson.js" };
  }
};



// borrar un registro por id *********************************************************************************************
const deleteOneMember = (id) => {
  try {
    const index = DB.members.findIndex(w => w.id === id);

    if (index === -1) return null;

    // corregido: antes ponias DB.workouts[index]
    const deleted = DB.members[index];

    DB.members.splice(index, 1); // esto es guardar en ram

    saveToDatabase(DB); // esto es guardar en disco duro

    return deleted;
  } catch (error) {
    console.error("error al borrar member:", error);
    return { status: "error", message: "error al borrar el member" };
  }
};



// devolver una lista con todos los id existentes **********************************************************************************
const getAllMemberIds = () => {
  try {
    const allIds = DB.members.map(member => member.id);
    // console.log(allIds);
    return allIds;
  } catch (error) {
    console.error("error al obtener todos los ids:", error);
    return { status: "error", message: "error al leer los ids en utilidad" };
  }
};


module.exports = {
  getAllWorkouts,
  getByIdWorkout,
  createNewWorkout,
  updateOneWorkout,
  deleteOneWorkout,
  getAllWorkoutIds,
  getAllMembers,
  getByIdMember,
  createNewMember,
  updateOneMember,
  deleteOneMember,
  getAllMemberIds,
};
