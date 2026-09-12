
const Collection = require("../models/collection");

module.exports.findAllDocs = (req, res) => {
    Collection.find()
    .then((docs) => {
      res.json(docs);
    })
    .catch((err) => res.json(err));
};


module.exports.findOneDoc = (req, res) => {
    Collection.findOne({ _id: req.params.id })
    .then((oneDoc) => {
      res.json(oneDoc);
    })
    .catch((err) => res.json(err));
};


module.exports.createNewDoc = (req, res) => {
    console.log("CREATE REQ BODY ====> : ",req.body);
    Collection.create(req.body)
    .then((newDoc) => {
      res.json(newDoc);
    })
    .catch((err) => res.status(400).json(err));
};

// UPDATE

module.exports.updateExisitingDoc = (req, res) => {
    Collection.findOneAndUpdate({ _id: req.params.id }, req.body, {
    new: true,
    runValidators: true,
  })
    .then((updatedDoc) => {
      res.json(updatedDoc);
    })
    .catch((err) => res.status(400).json(err));
};

// DELETE
module.exports.deleteOneDoc = (req, res) => {
    Collection.deleteOne({ _id: req.params.id })
    .then((DeletedDoc) => {
      res.json(DeletedDoc);
    })
    .catch((err) => res.json(err));
};
