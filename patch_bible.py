import re

with open("src/pages/BibleReadPage.jsx", "r") as f:
    content = f.read()

# 1. Add state for bookmarks and drawer
content = content.replace('const [highlights, setHighlights] = useState({});', 
'''const [highlights, setHighlights] = useState({});
  const [bookmarks, setBookmarks] = useState({});
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);''')

# 2. Update fetch function
fetch_orig = '''  const fetchBookHighlights = async (userId) => {
    try {
      const q = query(
        collection(db, "highlights"),
        where("userId", "==", userId),
        where("bibleId", "==", bibleId),
        where("bookId", "==", bookId)
      );
      const querySnapshot = await getDocs(q);
      const hMap = {};
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        hMap[data.verseKey] = data.color;
      });
      setHighlights(hMap);
    } catch (err) {
      console.error("Error fetching highlights:", err);
    }
  };'''

fetch_new = '''  const fetchUserData = async (userId) => {
    try {
      // Highlights
      const hQ = query(collection(db, "highlights"), where("userId", "==", userId), where("bibleId", "==", bibleId), where("bookId", "==", bookId));
      const hSnap = await getDocs(hQ);
      const hMap = {};
      hSnap.forEach((d) => hMap[d.data().verseKey] = d.data().color);
      setHighlights(hMap);

      // Bookmarks
      const bQ = query(collection(db, "bookmarks"), where("userId", "==", userId));
      const bSnap = await getDocs(bQ);
      const bMap = {};
      bSnap.forEach((d) => bMap[d.data().verseKey] = d.data());
      setBookmarks(bMap);
    } catch (err) {
      console.error("Error fetching user data:", err);
    }
  };'''

content = content.replace(fetch_orig, fetch_new)
content = content.replace('fetchBookHighlights(user.uid);', 'fetchUserData(user.uid);')

# 3. Handle verse text in handlePassageClick
handle_orig = '''      const verseKey = `${chapterId}.${verseNum}`;
      
      const x = Math.min(e.clientX, window.innerWidth - 150);
      setPopover({
        visible: true,
        x: x,
        y: e.clientY,
        verseKey
      });'''

handle_new = '''      const verseKey = `${chapterId}.${verseNum}`;
      
      let rawText = pEl.textContent.trim();
      if (rawText.startsWith(verseNum)) {
         rawText = rawText.substring(verseNum.length).trim();
      }

      setPopover({
        visible: true,
        x: e.clientX,
        y: e.clientY,
        verseKey,
        text: rawText
      });'''
content = content.replace(handle_orig, handle_new)

# 4. Add toggleBookmark
apply_hl_sig = 'const applyHighlight = async (color, e) => {'
toggle_bm_func = '''  const toggleBookmark = async (e) => {
    if (e) {
      e.stopPropagation();
      if (e.nativeEvent) e.nativeEvent.stopImmediatePropagation();
    }
    const { verseKey, text } = popover;
    if (!verseKey) return;
    
    const isBookmarked = !!bookmarks[verseKey];
    
    setBookmarks(prev => {
      const newMap = { ...prev };
      if (isBookmarked) delete newMap[verseKey];
      else newMap[verseKey] = { text, timestamp: new Date(), bibleId, bookId, chapterId: verseKey.split('.').slice(0, 2).join('.') };
      return newMap;
    });
    
    if (!auth.currentUser) return;

    try {
      const docRef = doc(db, "bookmarks", `${auth.currentUser.uid}_${bibleId}_${verseKey}`);
      if (isBookmarked) {
        await deleteDoc(docRef);
      } else {
        await setDoc(docRef, {
          userId: auth.currentUser.uid,
          bibleId,
          bookId,
          chapterId: verseKey.split('.').slice(0, 2).join('.'),
          verseKey,
          text,
          timestamp: new Date()
        });
      }
    } catch (err) {
      console.error("Error saving bookmark", err);
    }
  };

  '''
content = content.replace(apply_hl_sig, toggle_bm_func + apply_hl_sig)

# 5. Fix popover rendering and add bookmark icon
popover_orig = '''      {popover.visible && (
        <div className="highlight-popover" style={{
          position: 'fixed',
          top: popover.y - 50,
          left: popover.x,
          backgroundColor: '#ffffff',
          borderRadius: '24px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
          display: 'flex',
          gap: '8px',
          padding: '8px',
          zIndex: 1000
        }}>
          <button onClick={(e) => applyHighlight('#fef08a', e)} style={{ background: '#fef08a', width: '28px', height: '28px', borderRadius: '50%', border: 'none', cursor: 'pointer' }} aria-label="Yellow"></button>
          <button onClick={(e) => applyHighlight('#fbcfe8', e)} style={{ background: '#fbcfe8', width: '28px', height: '28px', borderRadius: '50%', border: 'none', cursor: 'pointer' }} aria-label="Pink"></button>
          <button onClick={(e) => applyHighlight('#bfdbfe', e)} style={{ background: '#bfdbfe', width: '28px', height: '28px', borderRadius: '50%', border: 'none', cursor: 'pointer' }} aria-label="Blue"></button>
          <button onClick={(e) => applyHighlight('#bbf7d0', e)} style={{ background: '#bbf7d0', width: '28px', height: '28px', borderRadius: '50%', border: 'none', cursor: 'pointer' }} aria-label="Green"></button>
          <div style={{ width: '1px', background: '#e5e7eb', margin: '0 4px' }}></div>
          <button onClick={(e) => applyHighlight('clear', e)} style={{ background: 'transparent', width: '28px', height: '28px', borderRadius: '50%', border: '1px solid #d1d5db', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', color: '#6b7280' }} aria-label="Clear">✕</button>
        </div>
      )}'''

