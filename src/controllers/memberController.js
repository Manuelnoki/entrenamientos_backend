// linea temporal 
// cliente → router → controller → service → database → service → controller → cliente
// >>>>>>>>>>>>>>>>>>>**********-----------------------------------------------------

const memberService = require("../services/memberService");

// peticion todos ********************************************* 
const getAllMembers = (req, resp) => {
  
  const { mode, limit } = req.query; // coger el parametro mode de la url si existe "va despues de la ?"
  try {
    //console.log("aqui puedes ejecutar codigo, esto se imprime en consola")
    const allMember = memberService.getAllMembers( { mode, limit } );
    //resp.send("get all members")
    resp.status(200).send(allMember)
  } catch (error) {
    console.error("error al obtener todos los member:", error);
    resp.status(500).send({ status: "error", message: "error al obtener los member desde el controller" });
  }
};

// peticion uno por id ************************************************************************************
const getOneMember = (req, resp) => {
  try {
    const { memberId: memberId } = req.params;
    const memberbuscado = memberService.getOneMember(memberId);

    if (!memberbuscado) {
      return resp.status(404).send({ message: "member no encontrado" });
    }

    resp.status(200).send(memberbuscado);
  } catch (error) {
    console.error("error al obtener member:", error);
    resp.status(500).send({ status: "error", message: "error al obtener el member" });
  }
};

//  crear miembro nuevo *****************************************************************************
const createNewMember = (req, resp) => {
  try {
    const { body } = req;
  
    if (
      !body.name ||
      !body.gender ||
      !body.dateOfBirth ||
      !body.email ||
      !body.password
    ) {
      return resp.status(400).send({ status: "error", message: "faltan campos obligatorios" });
    }
  
    const newMember = {
      name: body.name,
      gender: body.gender,
      dateOfBirth: body.dateOfBirth,
      email: body.email,
      password: body.password,
    };
  
    const createdNewMember = memberService.createNewMember(newMember);
  
    resp.status(201).send({ status: "ok", createdNewMember });
  } catch (error) {
    console.error("error al crear member fallo en memberController:", error);
    resp.status(500).send({ status: "error", message: "error al crear el member en controller" });
  }
};

// actualizar uno  por id ***************************************************************************
const updateOneMember = (req, resp) => {
  try {
    const { memberId: memberId } = req.params; // porque se ponen entre llaves esta declaracion
    const { body } = req;             // porque se ponen entre llaves esta declaracion  


    // req.body ya es un objeto JavaScript, no un string, gracias a que Express usa express.json()
    // JSON.parse(body);

    const updated = memberService.updateOneMember(memberId, body);

    if (!updated) {
        return resp.status(404).send({ message: "member no encontrado" });
    }

    resp.status(200).send(updated);
  } catch (error) {
    console.error("error al actualizar member:", error);
    resp.status(500).send({ status: "error", message: "error al actualizar el member desde  memberService.js" });
  }
};

// borrar uno por id *******************************************************************************
const deleteMember = (req, resp) => {
  try {
    // const { memberId } = req.params;
    const { params: { memberId: memberId } } = req;

    const deleted = memberService.deleteOneMember(memberId); 

    if (!deleted) {
        return resp.status(404).send({ message: "member no encontrado" });
    }

    resp.status(200).send({ status: "ok", message: "member eliminado" });
  } catch (error) {
    console.error("error al eliminar member:", error);
    resp.status(500).send({ status: "error", message: "error al eliminar el member" });
  }
  
};

// coger todos los ids de los mimebros **********************************************************************
const getAllIdsMembers = (req, resp) => {
  try { 
    const allIds = memberService.getAllIdsMembers();
    resp.status(200).send(allIds);
  } catch (error) {
    console.error("error al obtener todos los ids de members:", error);
    resp.status(500).send({ status: "error", message: "error al obtener los ids de los members en controller" });
  } 
};


module.exports = {
  getAllMembers,
  getOneMember,
  createNewMember,
  updateOneMember,
  deleteMember,
  getAllIdsMembers,

};
