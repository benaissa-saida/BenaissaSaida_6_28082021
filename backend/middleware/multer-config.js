const multer = require('multer');
/* Package qui nous permet de gérer les fichers entrants 
dans les requêtes HTTP. */

const MIME_TYPES = { //dictionnaire 
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png'
};

const storage = multer.diskStorage({ // contient la logique pour indiquer à multer où enregistrer les fichiers
  destination: (req, file, callback) => { // indique à multer d'enregistrer les fichers dans le dossier images
    callback(null, 'images'); 
  },
  filename: (req, file, callback) => { 
    const name = file.originalname.split(' ').join('_'); 
    const extension = MIME_TYPES[file.mimetype];
    callback(null, name + Date.now() + '.' + extension);
    /* remplace les espaces par des underscores + ajoute un timestamp
    + ajoute un point + utilise un dictionnaire MIME pour résoudre l'extention de fichier
    */
  }
});

module.exports = multer({storage: storage}).single('image'); 
/* exportation de l'élément multer, lui passons storage avant de lui indiquer qu'on gére simplement les 
les téléchargements de fichiers image.
*/