import { useEffect, useState } from 'react';

const KT_FARBEN = {
  'BLL4314':'#A0522D','BLL6410':'#1976D2','BLL6413':'#7B1FA2',
  'BLL6416':'#388E3C','BLL6424':'#F57C00','EPS136':'#0288D1',
  'EPS154':'#C62828','EPS156':'#689F38','EPS186':'#00796B','Karton':'#616161'
};
function ktFarbe(kt) { return KT_FARBEN[kt] || '#3a3a6b'; }

export default function View() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeGruppe, setActiveGruppe] = useState(null);

  useEffect(() => {
    fetch('/api/ernte')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
    const iv = setInterval(() => {
      fetch('/api/ernte').then(r => r.json()).then(setData);
    }, 30000);
    return () => clearInterval(iv);
  }, []);

  if (loading) return (
    <div style={styles.center}>
      <div style={styles.spinner}></div>
      <p style={{color:'#7a7060',marginTop:12,fontSize:14}}>Wird geladen…</p>
    </div>
  );

  if (!data) return (
    <div style={styles.center}>
      <div style={{fontSize:48}}>🌱</div>
      <p style={{color:'#7a7060',marginTop:12,fontSize:16,textAlign:'center'}}>Noch keine Einteilung veröffentlicht.</p>
    </div>
  );

  const { datum, gruppen, kulturen } = data;

  if (activeGruppe !== null) {
    const g = gruppen[activeGruppe];
    const karten = g.kids.map(kid => kulturen.find(k => k.id === kid)).filter(Boolean);
    return (
      <div style={styles.page}>
        <div style={styles.header}>
          <button onClick={() => setActiveGruppe(null)} style={styles.backBtn}>← Zurück</button>
          <div>
            <div style={styles.headerLogo}>Bauers Garten · {datum}</div>
            <div style={styles.headerTitle}>{g.name}</div>
          </div>
        </div>

        {karten.map((k, i) => (
          <div key={i} style={styles.kulturCard}>
            <div style={styles.kulturName}>{k.name}</div>

            {/* EK Badge für Radieschen */}
            {k.sumPal && (
              <div style={{...styles.badge, background:'#2d5016', marginBottom:16}}>
                <div style={styles.badgeLbl}>Erntekisten</div>
                <div style={styles.badgeNum}>{k.sumEK}</div>
                <div style={styles.badgeSub}>{k.sumPal} Paletten</div>
              </div>
            )}

            {/* Kistentyp Badges */}
            {!k.sumPal && k.ktMap && (
              <div style={styles.badgeRow}>
                {Object.entries(k.ktMap).sort((a,b) => b[1]-a[1]).map(([kt, anz]) => (
                  <div key={kt} style={{...styles.badge, background: ktFarbe(kt)}}>
                    <div style={styles.badgeLbl}>{kt}</div>
                    <div style={styles.badgeNum}>{anz}</div>
                    <div style={styles.badgeSub}>Kisten</div>
                  </div>
                ))}
              </div>
            )}

            {/* Sorten */}
            {k.sorten && k.sorten.map((s, j) => (
              <div key={j}>
                <div style={styles.sorte}>
                  <span>{s.name}</span>
                  <span style={{color:'#2d5016',fontWeight:700}}>{s.ek !== null ? `${s.vk} VK · ${s.ek} EK` : `${s.vk} Kisten`}</span>
                </div>
                {s.kunden && s.kunden.map((ku, m) => (
                  <div key={m} style={styles.kunde}>
                    <span style={styles.kundeName}>{ku.n}</span>
                    <div style={styles.kundeRight}>
                      <span style={styles.kundeVK}>{ku.m}</span>
                      <span style={{...styles.ktBadge, background: ktFarbe(s.kt)}}>{s.kt}</span>
                      {ku.ek && <span style={styles.kundeEK}>{ku.ek} EK</span>}
                    </div>
                  </div>
                ))}
              </div>
            ))}

            {/* Salat */}
            {k.typ === 'salat' && k.salProdukte && k.salProdukte.map((p, j) => (
              <div key={j} style={styles.sorte}>
                <span>{p.name}</span>
                <div style={styles.kundeRight}>
                  <span style={{...styles.ktBadge, background: ktFarbe(p.kt)}}>{p.kt}</span>
                  <span style={styles.kundeVK}>{k.salatKunden ? k.salatKunden.reduce((s,kd) => s+(p.km[kd]||0), 0) : p.vk}</span>
                </div>
              </div>
            ))}
          </div>
        ))}

        {karten.length === 0 && (
          <div style={styles.leer}>— keine Zuteilung —</div>
        )}
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div style={styles.headerLogo}>Bauers Garten</div>
        <div style={styles.headerTitle}>Ernte {datum}</div>
        <div style={{fontSize:12,color:'#7a7060',marginTop:2}}>Tippe auf eine Gruppe</div>
      </div>

      {gruppen.map((g, i) => {
        const karten = g.kids.map(kid => kulturen.find(k => k.id === kid)).filter(Boolean);
        const farbe = ['#2d5016','#7a4010','#1a3a5c','#7a1a1a','#1a5c4a','#5c3a7a'][i % 6];
        return (
          <div key={i} style={{...styles.gruppeCard, borderLeftColor: farbe}} onClick={() => setActiveGruppe(i)}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
              <div style={{...styles.gruppeTitle, color: farbe}}>{g.name}</div>
              <span style={{color:'#c8c0b0', fontSize:20}}>›</span>
            </div>
            <div style={styles.gruppeKulturen}>
              {karten.length === 0
                ? <span style={{color:'#ccc',fontStyle:'italic'}}>leer</span>
                : karten.map((k,j) => (
                    <span key={j} style={styles.kulturChip}>{k.name}</span>
                  ))
              }
            </div>
          </div>
        );
      })}

      <div style={styles.footer}>Aktualisiert alle 30 Sek.</div>
    </div>
  );
}

