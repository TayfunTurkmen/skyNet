import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom'; // Outlet eklendi

import Sidebar from '../DashboardForm/Sidebar'; 
import NewBoardModal from '../DashboardForm/NewBoardModal'; 
import DeleteModal from '../DeleteModal/DeleteModal'; 
import api from '../../utils/api';
import { AUTH_STORAGE_KEY, CLOUDINARY_BASE_URL } from '../../config';
// CSS dosyasını Layout klasörüne taşıyabilir veya yolunu düzeltebilirsiniz
import styles from '../../pages/DashboardPage/DashboardPage.module.css'; 

const MainLayout = () => {
  // --- STATE'LERİN HEPSİ BURADA KALACAK ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false); 
  const [boardToEdit, setBoardToEdit] = useState(null); 
  const [boardToDeleteId, setBoardToDeleteId] = useState(null);
  const [userBoards, setUserBoards] = useState([]);
  const [loadingBoards, setLoadingBoards] = useState(true);
  const [activeBoardId, setActiveBoardId] = useState(null);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  const navigate = useNavigate();

  // --- USE EFFECT'LER (AYNI) ---
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchBoards = async () => {
      try {
        setLoadingBoards(true);
        const res = await api.get('/boards');
        setUserBoards(res.data);
        if (res.data.length > 0 && !activeBoardId) {
           setActiveBoardId(res.data[0]._id);
        }
      } catch (err) { console.error(err); } 
      finally { setLoadingBoards(false); }
    };
    fetchBoards();
  }, [navigate]); 

  // --- ARKAPLAN MANTIĞI (AYNI) ---
  const activeBoard = userBoards.find(board => board._id === activeBoardId);
  let bgImage = null;
  if (activeBoard && activeBoard.background && activeBoard.background !== 'default') {
    const bgId = activeBoard.background;
    if (bgId.startsWith('custom_')) {
       bgImage = `url(${CLOUDINARY_BASE_URL}/q_auto,f_auto/${bgId})`;
    } else {
       const safeBgId = bgId.endsWith('.jpg') ? bgId : `${bgId}.jpg`;
       bgImage = `url(${CLOUDINARY_BASE_URL}/w_1920,q_auto,f_auto/${safeBgId})`;
    }
  }

  // --- FONKSİYONLAR (AYNI) ---
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const handleActiveBoardChange = (id) => { setActiveBoardId(id); setIsSidebarOpen(false); };
  const openCreateModal = () => { setIsEditMode(false); setBoardToEdit(null); setIsModalOpen(true); };
  const handleEditBoard = (id) => { const b = userBoards.find(x => x._id === id); if(b){ setBoardToEdit(b); setIsEditMode(true); setIsModalOpen(true); }};
  const openDeleteModal = (id) => { setBoardToDeleteId(id); setIsDeleteModalOpen(true); };
  const handleBoardCreated = (newBoard) => { setUserBoards(p => [newBoard, ...p]); setActiveBoardId(newBoard._id); };
  const handleBoardUpdated = (upd) => { setUserBoards(p => p.map(b => (b._id === upd._id ? upd : b))); };
  
  const confirmDeleteBoard = async () => {
    if (!boardToDeleteId) return;
    try {
      await api.delete(`/boards/${boardToDeleteId}`);
      const newBoards = userBoards.filter(b => b._id !== boardToDeleteId);
      setUserBoards(newBoards);
      if (activeBoardId === boardToDeleteId) setActiveBoardId(newBoards.length > 0 ? newBoards[0]._id : null);
      setIsDeleteModalOpen(false);
    } catch (error) { alert("Hata"); }
  };
  const handleToggleFavorite = async (id, status) => {
      const newStatus = !status;
      setUserBoards(p => p.map(b => b._id === id ? { ...b, isFavorite: newStatus } : b));
      await api.put(`/boards/${id}`, { isFavorite: newStatus });
  };
  const handleLogout = () => { localStorage.removeItem(AUTH_STORAGE_KEY); navigate('/welcome', { replace: true }); };

  return (
    <div className={styles.dashboardLayout}> 
      
      {/* SIDEBAR */}
      <Sidebar 
        boards={userBoards} onCreateNewBoard={openCreateModal} isLoading={loadingBoards}
        onDeleteBoard={openDeleteModal} onEditBoard={handleEditBoard} onToggleFavorite={handleToggleFavorite}
        activeBoardId={activeBoardId} onActiveBoardChange={handleActiveBoardChange}
        isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} onLogout={handleLogout} 
      />

      {/* ANA İÇERİK ÇERÇEVESİ */}
      <main className={styles.mainContent} style={{ 
           backgroundImage: bgImage, backgroundSize: 'cover', backgroundPosition: 'center',
           backgroundColor: bgImage ? 'transparent' : '#f4f7f6', transition: '0.3s'
      }}>
        <header className={styles.mainHeader}>
          <button className={styles.menuButton} onClick={toggleSidebar}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={bgImage ? "#fff" : "#121212"} strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
          <h1 style={{ color: bgImage ? '#FFFFFF' : '#121212', textShadow: bgImage ? '0 1px 4px rgba(0,0,0,0.8)' : 'none' }}>
            {activeBoard ? activeBoard.title : 'Dashboard'}
          </h1>
        </header>
        
        {/* --- DEĞİŞEN İÇERİK BURAYA GELECEK (Outlet) --- */}
        {/* activeBoard verisini alt sayfalara gönderiyoruz */}
        <Outlet context={{ activeBoard }} />

      </main>

      {/* MODALLAR */}
      {isModalOpen && <NewBoardModal onClose={() => setIsModalOpen(false)} isEditMode={isEditMode} initialData={boardToEdit} onBoardCreated={handleBoardCreated} onBoardUpdated={handleBoardUpdated} />}
      {isDeleteModalOpen && <DeleteModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={confirmDeleteBoard} title="Delete board" />}
    </div>
  );
}

export default MainLayout;