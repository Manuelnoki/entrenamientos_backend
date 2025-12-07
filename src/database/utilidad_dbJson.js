// linea temporal 
// cliente → router → controller → service → utilidad_database → service → controller → cliente
// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> ********** ----------------------------------------

const fs = require("fs");
const DB = require("./db.json");


// -------------------------------------------------------------
// utilidades para filtrar y ordenar listas
// -------------------------------------------------------------

const CAMPOS_ORDEN_VALIDOS_WORKOUT = new Set(["createdAt", "updatedAt"]);
const CAMPOS_ORDEN_VALIDOS_MEMBER = new Set(["dateOfBirth"]);

// normalizar parametro que puede venir como array si lo repiten en query
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

// parseo seguro de fechas dd/mm/yyyy
const parsearFechaSeguraMiembros = (valorFecha) => {
  if (!valorFecha) return null;

  // acepta dd/mm/yyyy o d/m/yyyy, tambien admite espacios
  const s = String(valorFecha).trim();
  const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!m) return null;

  const dia = Number(m[1]);
  const mes = Number(m[2]);
  const anio = Number(m[3]);

  // validaciones basicas
  if (anio < 1000 || anio > 9999) return null;
  if (mes < 1 || mes > 12) return null;
  if (dia < 1) return null;

  const fecha = new Date(anio, mes - 1, dia);
  // comprobaremos que la fecha construida coincide con los valores (evita 31/02 -> marzo erróneo)
  if (fecha.getFullYear() !== anio || (fecha.getMonth() + 1) !== mes || fecha.getDate() !== dia) {
    return null;
  }

  const timestamp = fecha.getTime();
  return Number.isFinite(timestamp) ? timestamp : null;
};



// ACTUALIZACION: FILTER devolver una lista con los que coincidan ********************************
// devolver todos los workouts
//*************************************************************************************************
const getAllWorkouts = (parametros = {}) => {
  try {
    // si vienen parametros repetidos en query, tomar solo el primero
    const modoBuscado = normalizarParametroUnico(parametros.mode);
    const campoOrden =
      normalizarParametroUnico(parametros.sortBy) ??
      normalizarParametroUnico(parametros.sortby);
    const ordenElegido = normalizarParametroUnico(parametros.order);
    const limiteBruto = normalizarParametroUnico(parametros.limit);

    let workoutsFiltrados = DB.workouts || [];

    // filtrar por busqueda que incluya la cadena en modo
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

      if (!CAMPOS_ORDEN_VALIDOS_WORKOUT.has(campo)) {
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


// actualizar un registro por id ****************************************************************************************
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

// borrar un registro por id ********************************************************************************************
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

// devolver una lista con todos los id existentes ***********************************************************************
const getAllWorkoutIds = () => {
  try {
    const allIds = DB.workouts.map(workout => workout.id);
    return allIds;
  } catch (error) {
    console.error("error al obtener todos los ids:", error);
    return { status: "error", message: "error al leer los ids en utilidad" };
  }
};

// metodo para guardar en disco duro la base de datos ******************************************************************
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
// ********************************************************************************************************************* 
// ******  METODOS PARA MEMBERS  ***************************************************************************************
// ********************************************************************************************************************* 

// metodo para filtrar y devolver todos los miembros ******************************************************************
const getAllMembers = (parametros) => {
  try {
    const campoOrden =
      normalizarParametroUnico(parametros.sortBy) ??
      normalizarParametroUnico(parametros.sortby);
    const ordenElegido = normalizarParametroUnico(parametros.order);
    const limiteBruto = normalizarParametroUnico(parametros.limit);

    console.log("filterParams en utilidad:", parametros);
    // lista original de miembros en memoria
    let miembrosFiltrados = DB.members;

    // filtro por nombre (coincidencia parcial)
    if (parametros.name) {
      const nombreBuscado = String(parametros.name).toLowerCase();
      miembrosFiltrados = miembrosFiltrados.filter(
        (m) => m.name.toLowerCase().includes(nombreBuscado)
      );
    }

    // filtro por genero (male o female)
    if (parametros.gender) {
      const generoBuscado = String(parametros.gender).toLowerCase();
      miembrosFiltrados = miembrosFiltrados.filter(
        (m) => m.gender.toLowerCase() === generoBuscado
      );
    }

    // filtro por email (coincidencia parcial)
    if (parametros.email) {
      const correoBuscado = String(parametros.email).toLowerCase();
      miembrosFiltrados = miembrosFiltrados.filter(
        (m) => m.email.toLowerCase().includes(correoBuscado)
      );
    }

    // filtro por fecha de nacimiento exacta (dd/mm/yyyy)
    if (parametros.dateOfBirth) {
      miembrosFiltrados = miembrosFiltrados.filter(
        (m) => m.dateOfBirth === parametros.dateOfBirth
      );
    }


    // ordenar por fecha dateOfBirth

    // console.log("llega a ordenar por dateOfBirth");

    if (campoOrden !== undefined && campoOrden !== null && String(campoOrden).trim() !== "") {
      const campo = String(campoOrden);

      // valida que el campo sea exactamente el que aceptas
      if (!CAMPOS_ORDEN_VALIDOS_MEMBER.has(campo)) {
        throw { status: 400, message: "parametro sortBy invalido: usar solo dateOfBirth" };
      }

      let direccion = ordenElegido ? String(ordenElegido).toLowerCase() : "desc";
      if (direccion !== "asc" && direccion !== "desc") {
        throw { status: 400, message: "parametro order invalido: usar asc o desc" };
      }

      miembrosFiltrados = miembrosFiltrados.slice(); // evitar mutar db original

      //console.log("antes ordenar:", miembrosFiltrados.map(m => ({ id: m.id, dateOfBirth: m.dateOfBirth })));

      miembrosFiltrados.sort((a, b) => {
        const fechaA = parsearFechaSeguraMiembros(a && a[campo]);
        const fechaB = parsearFechaSeguraMiembros(b && b[campo]);

        // debug: imprime timestamps para verificar
        // console.log(a.id, a[campo], fechaA, " | ", b.id, b[campo], fechaB);

        // si una fecha es null la situamos al final:
        // - en asc: null -> +infinito (asi quedan al final)
        // - en desc: null -> -infinito (asi quedan al final)
        const inf = Number.POSITIVE_INFINITY;
        const ninf = Number.NEGATIVE_INFINITY;

        const tiempoA = (fechaA === null) ? (direccion === "asc" ? inf : ninf) : fechaA;
        const tiempoB = (fechaB === null) ? (direccion === "asc" ? inf : ninf) : fechaB;

        if (tiempoA === tiempoB) return 0;
        // para asc: menor primero
        if (direccion === "asc") return tiempoA - tiempoB;
        // para desc: mayor primero
        return tiempoB - tiempoA;
      });

      // console.log("despues ordenar:", miembrosFiltrados.map(m => ({ id: m.id, dateOfBirth: m.dateOfBirth })));
    }


    // console.log("llega a limite");
    // aplicar limite final
    if (limiteBruto !== undefined) {
      const limite = convertirEnteroPositivo(limiteBruto);
      if (Number.isNaN(limite)) {
        throw { status: 400, message: "parametro limit invalido: debe ser entero positivo" };
      }
      miembrosFiltrados = miembrosFiltrados.slice(0, limite);
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

// actualizar un registro por id ****************************************************************************************
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

// devolver una lista con todos los id existentes **********************************************************************
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
