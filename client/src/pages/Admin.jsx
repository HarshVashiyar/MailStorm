import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AddCompany from "./AddCompany";
import Email from "./Email";
import Notes from "./Notes";
import ExportCompanies from "./ExportCompanies";

const Admin = () => {
  //Company And Users Modal
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [show, setShow] = useState(false);

  useEffect(() => {
    axios
      .get(
        show
          ? `${import.meta.env.VITE_BACKEND_BASE_URL}${
              import.meta.env.VITE_BACKEND_ALLUSERS_ROUTE
            }`
          : `${import.meta.env.VITE_BACKEND_BASE_URL}${
              import.meta.env.VITE_BACKEND_ALLCOMPANIES_ROUTE
            }`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      )
      .then((response) => {
        setUsers(response.data);
      })
      .catch((error) => {
        console.error(error);
      });
  }, [show]);

  const toggleView = () => {
    setShow((prevShow) => !prevShow);
    setSelectedUsers([]);
  };

  const toggleUserSelection = (userId) => {
    setSelectedUsers((prevSelected) =>
      prevSelected.includes(userId)
        ? prevSelected.filter((id) => id !== userId)
        : [...prevSelected, userId]
    );
  };

  const deleteSelectedUsers = async () => {
    const selectedUsersData = show
      ? { userIds: selectedUsers }
      : { companyIds: selectedUsers };
    try {
      const response = await axios.delete(
        show
          ? `${import.meta.env.VITE_BACKEND_BASE_URL}${
              import.meta.env.VITE_BACKEND_REMOVEUSERS_ROUTE
            }`
          : `${import.meta.env.VITE_BACKEND_BASE_URL}${
              import.meta.env.VITE_BACKEND_REMOVECOMPANIES_ROUTE
            }`,
        {
          data: selectedUsersData,
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setUsers((prevUsers) =>
        prevUsers.filter((user) => !selectedUsers.includes(user._id))
      );
      setSelectedUsers([]);
      toast.success(response.data.message);
    } catch (error) {
      toast.error(error.response.data.message || "Error deleting users");
    }
  };

  //AddCompany Modal
  const [showAddCompanyModal, setShowAddCompanyModal] = useState(false);
  const [updateCompany, setUpdateCompany] = useState(false);

  const handleUpdateCompany = () => {
    setUpdateCompany(true);
    openAddCompanyModal();
  };

  const openAddCompanyModal = () => {
    setShowAddCompanyModal(true);
  };

  const closeAddCompanyModal = () => {
    setShowAddCompanyModal(false);
    setUpdateCompany(false);
  };

  //Email Modal
  const [typedEmail, setTypedEmail] = useState("");
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [schedule, setSchedule] = useState(false);
  const [mState, setMState] = useState(true);

  const toggleMState = () => {
    setMState((prev) => !prev);
  };

  const mailSavedList = () => {
    if (selectedSavedLists.length !== 1) {
      toast.error("Select exactly one list to mail!");
      return;
    }

    const list = savedLists.find((list) => list._id === selectedSavedLists[0]);
    if (!list) {
      toast.error("Selected list not found.");
      return;
    }
    setShowEmailForm(true);
  };

  const handleScheduleEmail = async () => {
    setSchedule(true);
  };

  const mailSelectedUsers = () => {
    if (selectedUsers.length === 0) {
      toast.error("No users selected!");
      return;
    }
    setShowEmailForm(true);
  };

  const closeEmailForm = () => {
    setShowEmailForm(false);
    setSchedule(false);
  };

  //Saved Lists Modal
  const [showSaveListModal, setShowSaveListModal] = useState(false);
  const [listName, setListName] = useState("");
  const [savedLists, setSavedLists] = useState([]);
  const [showSavedListsTable, setShowSavedListsTable] = useState(false);
  const [selectedSavedLists, setSelectedSavedLists] = useState([]);
  const [showManualListForm, setShowManualListForm] = useState(false);

  const closeSavedListsTable = () => {
    setShowSavedListsTable(false);
    setSelectedSavedLists([]);
  };

  const openSaveListModal = () => {
    setShowSaveListModal(true);
  };

  const closeSaveListModal = () => {
    setShowSaveListModal(false);
    setListName("");
  };

  const toggleSavedListSelection = (listId) => {
    setSelectedSavedLists((prevSelected) =>
      prevSelected.includes(listId)
        ? prevSelected.filter((id) => id !== listId)
        : [...prevSelected, listId]
    );
  };

  const toggleManualListForm = () => {
    setShowManualListForm((prev) => !prev);
    setTypedEmail("");
    setListName("");
  };

  const addToExisitingList = async () => {
    if (selectedSavedLists.length !== 1) {
      toast.error("Select exactly one list to add companies to!");
      return;
    }

    const listId = selectedSavedLists[0];
    const listItems = selectedUsers.map((userId) => {
      const user = users.find((user) => user._id === userId);
      return {
        email: show ? user.email : user.companyEmail,
        contactName: show ? user.fullName : user.companyContactPersonName,
      };
    });

    const existingList = savedLists.find((list) => list._id === listId);
    if (existingList) {
      listItems.push(...existingList.listItems);
    }

    try {
      const response = await axios.put(
        `${import.meta.env.VITE_BACKEND_BASE_URL}${
          import.meta.env.VITE_BACKEND_UPDATELIST_ROUTE
        }`,
        { id: listId, listItems },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setSavedLists((prevLists) =>
        prevLists.map((list) =>
          list._id === listId
            ? { ...list, listItems: [...list.listItems, ...listItems] }
            : list
        )
      );

      toast.success(
        response.data.message || "Companies added to the list successfully!"
      );
      setSelectedUsers([]);
      setShowSavedListsTable(false);
    } catch (error) {
      console.error("Error adding companies to the list:", error);
      toast.error(
        error.response?.data?.message || "Failed to add companies to the list."
      );
    }
  };

  const handleSaveList = async () => {
    const listItems = selectedUsers.map((userId) => {
      const user = users.find((user) => user._id === userId);
      return {
        email: show ? user.email : user.companyEmail,
        contactName: show ? user.fullName : user.companyContactPersonName,
      };
    });

    setTypedEmail(listItems.map((item) => item.email).join(", "));
    setShowManualListForm(true);
  };

  const handleAddListManually = async () => {
    const listData = {
      listName: listName.trim(),
      listItems: typedEmail.split(",").map((email) => {
        const user = users.find(
          (user) => (show ? user.email : user.companyEmail) === email.trim()
        );
        return {
          email: email.trim(),
          contactName: show ? user.fullName : user.companyContactPersonName,
        };
      }),
    };

    if (!listName.trim()) {
      toast.error("List name cannot be empty!");
      return;
    }

    if (listData.listItems.length === 0) {
      toast.error("No valid emails to save in the list!");
      return;
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_BASE_URL}${
          import.meta.env.VITE_BACKEND_ADDLIST_ROUTE
        }`,
        listData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      const newList = response.data.list;
      setSavedLists((prevLists) => [...prevLists, newList]);

      toast.success(response.data.message || "List added successfully!");
      setTypedEmail("");
      setListName("");
      setShowSavedListsTable(true);
      setShowSaveListModal(false);
      setShowManualListForm(false);
    } catch (error) {
      console.error("Error saving the list:", error);
      toast.error(error.response?.data?.message || "Failed to save the list.");
    }
  };

  const showSavedLists = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_BASE_URL}${
          import.meta.env.VITE_BACKEND_ALLLISTS_ROUTE
        }`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setSavedLists(response.data);
      setShowSavedListsTable(true);
    } catch (error) {
      console.error("Error fetching saved lists:", error);
      toast.error(
        error.response?.data?.message || "Failed to fetch saved lists."
      );
    }
  };

  const deleteSavedList = async () => {
    if (selectedSavedLists.length !== 1) {
      toast.error("Select exactly one list to delete!");
      return;
    }

    try {
      const response = await axios.delete(
        `${import.meta.env.VITE_BACKEND_BASE_URL}${
          import.meta.env.VITE_BACKEND_REMOVELISTS_ROUTE
        }`,
        {
          data: { listIds: selectedSavedLists[0] },
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setSavedLists((prevLists) =>
        prevLists.filter((list) => list._id !== selectedSavedLists[0])
      );
      setSelectedSavedLists([]);
      toast.success(response.data.message || "List deleted successfully!");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to delete the list."
      );
    }
  };

  // Notes functionality
  const [note, setNote] = useState("");
  const [noteId, setNoteId] = useState("");
  const [viewNote, setViewNote] = useState(false);

  const handleNote = (id, companyNote) => {
    setNoteId(id);
    setNote(companyNote || "");
    setViewNote(true);
  };

  const closeNote = () => {
    setViewNote(false);
    setNoteId("");
    setNote("");
  };

  const updateUserNote = (id, updatedNote) => {
    console.log('updateUserNote called with:', { id, updatedNote });
    setUsers((prevUsers) => {
      console.log('Previous users:', prevUsers);
      const newUsers = prevUsers.map((user) =>
        user._id === id ? { ...user, companyNotes: updatedNote } : user
      );
      console.log('New users:', newUsers);
      return newUsers;
    });
  };

  // Search Functionality
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredUsers = users.filter((user) => {
    const searchFields = show
      ? [user.fullName, user.userName, user.email]
      : [
          user.companyName,
          user.companyContactPersonName,
          user.companyAddress,
          user.companyCountry,
          user.companyEmail,
          user.companyPhone,
          user.companyContactPersonPhone,
          user.companyWebsite,
          ...(user.companyProductGroup || []),
        ];

    return searchFields.some((field) =>
      String(field).toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Go to scheduled emails page
  const navigate = useNavigate();
  const goToScheduled = () => {
    navigate("/Scheduled");
  };

  return (
    // Visible buttons for action
    <div className="relative flex flex-col min-h-screen ml-1 mr-1">
      <div className="flex mb-4">
      <button
          onClick={toggleMState}
          className="bg-emerald-500 text-white text-5xl py-2 px-4 rounded hover:bg-emerald-600 w-fit"
        >
          Mail User:{" "}
          {mState ? "Dynamic Technocast" : "Dynamic Precision Industries"}
        </button>
      </div>
      <div className="flex gap-4 mb-4">
        <button
          onClick={toggleView}
          className="bg-violet-600 text-white py-2 px-4 rounded hover:bg-violet-700 w-fit"
        >
          Switch to {show ? "Companies" : "Users"}
        </button>
        <button
          onClick={showSavedLists}
          className="bg-orange-500 text-white py-2 px-4 rounded hover:bg-orange-600"
        >
          Saved Lists
        </button>
        <button
          onClick={openAddCompanyModal}
          className="bg-yellow-500 text-white py-2 px-4 rounded hover:bg-yellow-600 w-fit"
        >
          Add Company
        </button>
        <ExportCompanies companies={filteredUsers} />
        <button
          onClick={goToScheduled}
          className="bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700 w-fit"
        >
          View Scheduled Emails
        </button>
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearch}
          onBlur={() =>
            toast.info("Do not forget to clear search bar after use. 😊")
          }
          placeholder="Search..."
          className="ml-auto px-4 py-2 rounded"
        />
      </div>

      {/* Menu For Selected User And Companies */}
      <div className="h-20 mb-4">
        {selectedUsers.length > 0 && (
          <div className="bg-gray-700 p-4 rounded-lg shadow-md mb-4">
            <p className="text-gray-50 mb-2">
              {selectedUsers.length} user(s) selected
            </p>
            <div className="flex gap-4">
              {!show && selectedUsers.length === 1 && (
                <button
                  onClick={handleUpdateCompany}
                  className="bg-yellow-500 text-white py-2 px-4 rounded hover:bg-yellow-600"
                >
                  Edit
                </button>
              )}
              <button
                onClick={deleteSelectedUsers}
                className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
              >
                Delete
              </button>
              <button
                onClick={mailSelectedUsers}
                className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
              >
                Mail
              </button>
              <button
                onClick={handleScheduleEmail}
                className="bg-violet-600 text-white py-2 px-4 rounded hover:bg-violet-700"
              >
                Schedule Email
              </button>
              <button
                onClick={handleSaveList}
                className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 w-fit"
              >
                Save Selected As A List
              </button>
            </div>
          </div>
        )}
      </div>

      {showAddCompanyModal && (
        <AddCompany
          upd={updateCompany}
          users={users}
          setUsers={setUsers}
          selectedUsers={selectedUsers[0]}
          setSelectedUsers={setSelectedUsers}
          closeForm={closeAddCompanyModal}
        />
      )}

      {(showEmailForm || schedule) && (
        <Email
          closeForm={closeEmailForm}
          show={show}
          users={users}
          selectedUsers={selectedUsers}
          savedLists={savedLists}
          selectedSavedLists={selectedSavedLists}
          schedule={schedule}
          mState={mState}
        />
      )}

{showSavedListsTable && (
        <div
          className="absolute top-0 left-0 w-full h-max-screen bg-gray-800 bg-opacity-80 flex flex-col items-center justify-center z-50"
          style={{ zIndex: 1050 }}
        >
          <div className="bg-gray-700 p-6 rounded-lg shadow-md w-3/4">
            <div className="flex gap-4 mb-4">
              <button
                onClick={toggleManualListForm}
                className="bg-green-500 text-white px-2 py-2 rounded hover:bg-green-600"
              >
                Add New List
              </button>

              {selectedSavedLists.length === 1 && (
                <div className="flex gap-4">
                  <button
                    onClick={deleteSavedList}
                    className="bg-red-500 text-white px-2 py-2 rounded hover:bg-red-600"
                  >
                    Delete{" "}
                    {
                      savedLists.find(
                        (list) => list._id === selectedSavedLists[0]
                      )?.listName
                    }
                  </button>
                  <button
                    onClick={mailSavedList}
                    className="bg-blue-500 text-white px-2 py-2 rounded hover:bg-blue-600"
                  >
                    Mail{" "}
                    {
                      savedLists.find(
                        (list) => list._id === selectedSavedLists[0]
                      )?.listName
                    }
                  </button>
                  <button
                    onClick={handleScheduleEmail}
                    className="bg-violet-600 text-white px-2 rounded hover:bg-violet-700"
                  >
                    Schedule Email for{" "}
                    {
                      savedLists.find(
                        (list) => list._id === selectedSavedLists[0]
                      )?.listName
                    }
                  </button>
                  <button
                    onClick={addToExisitingList}
                    className="bg-red-700 text-white px-2 py-2 rounded hover:bg-red-800"
                  >
                    Add to{" "}
                    {
                      savedLists.find(
                        (list) => list._id === selectedSavedLists[0]
                      )?.listName
                    }
                  </button>
                </div>
              )}
            </div>

            <table className="min-w-full bg-gray-800 text-gray-50">
              <thead>
                <tr>
                  <th className="py-2 px-4 text-center">List Name</th>
                  <th className="py-2 px-4 text-center">List Emails</th>
                  <th className="py-2 px-4 text-center">List Contact Names</th>
                  <th className="py-2 px-4 text-center">Select</th>
                </tr>
              </thead>

              <tbody>
                {savedLists.map((list) => (
                  <tr key={list._id} className="border-t border-gray-700">
                    <td className="py-2 px-4 text-center">{list.listName}</td>
                    <td className="py-2 px-4 text-center">
                      {list.listItems
                        .map((listItem) => listItem.email)
                        .join(", ")}
                    </td>
                    <td className="py-2 px-4 text-center">
                      {list.listItems
                        .map((listItem) => listItem.contactName)
                        .join(", ")}
                    </td>
                    <td className="py-2 px-4 text-center">
                      <input
                        type="checkbox"
                        checked={selectedSavedLists.includes(list._id)}
                        onChange={() => toggleSavedListSelection(list._id)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <button
              onClick={closeSavedListsTable}
              className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 mt-4"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {showSaveListModal && (
        <div
          className="absolute top-0 left-0 w-full h-max-screen bg-gray-800 bg-opacity-80 flex items-center justify-center z-50"
          style={{ zIndex: 1150 }}
        >
          <div className="bg-gray-700 p-6 rounded-lg shadow-md w-3/4 max-w-lg">
            <h3 className="text-gray-50 text-lg mb-4">Name Your List</h3>
            <div className="mb-4">
              <label className="text-gray-50">List Name:</label>
              <input
                type="text"
                value={listName}
                onChange={(e) => setListName(e.target.value)}
                placeholder="Enter a name for your list"
                className="w-full px-3 py-2 rounded mt-2"
              />
            </div>
            <div className="flex justify-between">
              {typedEmail.trim() && (
                <button
                  onClick={openSaveListModal}
                  className="bg-yellow-400 text-white py-2 px-4 rounded hover:bg-yellow-500"
                >
                  Save List
                </button>
              )}
              <button
                onClick={closeSaveListModal}
                className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showManualListForm && (
        <div
          className="absolute top-0 left-0 w-full h-max-screen bg-gray-800 bg-opacity-80 flex items-center justify-center z-50"
          style={{ zIndex: 1200 }}
        >
          <div className="bg-gray-700 p-6 rounded-lg shadow-md w-3/4 max-w-lg">
            <h3 className="text-gray-50 text-lg mb-4">Add List Manually</h3>
            <div className="mb-4">
              <label className="text-gray-50">List Name:</label>
              <input
                type="text"
                value={listName}
                onChange={(e) => setListName(e.target.value)}
                placeholder="Enter a name for your list"
                className="w-full px-3 py-2 rounded mt-2"
              />
            </div>
            <div className="mb-4">
              <label className="text-gray-50">Emails (comma-separated):</label>
              <textarea
                value={typedEmail}
                onChange={(e) => setTypedEmail(e.target.value)}
                placeholder="Enter email addresses separated by commas"
                className="w-full px-3 py-2 rounded mt-2"
              />
            </div>
            <div className="flex justify-between">
              <button
                onClick={handleAddListManually}
                className="bg-yellow-400 text-white py-2 px-4 rounded hover:bg-yellow-500"
              >
                Save List
              </button>
              <button
                onClick={toggleManualListForm}
                className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table For Users And Companies */}
      <div className="overflow-x-auto">
        <div className="relative">
          <div className="overflow-y-auto max-h-[500px]">
            <table className="min-w-full bg-gray-800 text-gray-50">
              <thead className="sticky top-0 bg-gray-900">
                {show ? (
                  <tr>
                    <th className="py-2 px-4 text-center">Full Name</th>
                    <th className="py-2 px-4 text-center">Username</th>
                    <th className="py-2 px-4 text-center">Email</th>
                    <th className="py-2 px-4 text-center">Created At</th>
                    <th className="py-2 px-4 text-center">Updated At</th>
                    <th className="py-2 px-4 text-center"></th>
                  </tr>
                ) : (
                  <tr>
                    <th className="py-2 px-4 text-center">Company Name</th>
                    <th className="py-2 px-4 text-center">Company Address</th>
                    <th className="py-2 px-4 text-center">Company Email</th>
                    <th className="py-2 px-4 text-center">Company Contact</th>
                    <th className="py-2 px-4 text-center">Company Product</th>
                    <th className="py-2 px-4 text-center">Company Notes</th>
                    <th className="py-2 px-4 text-center">
                      <input
                        className="ml-2"
                        type="checkbox"
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedUsers(
                              filteredUsers.map((user) => user._id)
                            );
                          } else {
                            setSelectedUsers([]);
                          }
                        }}
                      />
                    </th>
                  </tr>
                )}
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user._id} className="border-t border-gray-700">
                    <td className="py-2 px-4 text-center">
                      {show ? (
                        user.fullName
                      ) : (
                        <>
                          {user.companyName}
                          <br />({user.companyContactPersonName})
                        </>
                      )}
                    </td>
                    <td className="py-2 px-4 text-center">
                      {show ? (
                        user.userName
                      ) : (
                        <>
                          {user.companyAddress}
                          <br />({user.companyCountry})
                        </>
                      )}
                    </td>
                    <td className="py-2 px-4 text-center">
                      {show ? user.email : user.companyEmail}
                    </td>
                    <td className="py-2 px-4 text-center">
                      {show ? (
                        new Date(user.createdAt).toLocaleString()
                      ) : (
                        <>
                          {user.companyPhone}
                          <br />({user.companyContactPersonPhone})
                        </>
                      )}
                    </td>
                    <td className="py-2 px-4 text-center">
                      {show ? (
                        new Date(user.updatedAt).toLocaleString()
                      ) : (
                        <>
                          {user.companyProductGroup?.join(", ")}
                          <br />(
                          <a
                            href={user.companyWebsite}
                            target="_blank"
                            className="text-blue-400 underline"
                          >
                            {user.companyWebsite}
                          </a>
                          )
                        </>
                      )}
                    </td>

                    {viewNote && noteId === user._id && (
                      <Notes
                        user={user}
                        show={show}
                        note={note}
                        setNote={setNote}
                        noteId={noteId}
                        closeForm={closeNote}
                        updatedNoteInList={updateUserNote}
                      />
                    )}

                    <td className="py-2 px-4 text-center">
                      {show ? (
                        ""
                      ) : (
                        <div className="flex items-center justify-center gap-2">
                          <span className="text-gray-300 text-sm truncate max-w-[200px]">
                            {user.companyNotes || "No notes"}
                          </span>
                          <button
                            onClick={() => handleNote(user._id, user.companyNotes)}
                            className="px-2 bg-yellow-600 hover:bg-yellow-700 rounded"
                          >
                            ✎
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="py-2 px-4 text-center">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user._id)}
                        onChange={() => toggleUserSelection(user._id)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
