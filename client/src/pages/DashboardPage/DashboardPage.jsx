import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import Sidebar from "../../components/DashboardForm/Sidebar";
import NewBoardModal from "../../components/DashboardForm/NewBoardModal";
import DeleteModal from "../../components/DashboardForm/DeleteModal";
import AddColumnModal from "../../components/Modals/AddColumnModal/AddColumnModal";
import Column from "../../components/Column/Column.jsx";
import Navbar from "../../components/Header/Navbar.jsx";
import {
  fetchBoards,
  createBoard,
  updateBoard,
  deleteBoard,
  selectBoard,
  clearCurrentBoard,
} from "../../redux/slices/boardsSlice";
import { createColumn, deleteColumn, fetchColumns, updateColumn } from "../../redux/slices/columnsSlice.js";
import { AUTH_STORAGE_KEY, CLOUDINARY_BASE_URL } from "../../config";
import styles from "./DashboardPage.module.css";

function DashboardPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { boardId: routeBoardId } = useParams();

  // 💡 Board ve Kolon verileri Redux'tan çekildi
  const { items: userBoards, currentBoard, isLoading: loadingBoards } = useSelector((state) => state.boards);
  const { items: columnsData, isLoading: loadingColumns } = useSelector((state) => state.columns);

  // 💡 isDeleteModalToOpen tutarlılığı sağlandı.
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalToOpen, setIsDeleteModalToOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [boardToEdit, setBoardToEdit] = useState(null);
  const [boardToDeleteId, setBoardToDeleteId] = useState(null);
  const [isAddColumnModalOpen, setIsAddColumnModalOpen] = useState(false);
  const [activeTheme, setActiveTheme] = useState(() => localStorage.getItem("taskProTheme") || "light");

  useEffect(() => {
    dispatch(fetchBoards());
  }, [dispatch]);

  // Tema değişimi
  useEffect(() => {
    const themes = ["light", "dark", "violet"];
    themes.forEach((t) => document.body.classList.remove(t));
    document.body.classList.add(activeTheme);
    localStorage.setItem("taskProTheme", activeTheme);
  }, [activeTheme]);

  const storedUser = useMemo(() => {
    try {
      const raw = localStorage.getItem(AUTH_STORAGE_KEY);
      return raw ? JSON.parse(raw)?.user : null;
    } catch (err) {
      return null;
    }
  }, []);

  // ------------------ Helpers ------------------
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const handleActiveBoardChange = (id) => {
    dispatch(selectBoard(id));
    setIsSidebarOpen(false);
    navigate(`/dashboard/${id}`, { replace: true });
  };

  const handleLogout = () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    navigate("/welcome", { replace: true });
  };

  const openCreateModal = () => {
    setIsEditMode(false);
    setBoardToEdit(null);
    setIsModalOpen(true);
  };

  const handleEditBoard = (id) => {
    const board = userBoards.find((b) => b._id === id);
    if (board) {
      setBoardToEdit(board);
      setIsEditMode(true);
      setIsModalOpen(true);
    }
  };

  const openDeleteModal = (id) => {
    setBoardToDeleteId(id);
    setIsDeleteModalToOpen(true);
  };

  const handleBoardCreated = async (boardData) => {
    try {
      const createdBoard = await dispatch(createBoard(boardData)).unwrap();
      if (createdBoard?._id) {
        dispatch(selectBoard(createdBoard._id));
        navigate(`/dashboard/${createdBoard._id}`, { replace: true });
      }
    } finally {
      setIsModalOpen(false);
    }
  };

  const handleBoardUpdated = (updatedBoard) => {
    dispatch(updateBoard({ boardId: updatedBoard._id, boardData: updatedBoard }));
    setIsModalOpen(false);
  };

  const confirmDeleteBoard = async () => {
    if (!boardToDeleteId) return;
    const deletedId = boardToDeleteId;
    try {
      await dispatch(deleteBoard(deletedId)).unwrap();
      const remaining = userBoards.filter((b) => b._id !== deletedId);
      if (remaining.length > 0) {
        dispatch(selectBoard(remaining[0]._id));
        navigate(`/dashboard/${remaining[0]._id}`, { replace: true });
      } else {
        dispatch(clearCurrentBoard());
        navigate("/home", { replace: true });
      }
    } finally {
      setIsDeleteModalToOpen(false);
    }
  };

  const handleToggleFavorite = (id, status) => {
    const newStatus = !status;
    dispatch(updateBoard({ boardId: id, boardData: { isFavorite: newStatus } }));
  };

  // Add Column submit handler
  const handleAddColumn = (title) => {
    console.log("Current Board ID:", currentBoard._id, "Title:", title);
    if (!currentBoard) return;

    dispatch(
      createColumn({
        boardId: currentBoard._id,
        columnData: { title },
      })
    );
    // Yerel state güncellemesi (setColumns) kaldırıldı.
    setIsAddColumnModalOpen(false);
  };

  const handleEditColumn = (columnId, newTitle) => {
    dispatch(
      updateColumn({
        columnId,
        columnData: { title: newTitle },
      })
    );
  };

  const handleDeleteColumn = async (columnId) => {
    try {
      await dispatch(deleteColumn(columnId)).unwrap();
      // Yerel state güncellemesi (setColumns) kaldırıldı.
    } catch (err) {
      console.error("Kolon silinirken hata:", err);
    }
  };

  // Route param ile board seçimi
  useEffect(() => {
    if (!userBoards.length) return;

    if (location.pathname.startsWith("/home")) {
      dispatch(clearCurrentBoard());
      return;
    }

    if (routeBoardId) {
      dispatch(selectBoard(routeBoardId));
    } else if (location.pathname.startsWith("/dashboard")) {
      dispatch(clearCurrentBoard());
      navigate("/home", { replace: true });
    }
  }, [routeBoardId, userBoards.length, dispatch, navigate, location.pathname]);

  // Board listesi var ama rota yoksa ilk boarda otomatik gir
  useEffect(() => {
    if (!userBoards.length) return;
    if (location.pathname.startsWith("/home") && !routeBoardId) {
      const first = userBoards[0];
      if (first?._id) {
        dispatch(selectBoard(first._id));
        navigate(`/dashboard/${first._id}`, { replace: true });
      }
    }
    if (location.pathname.startsWith("/dashboard") && !routeBoardId && currentBoard?._id) {
      navigate(`/dashboard/${currentBoard._id}`, { replace: true });
    }
  }, [userBoards, routeBoardId, currentBoard?._id, location.pathname, navigate, dispatch]);

  // currentBoard değişince ve /dashboard'da isek kolonları çek
  useEffect(() => {
    if (!currentBoard) return;
    if (!location.pathname.startsWith("/dashboard")) return;
    dispatch(fetchColumns(currentBoard._id));
  }, [currentBoard, dispatch, location.pathname]);

  // ------------------ Background ------------------
  let bgImage = null;
  if (currentBoard && currentBoard.background && currentBoard.background !== "default") {
    const bgId = currentBoard.background;
    if (bgId.startsWith("custom_")) {
      bgImage = `url(${CLOUDINARY_BASE_URL}/q_auto,f_auto/${bgId})`;
    } else {
      const safeBgId = bgId.endsWith(".jpg") ? bgId : `${bgId}.jpg`;
      bgImage = `url(${CLOUDINARY_BASE_URL}/w_1920,q_auto,f_auto/${safeBgId})`;
    }
  }

  // ------------------ Render ------------------
  return (
    <div className={styles.dashboardLayout}>
      {/* Sidebar */}
      <Sidebar
        boards={userBoards}
        onCreateNewBoard={openCreateModal}
        isLoading={loadingBoards}
        onDeleteBoard={openDeleteModal}
        onEditBoard={handleEditBoard}
        onToggleFavorite={handleToggleFavorite}
        onLogout={handleLogout}
        activeBoardId={currentBoard?._id}
        onActiveBoardChange={handleActiveBoardChange}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content */}
      <main className={styles.mainContent}>
        <header className={styles.mainHeader}>
          <button className={styles.menuButton} onClick={toggleSidebar}>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#121212"
              strokeWidth="2"
            >
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>

          <Navbar title="" activeTheme={activeTheme} onThemeChange={setActiveTheme} user={storedUser} />
        </header>

        <div
          className={styles.boardArea}
          style={{
            backgroundImage: bgImage || "none",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            backgroundColor: bgImage ? "transparent" : "#f4f5fb",
          }}
        >
          <div className={styles.boardTopBar}>
            <h1 className={styles.boardTitle}>{currentBoard ? currentBoard.title : ""}</h1>
            <button type="button" className={styles.filterButton} title="Filters">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 5h18L14 12.5V19l-4 2v-8.5L3 5z" />
              </svg>
              Filters
            </button>
          </div>

          {!currentBoard || !location.pathname.startsWith("/dashboard") ? (
            <div className={styles.emptyState}>
              <p>
                Before starting your project, it is essential <span className={styles.highlight}>to create a board</span> to visualize and
                track all the necessary tasks and milestones. This board serves as a powerful tool to organize the workflow
                and ensure effective collaboration among team members.
              </p>
            </div>
          ) : (
            <div className={styles.boardColumnsContainer}>
              {loadingColumns ? (
                <p style={{ padding: "20px", color: bgImage ? "#fff" : "#121212" }}>Kolonlar Yükleniyor...</p>
              ) : (
                columnsData?.map(
                  (col) =>
                    col && (
                      <Column
                        key={col._id}
                        column={col}
                        onEdit={handleEditColumn}
                        onDelete={() => handleDeleteColumn(col._id)}
                      />
                    )
                )
              )}

              <button className={styles.addColumnButton} onClick={() => setIsAddColumnModalOpen(true)} disabled={loadingColumns}>
                <span className={styles.plusBox}>+</span>
                Add another column
              </button>

              {isAddColumnModalOpen && (
                <AddColumnModal
                  isOpen={isAddColumnModalOpen}
                  onClose={() => setIsAddColumnModalOpen(false)}
                  onSubmit={handleAddColumn}
                />
              )}
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      {isModalOpen && (
        <NewBoardModal
          onClose={() => setIsModalOpen(false)}
          isEditMode={isEditMode}
          initialData={boardToEdit}
          onBoardCreated={handleBoardCreated}
          onBoardUpdated={handleBoardUpdated}
        />
      )}

      {isDeleteModalToOpen && (
        <DeleteModal
          isOpen={isDeleteModalToOpen}
          onClose={() => setIsDeleteModalToOpen(false)}
          onConfirm={confirmDeleteBoard}
          title="Delete board"
        />
      )}
    </div>
  );
}

export default DashboardPage;
