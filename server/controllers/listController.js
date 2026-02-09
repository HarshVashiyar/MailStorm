const List = require("../models/listDB");

const handleAddList = async (req, res) => {
  const user = req.user;
  const { listName, listItems = [] } = req.body;
  try {
    const newList = await List.create({
      listName,
      listItems,
      createdBy: user.id
    });
    return res.status(201).json({ success: true, message: "List added successfully!", data: newList });
  } catch (err) {
    console.error("Add list error:", err);
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: "List already exists" });
    }
    return res.status(500).json({ success: false, message: err.message });
  }
};

const handleGetAllLists = async (req, res) => {
  const user = req.user;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;
  const skip = (page - 1) * limit;

  try {
    const totalItems = await List.countDocuments({ createdBy: user.id });
    const totalPages = Math.ceil(totalItems / limit);

    const lists = await List.find({ createdBy: user.id })
      .populate("listItems.company", "_id companyName companyEmail")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return res.status(200).send({
      success: true,
      message: "Lists retrieved successfully",
      data: lists,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (err) {
    console.error("Get all lists error:", err);
    return res.status(500).send({ success: false, message: err.message });
  }
};

const handleAddItemsToList = async (req, res) => {
  const { id, listItems } = req.body;
  const user = req.user;
  try {
    const list = await List.findOneAndUpdate(
      { _id: id, createdBy: user.id },
      {
        $addToSet: {
          listItems: { $each: listItems },
        },
      },
      { new: true }
    );
    if (!list) {
      return res.status(404).json({ success: false, message: "List not found" });
    }
    res.json({ success: true, message: "Item(s) added to list", data: list });
  } catch (err) {
    console.error("Get all lists error:", err);
    return res.status(500).send({ success: false, message: err.message });
  }
}

const handleRemoveItemsFromList = async (req, res) => {
  const { listId, itemIds } = req.body;
  const user = req.user;

  if (!listId || !Array.isArray(itemIds) || itemIds.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid listId or itemIds"
    });
  }

  try {
    const list = await List.findOneAndUpdate(
      { _id: listId, createdBy: user.id },
      {
        $pull: {
          listItems: {
            _id: { $in: itemIds }
          }
        }
      },
      { new: true }
    );

    if (!list) {
      return res.status(404).json({ success: false, message: "List not found" });
    }

    return res.json({
      success: true,
      message: "Item(s) removed from list successfully!",
      data: list
    });

  } catch (err) {
    console.error("Remove items error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

const handleRemoveLists = async (req, res) => {
  const { listIds } = req.body;
  const user = req.user;
  try {
    if (!listIds || listIds.length === 0) {
      return res.status(400).json({ success: false, message: "No lists selected" });
    }
    const deletedLists = await List.deleteMany({
      _id: { $in: listIds },
      createdBy: user.id,
    });
    res.status(200).json({
      success: true,
      message: `${deletedLists.deletedCount} list(s) deleted`,
      data: deletedLists
    });
  } catch (err) {
    console.error("Remove lists error:", err);
    return res.status(500).send({ success: false, message: err.message });
  }
};

module.exports = {
  handleAddList,
  handleGetAllLists,
  handleAddItemsToList,
  handleRemoveItemsFromList,
  handleRemoveLists,
};
