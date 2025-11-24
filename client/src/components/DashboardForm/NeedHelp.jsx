import React, { useState } from "react";
import api from "../../utils/api"; 
import styles from "./NeedHelp.module.css";

const NeedHelp = () => {
  const [isModal, setIsModal] = useState(false);
  const [email, setEmail] = useState("");
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!email || !comment) {
      alert("Email ve yorum boş olamaz!");
      return;
    }

    setLoading(true);

    try {
      
      await api.post("/help", { email, comment });

      alert("Mesaj başarıyla gönderildi!");
      setIsModal(false);
      setEmail("");
      setComment("");
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Sunucuya ulaşılamıyor!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Kutu */}
      <div className={styles.container} onClick={() => setIsModal(true)}>
        <img
          src="../../images/2.png" 
          alt="saksı"
          className={styles.plantImage}
          width="54"
        />

        <p className={styles.text}>
          If you need help with <span className={styles.highlight}>TaskPro</span>, check out our
          support resources or reach out to our customer support team.
        </p>
        
        <div className={styles.helpLink}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
             <path d="M10 18.3333C14.6024 18.3333 18.3333 14.6023 18.3333 9.99996C18.3333 5.39759 14.6024 1.66663 10 1.66663C5.39763 1.66663 1.66667 5.39759 1.66667 9.99996C1.66667 14.6023 5.39763 18.3333 10 18.3333Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
             <path d="M7.56638 7.67567C7.80929 7.09826 8.38652 6.70225 9.01176 6.70225H9.26631C10.2369 6.70225 11.0237 7.48897 11.0237 8.45954C11.0237 9.43011 10.2369 10.2168 9.26631 10.2168V11.0547" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
             <path d="M9.25423 14H9.26257" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>Need help?</span>
        </div>
      </div>

   
      {isModal && (
        <div className={styles.modalBackdrop} onClick={() => setIsModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h1 className={styles.modalTitle}>Need Help</h1>
            
            <input
              type="email"
              placeholder="Email address"
              className={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoFocus
            />
            
            <textarea
              placeholder="Comment"
              rows={4}
              className={styles.textarea}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            
            <button 
                className={styles.sendButton} 
                onClick={handleSend} 
                disabled={loading}
            >
              {loading ? "Sending..." : "Send"}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default NeedHelp;