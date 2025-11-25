
// línea temporal 
// Cliente → Router → Controller → Service → Database → Service → Controller → Cliente
// >>>>>*********** ------------------------------------------------------------------

const express = require("express");

const cors = require("cors");

const v1WorkoutRouter = require("./v1/routes/workoutRoutes")

const app = express();

// puerto que escuchara el servidor
// el que se le envie por argumento al ejecutar el js o por defecto el 3000 si no se da ninguno
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(express.json());

app.use(cors());


// con esta linea se puede ordenar que escuche esta direccion http://localhost:3000/ y devuelva ese html
app.get("/", (req, resp) => {resp.send("<h1>Servidor básico funcionando \n\t\t\t\t esta respuesta viene del index.js \n\t\t\t\t sin entrar en rutas</h1>")})

// esta linea llama al workoutRoutes.js que es quien contiene la declaracion de const router = express.Router();
// es una clase para la escucha de rutas en las llamadas a la api para asignarle metodos
app.use("/api/v1/workouts", v1WorkoutRouter);

// esta linea hace la escucha en el puerto asignado
// sin esta linea no escuchara el puerto y no hace nada. el console.log solo es informativo no es necesario evidentemente
app.listen(PORT, () => {
    console.log(`API is listening on port ${PORT}`);
})


//========================================================================


// // index.js
// const express = require('express');

// const v1WorkoutRouter = require("./v1/routes/workoutRoutes");

// const app = express();

// // puerto donde escuchara el servidor
// const PORT = process.env.PORT || 3000;

// // Middleware para parsear JSON
// app.use(express.json());

// // ruta ejemplo
// app.get('/', (req, res) => {
//   res.send('<h1>Servidor Express basico funcionando bien</h1>');
// });

// // iniciar la escucha del servidor
// app.listen(PORT, () => {
//   console.log(`API esta escuchando en http://localhost:${PORT}`);
// });

// // para modularizar las rutas (diapositivas de guille)
// const router = express.Router();

// router.route("/").get((req, res)=> {res.send(`<h2>HOLA DESDE ${req.baseUrl}</h2>`);
// });

// module.export = router;



