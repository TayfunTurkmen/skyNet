import React from 'react';
import styles from './Sidebar.module.css'; 
import SvgIcon from './SvgIcon'; 
import NeedHelp from './NeedHelp';

function Sidebar({ 
  boards, onCreateNewBoard, isLoading, onEditBoard, onDeleteBoard, 
  onToggleFavorite, activeBoardId, onActiveBoardChange, 
  isOpen, onClose, 
  onLogout
}) {

  const sortedBoards = [...boards].sort((a, b) => {
    if (a.isFavorite === b.isFavorite) return 0; 
    return a.isFavorite ? -1 : 1;
  });

  const handleBoardClick = (id, e) => {
    e.preventDefault();
    if (onActiveBoardChange) onActiveBoardChange(id);
    if (window.innerWidth < 1280 && onClose) onClose();
  };

  const handleFav = (board, e) => { e.preventDefault(); e.stopPropagation(); if (onToggleFavorite) onToggleFavorite(board._id, board.isFavorite); };
  const handleEdit = (boardId, e) => { e.preventDefault(); e.stopPropagation(); if (onEditBoard) onEditBoard(boardId); };
  const handleDelete = (boardId, e) => { e.preventDefault(); e.stopPropagation(); if (onDeleteBoard) onDeleteBoard(boardId); };

  return (
    <>
      <div className={`${styles.backdrop} ${isOpen ? styles.backdropOpen : ''}`} onClick={onClose}></div>
      <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
        
        {/* LOGO */}
        <div className={styles.logoContainer}>
          <div className={styles.logoBox}>
            <svg width="24" height="24" viewBox="0 0 32 32" fill="none" className={styles.logoIcon}><path fillRule="evenodd" clipRule="evenodd" d="M10.663 30.054c0.489-2.543 0.905-5.22 1.494-7.897 0.29-1.401-0.063-1.999-1.63-1.892s-3.313 0.053-4.979 0c-1.666-0.054-1.965-0.892-1.005-2.088 4.726-5.836 9.506-11.6 14.268-17.347 0.534-0.651 1.15-1.115 2.028-0.625s0.697 1.098 0.552 1.829c-0.525 2.677-0.96 5.354-1.539 7.978-0.299 1.356 0.091 1.838 1.503 1.785 1.417-0.071 2.837-0.071 4.255 0 0.806 0 1.865-0.419 2.281 0.678s-0.462 1.562-0.905 2.213c-1.811 2.231-3.645 4.459-5.504 6.684-2.722 3.248-5.423 6.484-8.102 9.709-0.525 0.633-1.114 1.142-2.010 0.821s-0.706-1.080-0.706-1.847z" fill="#FFFFFF" /></svg>
          </div>
          <span className={styles.appName}>Task Pro</span>
        </div>
        
        <p className={styles.boardsTitle}>My boards</p>

        <div className={styles.createBoardContainer}>
          <button onClick={onCreateNewBoard} className={styles.createButton}>
            <span className={styles.createText}>Create a <br/> new board</span>
            <div className={styles.plusIconBox}><SvgIcon iconName="icon-block" size={20} /></div>
          </button>
        </div>

        <nav className={styles.boardList}>
          {isLoading ? <p className={styles.loadingText}>Yükleniyor...</p> : 
            sortedBoards.map(board => {
              const isActive = activeBoardId === board._id;
              const showActions = isActive || board.isFavorite;
              return (
                <div key={board._id} className={`${styles.boardItem} ${isActive ? styles.active : ''}`} onClick={(e) => handleBoardClick(board._id, e)}>
                  <div className={styles.boardLink}>
                    <span className={styles.boardIcon}><SvgIcon iconName={board.icon} size={18} /></span>
                    <span className={styles.boardTitleText} title={board.title}>{board.title}</span>
                  </div>
                  <div className={styles.actions} style={{ display: showActions ? 'flex' : 'none' }}>
                    <button className={`${styles.actionBtn} ${board.isFavorite ? styles.favActive : ''}`} onClick={(e) => handleFav(board, e)}>
                       <SvgIcon iconName="icon-push_pin" size={18} viewBox="0 0 24 24" />
                    </button>
                    {isActive && <>
                      <button className={styles.actionBtn} onClick={(e) => handleEdit(board._id, e)}><SvgIcon iconName="icon-pencil" size={16} /></button>
                      <button className={styles.actionBtn} onClick={(e) => handleDelete(board._id, e)}><SvgIcon iconName="icon-trash" size={16} /></button>
                    </>}
                  </div>
                </div>
              );
            })
          }
        </nav>

        <NeedHelp />

        <button className={styles.logoutButton} onClick={onLogout}>
          <SvgIcon iconName="icon-logout" size={32} className={styles.logoutIcon} />
          <span>Log out</span>
        </button>

      </aside>
    </>
  );
}
export default Sidebar;