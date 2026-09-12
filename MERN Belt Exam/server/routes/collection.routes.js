const CollectionController = require("../controllers/collection.controller");

module.exports = (app) => {
  app.post("/api/things/new", CollectionController.createNewDoc);
  app.get("/api/things", CollectionController.findAllDocs);
  app.get("/api/things/:id", CollectionController.findOneDoc);
  app.patch("/api/things/edit/:id", CollectionController.updateExisitingDoc);
  app.delete("/api/things/delete/:id", CollectionController.deleteOneDoc);
};
