const List = require("../models/listDB");

const handleAddList = async (req, res) => {
  const user = req.user;
  try {
    const { listName, listItems } = req.body;
    const existingList = await List.findOne({ listName, createdBy: user.id });
    if (existingList) {
      return res.status(400).json({ message: "List already exists!" });
    }

    const newList = await List.create({
      listName,
      listItems,
      createdBy: user.id,
    });

    return res.status(201).json({
      message: "List added successfully!",
      list: newList,
    });
  } catch (err) {
    console.error("Add list error:", err);

    return res.status(500).json({
      message: "Internal Server Error",
      error: err.message,
    });
  }
};

const handleGetAllLists = async (req, res) => {
  const user = req.user;
  try {
    const lists = await List.find({ createdBy: user.id });
    return res.status(200).send(lists);
  } catch (err) {
    console.error("Get all lists error:", err);
    return res.status(500).send("Internal Server Error: " + err.message);
  }
};

const handleGetListByID = async (req, res) => {
  const { id } = req.params;
  const user = req.user;
  try {
    const list = await List.findOne({ _id: id, createdBy: user.id });
    if (!list) return res.status(404).send("List not found");
    return res.status(200).send(list);
  } catch (err) {
    console.error("Get list by ID error:", err);
    return res.status(500).send("Internal Server Error: " + err.message);
  }
};

const handleUpdateList = async (req, res) => {
  const { id, listItems } = req.body;
  const user = req.user;

  try {
    const updatedList = await List.findOne({ _id: id, createdBy: user.id });
    if (!updatedList) return res.status(404).send("List not found");
    updatedList.listItems = listItems;
    await updatedList.save();
    return res.status(200).send(updatedList);
  } catch (err) {
    console.error("Update list error:", err);
    return res.status(500).send("Internal Server Error: " + err.message);
  }
};

const handleRemoveLists = async (req, res) => {
  const user = req.user;
  try {
    const { listIds } = req.body;
    if (!listIds || listIds.length === 0) {
      return res.status(400).json({ message: "No lists selected" });
    }
    const deletedLists = await List.deleteMany({ _id: { $in: listIds }, createdBy: user.id });
    return res.status(200).send(deletedLists);
  } catch (err) {
    console.error("Remove lists error:", err);
    return res.status(500).send("Internal Server Error: " + err.message);
  }
};

module.exports = {
  handleAddList,
  handleGetAllLists,
  handleGetListByID,
  handleUpdateList,
  handleRemoveLists,
};