popover_new = '''      {popover.visible && (
        <div className="highlight-popover" style={{
          position: 'fixed',
          top: Math.max(10, popover.y - 70),
          left: Math.max(10, popover.x - 120),
          backgroundColor: '#ffffff',
          borderRadius: '24px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px',
          zIndex: 1000
        }}>
          <button onClick={(e) => applyHighlight('#fef08a', e)} style={{ background: '#fef08a', width: '28px', height: '28px', borderRadius: '50%', border: 'none', cursor: 'pointer' }} aria-label="Yellow"></button>
          <button onClick={(e) => applyHighlight('#fbcfe8', e)} style={{ background: '#fbcfe8', width: '28px', height: '28px', borderRadius: '50%', border: 'none', cursor: 'pointer' }} aria-label="Pink"></button>
          <button onClick={(e) => applyHighlight('#bfdbfe', e)} style={{ background: '#bfdbfe', width: '28px', height: '28px', borderRadius: '50%', border: 'none', cursor: 'pointer' }} aria-label="Blue"></button>
          <button onClick={(e) => applyHighlight('#bbf7d0', e)} style={{ background: '#bbf7d0', width: '28px', height: '28px', borderRadius: '50%', border: 'none', cursor: 'pointer' }} aria-label="Green"></button>
          <div style={{ width: '1px', height: '24px', background: '#e5e7eb', margin: '0 4px' }}></div>
          <button onClick={(e) => applyHighlight('clear', e)} style={{ background: 'transparent', width: '28px', height: '28px', borderRadius: '50%', border: '1px solid #d1d5db', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', color: '#6b7280' }} aria-label="Clear">✕</button>
          <div style={{ width: '1px', height: '24px', background: '#e5e7eb', margin: '0 4px' }}></div>
          <button onClick={(e) => toggleBookmark(e)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: bookmarks[popover.verseKey] ? '#ef4444' : '#9ca3af' }} aria-label="Bookmark">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill={bookmarks[popover.verseKey] ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </button>
        </div>
      )}'''
content = content.replace(popover_orig, popover_new)

# 6. Add Drawer UI
drawer_ui = '''
      {/* Bookmarks Drawer */}
      <div style={{
        position: 'fixed',
        top: 0,
        right: 0,
        height: '100vh',
        width: '320px',
        backgroundColor: '#1f2937',
        color: '#f9fafb',
        boxShadow: '-4px 0 20px rgba(0,0,0,0.5)',
        transform: isDrawerOpen ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        zIndex: 2000,
        padding: '2rem',
        overflowY: 'auto'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>Bookmarks</h2>
          <button onClick={() => setIsDrawerOpen(false)} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        
        {Object.keys(bookmarks).length === 0 ? (
          <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>No bookmarks yet. Click a verse and tap the bookmark icon to save it.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {Object.entries(bookmarks)
              .sort((a, b) => b[1].timestamp - a[1].timestamp)
              .map(([key, data]) => (
              <div key={key} style={{ backgroundColor: '#374151', padding: '1rem', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginBottom: '0.5rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {data.bookId} {data.chapterId.split('.').pop()}:{key.split('.').pop()}
                </div>
                <div style={{ fontSize: '0.875rem', lineHeight: 1.6, color: '#e5e7eb' }}>
                  "{data.text}"
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Drawer Overlay */}
      {isDrawerOpen && (
        <div 
          onClick={() => setIsDrawerOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0,0,0,0.3)',
            backdropFilter: 'blur(2px)',
            zIndex: 1999
          }}
        />
      )}
'''

# append drawer right before the closing div
content = content.replace('    </div>\n  );\n}', drawer_ui + '    </div>\n  );\n}')

# 7. Add Header button
header_orig = '''        <button 
          className="full-read-toggle"
          onClick={() => setIsFullRead(!isFullRead)}
        >
          Full Read: {isFullRead ? 'ON' : 'OFF'}
        </button>'''

header_new = '''        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button 
            className="full-read-toggle"
            onClick={() => setIsFullRead(!isFullRead)}
          >
            Full Read: {isFullRead ? 'ON' : 'OFF'}
          </button>
          <button 
            className="full-read-toggle"
            onClick={() => setIsDrawerOpen(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
            Bookmarks
          </button>
        </div>'''
content = content.replace(header_orig, header_new)

with open("src/pages/BibleReadPage.jsx", "w") as f:
    f.write(content)

