// linea temporal 
// cliente → router → controller → service → utilidad_database → service → controller → cliente
// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> ********** ----------------------------------------

// importar uuid para gererar los id de los nuevos members
const { v4: uuid } = require("uuid");

// crear una instancia de utilidad_dbjson "importa la clase utilidad_dbjson"
const UTILIDADDBJSON = require("../database/utilidad_dbJson");





// FILTER devolver una lista con los que coincidan **************************************************************************************
// devolver todos los members
//**************************************************************************************************************************************************
const getAllMembers = (filterParams) => {
    try {
        const allMembers = UTILIDADDBJSON.getAllMembers(filterParams);
        return allMembers;
    } catch (error) {
        console.error("error al obtener todos los members:", error);
        return { status: "error", message: "error al obtener los members desde el service" };
    }
};


// devolver un member por id pasado 
//**************************************************************************************************************************************************
const getOneMember = (memberId) => {
    try {
        const oneMember = UTILIDADDBJSON.getByIdMember(memberId);
        return oneMember;
    } catch (error) {
        console.error("error al obtener member:", error);
        return { status: "error", message: "error al obtener el member" };
    }
};

// devuelve el objeto pasado por parametro newMember agregando el id fechas creacion y actualizacion desde el metodo que se llamo
//**************************************************************************************************************************************************
const createNewMember = (newMember) => {

    const memberToInsert = {
        ...newMember, // crea una copia del objeto y pone todos sus atributos aqui, los siguientes son los que se añaden
        id: uuid()
    };

    try {
        const createdMember = UTILIDADDBJSON.createNewMember(memberToInsert);
        console.log(createdMember);
        return createdMember; // devuelve el creado
    } catch (error) {
        console.error("error al crear member:", error);
        return { status: "error", message: "error al crear el member" };
    }
};


// devuelve el objeto actualizado updatedMember
//**************************************************************************************************************************************************
const updateOneMember = (memberId, body) => {
    try {
        const updatedMember = UTILIDADDBJSON.updateOneMember(memberId, body);
        return updatedMember;
    } catch (error) {
        console.error("error al actualizar member:", error);
        return { status: "error", message: "error al actualizar el member desde  memberService.js" };
    }
};

//**************************************************************************************************************************************************
// borrar un elemento buscado por id delegado al modulo utilidad_dbjson
const deleteOneMember = (memberId) => {
    try {
        return UTILIDADDBJSON.deleteOneMember(memberId);
    } catch (error) {
        console.error("error al borrar member:", error);
        return { status: "error", message: "error al borrar el member" };
    }
};

// devolver una lista con todos los id existentes **************************************************************************************
const getAllIdsMembers = () => {
  try {
    const allIds = UTILIDADDBJSON.getAllMemberIds();
    return allIds;
  } catch (error) {
    console.error("error al obtener todos los ids de workouts:", error);
    return { status: "error", message: "error al obtener los ids de los workouts en service" };
  }
};


// esta linea declara las constantes (funciones anonimas o flecha) se quieren exportar de este archivo
module.exports = {
    getAllMembers,
    getOneMember,
    createNewMember,
    updateOneMember,
    deleteOneMember,
    getAllIdsMembers,

};