const styles = {
  page: { fontFamily: 'system-ui, sans-serif', background: '#f7f4ee', minHeight: '100vh', padding: '0 0 40px' },
  center: { display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'100vh', background:'#f7f4ee' },
  spinner: { width:32, height:32, border:'3px solid #e8f0e0', borderTopColor:'#2d5016', borderRadius:'50%', animation:'spin 0.8s linear infinite' },
  header: { background:'white', padding:'16px 16px 14px', borderBottom:'2px solid #2d5016', marginBottom:16 },
  backBtn: { background:'none', border:'none', color:'#2d5016', fontSize:16, fontWeight:600, padding:'0 0 8px', cursor:'pointer', display:'block' },
  headerLogo: { fontSize:11, color:'#7a7060', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:2 },
  headerTitle: { fontSize:24, fontWeight:700, color:'#2d5016', fontFamily:'Georgia, serif' },
  gruppeCard: { background:'white', margin:'0 12px 12px', borderRadius:10, padding:'14px 16px', borderLeft:'4px solid', boxShadow:'0 1px 4px rgba(0,0,0,0.08)', cursor:'pointer' },
  gruppeTitle: { fontSize:20, fontWeight:700, fontFamily:'Georgia, serif' },
  gruppeKulturen: { display:'flex', flexWrap:'wrap', gap:6, marginTop:8 },
  kulturChip: { background:'#e8f0e0', color:'#2d5016', borderRadius:20, padding:'3px 10px', fontSize:12, fontWeight:500 },
  kulturCard: { background:'white', margin:'0 12px 12px', borderRadius:10, padding:'14px 16px', boxShadow:'0 1px 4px rgba(0,0,0,0.08)' },
  kulturName: { fontSize:18, fontWeight:700, color:'#2d5016', fontFamily:'Georgia, serif', marginBottom:10 },
  badgeRow: { display:'flex', flexWrap:'wrap', gap:10, marginBottom:14 },
  badge: { color:'white', borderRadius:10, padding:'10px 16px', textAlign:'center', minWidth:80 },
  badgeLbl: { fontSize:11, fontWeight:800, letterSpacing:'0.05em', marginBottom:3 },
  badgeNum: { fontSize:32, fontWeight:700, lineHeight:1 },
  badgeSub: { fontSize:11, opacity:0.85, marginTop:3 },
  sorte: { display:'flex', justifyContent:'space-between', alignItems:'center', padding:'9px 0', borderBottom:'1px solid #e8f0e0', fontSize:14, fontWeight:600, color:'#2d5016', gap:8 },
  kunde: { display:'flex', justifyContent:'space-between', alignItems:'center', padding:'7px 0 7px 12px', borderBottom:'1px dotted #ece8e0', fontSize:14 },
  kundeName: { color:'#333', flex:1 },
  kundeRight: { display:'flex', alignItems:'center', gap:6 },
  kundeVK: { fontWeight:700, fontSize:15, color:'#111' },
  ktBadge: { color:'white', borderRadius:5, padding:'2px 7px', fontSize:11, fontWeight:800 },
  kundeEK: { color:'#2d5016', fontWeight:700, fontSize:13 },
  leer: { color:'#ccc', fontStyle:'italic', textAlign:'center', padding:32, fontSize:16 },
  footer: { textAlign:'center', color:'#bbb', fontSize:11, marginTop:24 },
};
