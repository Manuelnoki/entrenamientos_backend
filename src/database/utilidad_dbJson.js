// linea temporal 
// cliente → router → controller → service → utilidad_database → service → controller → cliente
// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> ********** ----------------------------------------

const fs = require("fs");
const DB = require("./db.json");


// -------------------------------------------------------------
// utilidades internas para filtrar y ordenar listas
// -------------------------------------------------------------

const CAMPOS_ORDEN_VALIDOS = new Set(["createdAt", "updatedAt"]);

// normalizar parametro que puede venir como array
const normalizarParametroUnico = (valor) => {
  if (valor === undefined) return undefined;
  if (Array.isArray(valor)) return valor[0];
  return valor;
};

// convertir string a entero positivo
const convertirEnteroPositivo = (valor) => {
  if (valor === undefined) return undefined;
  const numero = Number(valor);
  if (!Number.isInteger(numero) || numero <= 0) return NaN;
  return numero;
};

// parseo seguro de fechas
const parsearFechaSegura = (valorFecha) => {
  if (!valorFecha) return null;
  const timestamp = Date.parse(String(valorFecha));
  return Number.isFinite(timestamp) ? timestamp : null;
};

// ACTUALIZACION: FILTER devolver una lista con los que coincidan **************************************************************************************
// devolver todos los workouts
//**************************************************************************************************************************************************
const getAllWorkouts = (parametros = {}) => {
  try {
    // normalizacion de parametros
    const modoBuscado = normalizarParametroUnico(parametros.mode);
    const campoOrden = normalizarParametroUnico(parametros.sortBy);
    const ordenElegido = normalizarParametroUnico(parametros.order);
    const limiteBruto = normalizarParametroUnico(parametros.limit);

    let workoutsFiltrados = DB.workouts || [];

    // filtrar por modo
    if (modoBuscado !== undefined && modoBuscado !== null && String(modoBuscado).trim() !== "") {
      const modoNormalizado = String(modoBuscado).toLowerCase();
      workoutsFiltrados = workoutsFiltrados.filter(w => {
        const modoWorkout = w && w.mode ? String(w.mode).toLowerCase() : "";
        return modoWorkout.includes(modoNormalizado);
      });
    }

    // ordenar por fecha
    if (campoOrden !== undefined && campoOrden !== null && String(campoOrden).trim() !== "") {
      const campo = String(campoOrden);

      if (!CAMPOS_ORDEN_VALIDOS.has(campo)) {
        throw { status: 400, message: "parametro sortBy invalido: usar createdAt o updatedAt" };
      }

      let direccion = ordenElegido ? String(ordenElegido).toLowerCase() : "desc";
      if (direccion !== "asc" && direccion !== "desc") {
        throw { status: 400, message: "parametro order invalido: usar asc o desc" };
      }

      workoutsFiltrados = workoutsFiltrados.slice(); // evitar mutar DB

      workoutsFiltrados.sort((a, b) => {
        const fechaA = parsearFechaSegura(a && a[campo]);
        const fechaB = parsearFechaSegura(b && b[campo]);

        const tiempoA = (fechaA === null) ? 0 : fechaA;
        const tiempoB = (fechaB === null) ? 0 : fechaB;

        if (direccion === "asc") return tiempoA - tiempoB;
        return tiempoB - tiempoA;
      });
    }

    // aplicar limite final
    if (limiteBruto !== undefined) {
      const limite = convertirEnteroPositivo(limiteBruto);
      if (Number.isNaN(limite)) {
        throw { status: 400, message: "parametro limit invalido: debe ser entero positivo" };
      }
      workoutsFiltrados = workoutsFiltrados.slice(0, limite);
    }

    return workoutsFiltrados;

  } catch (error) {
    if (error && error.status) throw error;
    throw { status: 500, message: "error al leer los workouts desde utilidad_dbJson" };
  }
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
    const workoutExists = DB.workouts.find(workout => workout.id === workoutToInsert.id);

    if (!workoutExists) {
      DB.workouts.push(workoutToInsert); // guardar en ram
      saveToDatabase(DB); // guardar en disco duro
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
    const index = DB.workouts.findIndex(w => w.id === id);

    if (index === -1) return null; // no encontrado

    const updated = {
      ...DB.workouts[index],
      ...changes,
      updatedAt: new Date().toLocaleString("en-US", { timeZone: "UTC" }),
    };

    DB.workouts[index] = updated; // guardar en ram
    saveToDatabase(DB); // guardar en disco duro

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
    DB.workouts.splice(index, 1); // guardar en ram
    saveToDatabase(DB); // guardar en disco duro

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

// metodo para filtrar y devolver todos los miembros ********************************************
const getAllMembers = (filtros) => {
  try {

    // lista original de miembros en memoria
    let miembrosFiltrados = DB.members;

    // filtro por nombre (coincidencia parcial)
    if (filtros.nombre) {
      const nombreBuscado = String(filtros.nombre).toLowerCase();
      miembrosFiltrados = miembrosFiltrados.filter(
        (m) => m.name.toLowerCase().includes(nombreBuscado)
      );
    }

    // filtro por genero (male o female)
    if (filtros.genero) {
      const generoBuscado = String(filtros.genero).toLowerCase();
      miembrosFiltrados = miembrosFiltrados.filter(
        (m) => m.gender.toLowerCase() === generoBuscado
      );
    }

    // filtro por email (coincidencia parcial)
    if (filtros.correo) {
      const correoBuscado = String(filtros.correo).toLowerCase();
      miembrosFiltrados = miembrosFiltrados.filter(
        (m) => m.email.toLowerCase().includes(correoBuscado)
      );
    }

    // filtro por fecha de nacimiento exacta (dd/mm/yyyy)
    if (filtros.fechaNacimiento) {
      miembrosFiltrados = miembrosFiltrados.filter(
        (m) => m.dateOfBirth === filtros.fechaNacimiento
      );
    }

    // ordenacion por createdAt o updatedAt
    if (filtros.ordenarPor) {
      const campoOrden = filtros.ordenarPor;

      // validar campo
      if (!["createdAt", "updatedAt"].includes(campoOrden)) {
        throw { status: 400, message: "parametro ordenarPor invalido en members" };
      }

      // orden por defecto descendente
      let orden = filtros.orden ? String(filtros.orden).toLowerCase() : "desc";

      if (!["asc", "desc"].includes(orden)) {
        throw { status: 400, message: "parametro orden invalido" };
      }

      // conversion a timestamp
      miembrosFiltrados = miembrosFiltrados.sort((a, b) => {
        const tiempoA = new Date(a[campoOrden]).getTime();
        const tiempoB = new Date(b[campoOrden]).getTime();

        if (orden === "asc") return tiempoA - tiempoB;
        else return tiempoB - tiempoA;
      });
    }

    // filtro limit (siempre al final)
    if (filtros.limite !== undefined) {
      const limite = Number(filtros.limite);
      if (!isNaN(limite) && limite > 0) {
        miembrosFiltrados = miembrosFiltrados.slice(0, limite);
      } else {
        throw { status: 400, message: "parametro limite invalido" };
      }
    }

    // debug
    console.log("miembros filtrados:", miembrosFiltrados.length);

    return miembrosFiltrados;

  } catch (error) {
    if (error && error.status) throw error;
    throw { status: 500, message: "error al leer los miembros desde utilidad_dbJson" };
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
    console.error("error al actualizar member:", error);
    return { status: "error", message: "error al actualizar el member desde utilidad_dbJson.js" };
  }
};

// borrar un registro por id *********************************************************************************************
const deleteOneMember = (id) => {
  try {
    const index = DB.members.findIndex(w => w.id === id);
    if (index === -1) return null;

    const deleted = DB.members[index];
    DB.members.splice(index, 1); // guardar en ram
    saveToDatabase(DB); // guardar en disco duro

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
