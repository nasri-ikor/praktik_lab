const { useState, useCallback } = React;

// ── Skinfold configs ──────────────────────────────────────────────────────────
const SKINFOLD_CONFIG = {
  "3": {
    label: "3 Titik",
    ref: "Jackson & Pollock (1978)",
    sites_L: [
      { key: "dada",    label: "Dada",       hint: "Diagonal, ½ jarak antara garis anterior axilla & puting" },
      { key: "abdomen", label: "Abdomen",    hint: "Vertikal, 2 cm di kanan umbilikus" },
      { key: "paha",    label: "Paha",       hint: "Vertikal, ½ anterior mid-paha" },
    ],
    sites_P: [
      { key: "trisep",    label: "Trisep",      hint: "Vertikal, mid posterior lengan atas" },
      { key: "suprailiak",label: "Suprailiak",  hint: "Diagonal, tepat di atas krista iliaka" },
      { key: "paha",      label: "Paha",        hint: "Vertikal, ½ anterior mid-paha" },
    ],
    calc: (vals, sex, age) => {
      const s = vals.reduce((a, b) => a + b, 0);
      let bd;
      if (sex === "L") {
        bd = 1.10938 - 0.0008267 * s + 0.0000016 * s * s - 0.0002574 * age;
      } else {
        bd = 1.0994921 - 0.0009929 * s + 0.0000023 * s * s - 0.0001392 * age;
      }
      return ((4.95 / bd - 4.50) * 100).toFixed(1);
    },
  },
  "4": {
    label: "4 Titik",
    ref: "Durnin & Womersley (1974)",
    sites_L: [
      { key: "trisep",     label: "Trisep",      hint: "Vertikal, mid posterior lengan atas" },
      { key: "bisep",      label: "Bisep",       hint: "Vertikal, mid anterior lengan atas" },
      { key: "subscapula", label: "Subscapula",  hint: "Diagonal 45°, tepat di bawah sudut scapula" },
      { key: "suprailiak", label: "Suprailiak",  hint: "Diagonal, tepat di atas krista iliaka" },
    ],
    sites_P: null,
    calc: (vals, sex, age) => {
      const s = vals.reduce((a, b) => a + b, 0);
      const logSum = Math.log10(s);
      let bd;
      if (sex === "L") {
        if (age < 20) bd = 1.1533 - 0.0643 * logSum;
        else if (age < 30) bd = 1.1610 - 0.0632 * logSum;
        else if (age < 40) bd = 1.1422 - 0.0544 * logSum;
        else bd = 1.1620 - 0.0700 * logSum;
      } else {
        if (age < 20) bd = 1.1549 - 0.0678 * logSum;
        else if (age < 30) bd = 1.1599 - 0.0717 * logSum;
        else if (age < 40) bd = 1.1423 - 0.0632 * logSum;
        else bd = 1.1333 - 0.0612 * logSum;
      }
      return ((4.95 / bd - 4.50) * 100).toFixed(1);
    },
  },
  "7": {
    label: "7 Titik",
    ref: "Jackson & Pollock (1978)",
    sites_L: [
      { key: "dada",       label: "Dada",        hint: "Diagonal, ½ jarak garis anterior axilla & puting" },
      { key: "midaxilla",  label: "Mid-axilla",  hint: "Horizontal, setinggi prosesus xiphoid" },
      { key: "trisep",     label: "Trisep",      hint: "Vertikal, mid posterior lengan atas" },
      { key: "subscapula", label: "Subscapula",  hint: "Diagonal 45°, tepat di bawah sudut scapula" },
      { key: "abdomen",    label: "Abdomen",     hint: "Vertikal, 2 cm di kanan umbilikus" },
      { key: "suprailiak", label: "Suprailiak",  hint: "Diagonal, tepat di atas krista iliaka" },
      { key: "paha",       label: "Paha",        hint: "Vertikal, ½ anterior mid-paha" },
    ],
    sites_P: null,
    calc: (vals, sex, age) => {
      const s = vals.reduce((a, b) => a + b, 0);
      let bd;
      if (sex === "L") {
        bd = 1.112 - 0.00043499 * s + 0.00000055 * s * s - 0.00028826 * age;
      } else {
        bd = 1.097 - 0.00046971 * s + 0.00000056 * s * s - 0.00012828 * age;
      }
      return ((4.95 / bd - 4.50) * 100).toFixed(1);
    },
  },
};

function calcIMT(bb, tb) {
  const m = parseFloat(tb) / 100;
  if (!bb || !tb || m === 0) return null;
  return (parseFloat(bb) / (m * m)).toFixed(1);
}
function imt_kat(imt) {
  if (!imt) return null;
  const v = parseFloat(imt);
  if (v < 17.0) return { label: "Sangat Kurus", color: "#3B82F6" };
  if (v < 18.5) return { label: "Kurus", color: "#6366F1" };
  if (v < 25.0) return { label: "Normal", color: "#10B981" };
  if (v < 27.0) return { label: "Gemuk", color: "#F59E0B" };
  return { label: "Obesitas", color: "#EF4444" };
}
function td_kat(sis, dia) {
  if (!sis || !dia) return null;
  const s = parseInt(sis), d = parseInt(dia);
  if (s < 90 || d < 60) return { label: "Hipotensi", color: "#3B82F6" };
  if (s < 120 && d < 80) return { label: "Normal", color: "#10B981" };
  if (s < 130 && d < 80) return { label: "Elevated", color: "#84CC16" };
  if (s < 140 || d < 90) return { label: "Hipertensi Tk. 1", color: "#F59E0B" };
  if (s < 180 || d < 120) return { label: "Hipertensi Tk. 2", color: "#EF4444" };
  return { label: "Krisis Hipertensi", color: "#7F1D1D" };
}
function lemak_kat(pct, sex) {
  if (!pct || !sex) return null;
  const v = parseFloat(pct);
  if (sex === "L") {
    if (v < 6)  return { label: "Essential Fat", color: "#3B82F6" };
    if (v < 14) return { label: "Atlet", color: "#10B981" };
    if (v < 18) return { label: "Fit", color: "#84CC16" };
    if (v < 25) return { label: "Rata-rata", color: "#F59E0B" };
    return { label: "Obesitas", color: "#EF4444" };
  } else {
    if (v < 14) return { label: "Essential Fat", color: "#3B82F6" };
    if (v < 21) return { label: "Atlet", color: "#10B981" };
    if (v < 25) return { label: "Fit", color: "#84CC16" };
    if (v < 32) return { label: "Rata-rata", color: "#F59E0B" };
    return { label: "Obesitas", color: "#EF4444" };
  }
}

function KatChip({ kat }) {
  if (!kat) return null;
  return (
    <span style={{ display:"inline-block", padding:"2px 12px", borderRadius:99, fontSize:12, fontWeight:700, letterSpacing:".04em", color:"#fff", background:kat.color }}>
      {kat.label}
    </span>
  );
}

function Field({ label, name, value, onChange, unit, type="text", hint, min, max, step, required }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
      <label style={{ fontSize:11, fontWeight:700, letterSpacing:".08em", color:"#94A3B8", textTransform:"uppercase" }}>
        {label}{required && <span style={{ color:"#EF4444", marginLeft:2 }}>*</span>}
      </label>
      <div style={{ display:"flex", alignItems:"center" }}>
        <input type={type} name={name} value={value} onChange={onChange}
          min={min} max={max} step={step} placeholder={hint||""}
          style={{ flex:1, padding:"10px 14px", border:"1.5px solid #1E3A5F", borderRight:unit?"none":"1.5px solid #1E3A5F", borderRadius:unit?"6px 0 0 6px":"6px", background:"#0F1E30", color:"#E2E8F0", fontSize:15, fontFamily:"'DM Mono', monospace", outline:"none", transition:"border-color .2s" }}
          onFocus={e => e.target.style.borderColor="#38BDF8"}
          onBlur={e => e.target.style.borderColor="#1E3A5F"}
        />
        {unit && (
          <span style={{ padding:"10px 12px", background:"#1E3A5F", border:"1.5px solid #1E3A5F", borderLeft:"none", borderRadius:"0 6px 6px 0", color:"#94A3B8", fontSize:13, fontFamily:"'DM Mono', monospace", whiteSpace:"nowrap" }}>
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}

function RadioGroup({ label, name, value, onChange, options, required }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
      <label style={{ fontSize:11, fontWeight:700, letterSpacing:".08em", color:"#94A3B8", textTransform:"uppercase" }}>
        {label}{required && <span style={{ color:"#EF4444", marginLeft:2 }}>*</span>}
      </label>
      <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
        {options.map(o => (
          <label key={o.value} style={{ flex:1, minWidth:100, display:"flex", alignItems:"center", justifyContent:"center", gap:6, padding:"9px 6px", border:`1.5px solid ${value===o.value?"#38BDF8":"#1E3A5F"}`, borderRadius:6, cursor:"pointer", background:value===o.value?"#0EA5E920":"#0F1E30", color:value===o.value?"#38BDF8":"#94A3B8", fontSize:13, fontWeight:700, transition:"all .2s" }}>
            <input type="radio" name={name} value={o.value} checked={value===o.value} onChange={onChange} style={{ display:"none" }} />
            {o.label}
          </label>
        ))}
      </div>
    </div>
  );
}

function DerivedRow({ label, value, unit, kat }) {
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 16px", background:"#0F1E30", border:"1.5px solid #1E3A5F", borderRadius:8, gap:8 }}>
      <span style={{ fontSize:13, color:"#94A3B8", fontWeight:600 }}>{label}</span>
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        {value && <span style={{ fontFamily:"'DM Mono', monospace", fontSize:18, fontWeight:700, color:"#E2E8F0" }}>{value} <span style={{ fontSize:12, color:"#64748B" }}>{unit}</span></span>}
        <KatChip kat={kat} />
      </div>
    </div>
  );
}

function Card({ title, icon, children, accent }) {
  return (
    <div style={{ background:"#0A1628", border:`1.5px solid ${accent||"#1E3A5F"}`, borderRadius:12, overflow:"hidden" }}>
      <div style={{ padding:"14px 20px", borderBottom:`1.5px solid ${accent||"#1E3A5F"}`, display:"flex", alignItems:"center", gap:10, background:"#0D1E33" }}>
        <span style={{ fontSize:20 }}>{icon}</span>
        <span style={{ fontWeight:800, fontSize:14, letterSpacing:".06em", color:accent||"#38BDF8", textTransform:"uppercase" }}>{title}</span>
      </div>
      <div style={{ padding:"20px", display:"flex", flexDirection:"column", gap:16 }}>{children}</div>
    </div>
  );
}

function StepNav({ current, setCurrent }) {
  const steps = ["IMT", "Tekanan Darah", "Skinfold", "Hasil"];
  return (
    <div style={{ display:"flex", gap:0, borderRadius:10, overflow:"hidden", border:"1.5px solid #1E3A5F" }}>
      {steps.map((s, i) => (
        <button key={s} onClick={() => setCurrent(i)} style={{ flex:1, padding:"10px 4px", border:"none", borderRight:i<steps.length-1?"1.5px solid #1E3A5F":"none", background:current===i?"#38BDF8":"transparent", color:current===i?"#0A1628":"#64748B", fontWeight:700, fontSize:11, letterSpacing:".05em", cursor:"pointer", transition:"all .2s", textTransform:"uppercase" }}>
          {i+1}. {s}
        </button>
      ))}
    </div>
  );
}

function SkinfoldSiteRow({ site, idx, value, onChange }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 14px", background:"#0A1628", border:"1px solid #1E3A5F", borderRadius:8 }}>
      <div style={{ width:24, height:24, borderRadius:6, background:"linear-gradient(135deg,#0EA5E9,#6366F1)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:800, color:"#fff", flexShrink:0 }}>{idx+1}</div>
      <div style={{ flex:1, minWidth:0 }}>
        <p style={{ fontSize:13, fontWeight:700, color:"#E2E8F0" }}>{site.label}</p>
        <p style={{ fontSize:11, color:"#475569", marginTop:2 }}>{site.hint}</p>
      </div>
      <div style={{ display:"flex", alignItems:"center", flexShrink:0 }}>
        <input type="number" value={value} onChange={e => onChange(site.key, e.target.value)}
          placeholder="0.0" min={1} max={80} step={0.5}
          style={{ width:70, padding:"7px 10px", border:"1.5px solid #1E3A5F", borderRight:"none", borderRadius:"6px 0 0 6px", background:"#0F1E30", color:"#E2E8F0", fontSize:14, fontFamily:"'DM Mono', monospace", outline:"none", textAlign:"right" }}
          onFocus={e => e.target.style.borderColor="#38BDF8"}
          onBlur={e => e.target.style.borderColor="#1E3A5F"}
        />
        <span style={{ padding:"7px 10px", background:"#1E3A5F", border:"1.5px solid #1E3A5F", borderLeft:"none", borderRadius:"0 6px 6px 0", color:"#94A3B8", fontSize:12, fontFamily:"'DM Mono', monospace" }}>mm</span>
      </div>
    </div>
  );
}

function PrintRow({ label, value, unit, kat, bold }) {
  return (
    <tr>
      <td style={{ padding:"6px 10px", color:"#475569", fontSize:13, fontWeight:bold?700:400 }}>{label}</td>
      <td style={{ padding:"6px 10px", fontFamily:"monospace", fontSize:14, fontWeight:700, color:"#0F172A" }}>{value||"—"} <span style={{ fontWeight:400, color:"#94A3B8", fontSize:12 }}>{unit}</span></td>
      <td style={{ padding:"6px 10px" }}>{kat && <span style={{ padding:"2px 10px", borderRadius:99, fontSize:11, fontWeight:700, color:"#fff", background:kat.color }}>{kat.label}</span>}</td>
    </tr>
  );
}

function LabForm() {
  const [step, setStep] = useState(0);
  const [d, setD] = useState({
    nama:"", nim:"", sex:"", usia:"", kelas:"",
    tanggal:new Date().toISOString().slice(0,10), praktikan:"",
    bb:"", tb:"",
    sis1:"", dia1:"", nadi1:"",
    sis2:"", dia2:"", nadi2:"",
    titik:"3",
    lingkar_pinggang:"", lingkar_pinggul:"",
  });
  const [sfVals, setSfVals] = useState({});

  const upd = useCallback(e => {
    const { name, value } = e.target;
    setD(prev => ({ ...prev, [name]: value }));
    if (name === "titik") setSfVals({});
  }, []);

  const updSF = useCallback((key, val) => setSfVals(prev => ({ ...prev, [key]: val })), []);

  const imt = calcIMT(d.bb, d.tb);
  const imtKat = imt_kat(imt);
  const avgSis  = d.sis1&&d.sis2?((parseInt(d.sis1)+parseInt(d.sis2))/2).toFixed(0):d.sis1||null;
  const avgDia  = d.dia1&&d.dia2?((parseInt(d.dia1)+parseInt(d.dia2))/2).toFixed(0):d.dia1||null;
  const avgNadi = d.nadi1&&d.nadi2?((parseInt(d.nadi1)+parseInt(d.nadi2))/2).toFixed(0):d.nadi1||null;
  const tdKat = td_kat(avgSis, avgDia);

  const cfg = SKINFOLD_CONFIG[d.titik];
  const sites = (d.sex==="P" && cfg.sites_P) ? cfg.sites_P : cfg.sites_L;
  const sfComplete = sites.every(s => sfVals[s.key] && parseFloat(sfVals[s.key]) > 0);
  const sumSF = sfComplete ? sites.reduce((a,s) => a+parseFloat(sfVals[s.key]), 0) : null;
  const calcPct = (sfComplete && d.sex && d.usia) ? cfg.calc(sites.map(s => parseFloat(sfVals[s.key])), d.sex, parseInt(d.usia)) : null;
  const lemakKat = lemak_kat(calcPct, d.sex);

  let whr=null, whrKat=null;
  if (d.lingkar_pinggang && d.lingkar_pinggul) {
    whr = (parseFloat(d.lingkar_pinggang)/parseFloat(d.lingkar_pinggul)).toFixed(2);
    const v = parseFloat(whr);
    if (d.sex==="L") whrKat = v<0.90?{label:"Normal",color:"#10B981"}:{label:"Risiko Tinggi",color:"#EF4444"};
    else whrKat = v<0.85?{label:"Normal",color:"#10B981"}:{label:"Risiko Tinggi",color:"#EF4444"};
  }

  const G  = { display:"flex", flexDirection:"column", gap:14 };
  const G2 = { display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 };

  const TitikTabs = () => (
    <div style={{ display:"flex", gap:0, borderRadius:8, overflow:"hidden", border:"1.5px solid #1E3A5F" }}>
      {[["3","3 Titik","📍"],["4","4 Titik","📍📍"],["7","7 Titik","📍📍📍"]].map(([v,lbl,ico]) => (
        <button key={v} onClick={() => { setD(p=>({...p,titik:v})); setSfVals({}); }} style={{ flex:1, padding:"11px 6px", border:"none", borderRight:v!=="7"?"1.5px solid #1E3A5F":"none", background:d.titik===v?"linear-gradient(90deg,#0EA5E9,#6366F1)":"transparent", color:d.titik===v?"#fff":"#64748B", fontWeight:800, fontSize:12, letterSpacing:".04em", cursor:"pointer", transition:"all .2s", display:"flex", flexDirection:"column", alignItems:"center", gap:2 }}>
          <span style={{ fontSize:16 }}>{ico}</span>{lbl}
        </button>
      ))}
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Syne:wght@700;800&family=Inter:wght@400;500;600;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}body{background:#060E1A}
        ::-webkit-scrollbar{width:6px}::-webkit-scrollbar-track{background:#0A1628}::-webkit-scrollbar-thumb{background:#1E3A5F;border-radius:99px}
        input[type=number]::-webkit-inner-spin-button{opacity:.4}
        @media print{.no-print{display:none!important}.print-only{display:block!important}body{background:#fff}}
        .print-only{display:none}
      `}</style>
      <div style={{ minHeight:"100vh", background:"#060E1A", fontFamily:"'Inter', sans-serif", color:"#E2E8F0", padding:"24px 16px 48px" }}>
        <div style={{ maxWidth:680, margin:"0 auto" }}>

          <div style={{ marginBottom:28, textAlign:"center" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:12, marginBottom:6 }}>
              <div style={{ width:40,height:40,borderRadius:10,background:"linear-gradient(135deg,#0EA5E9,#6366F1)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20 }}>⚕️</div>
              <h1 style={{ fontFamily:"'Syne',sans-serif",fontSize:22,fontWeight:800,letterSpacing:"-.01em",background:"linear-gradient(90deg,#38BDF8,#818CF8)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent" }}>Lab Kesehatan Olahraga</h1>
            </div>
            <p style={{ fontSize:12,color:"#475569",letterSpacing:".08em",textTransform:"uppercase" }}>Formulir Pengukuran Komposisi Tubuh & Hemodinamik</p>
          </div>

          <div className="no-print" style={{ marginBottom:20 }}><StepNav current={step} setCurrent={setStep} /></div>

          {/* STEP 0 */}
          {step===0 && (
            <div style={G}>
              <Card title="Identitas Mahasiswa" icon="🎓">
                <div style={G2}>
                  <Field label="Nama Lengkap" name="nama" value={d.nama} onChange={upd} hint="Nama sesuai KTM" required />
                  <Field label="NIM" name="nim" value={d.nim} onChange={upd} hint="Nomor Induk Mahasiswa" required />
                </div>
                <div style={G2}>
                  <RadioGroup label="Jenis Kelamin" name="sex" value={d.sex} onChange={upd} required options={[{value:"L",label:"♂ Laki-laki"},{value:"P",label:"♀ Perempuan"}]} />
                  <Field label="Usia" name="usia" value={d.usia} onChange={upd} type="number" unit="tahun" hint="20" min={10} max={80} required />
                </div>
                <div style={G2}>
                  <Field label="Kelas" name="kelas" value={d.kelas} onChange={upd} hint="mis. A / Karyawan" />
                  <Field label="Tanggal Praktikum" name="tanggal" value={d.tanggal} onChange={upd} type="date" required />
                </div>
                <Field label="Nama Praktikan / Penguji" name="praktikan" value={d.praktikan} onChange={upd} hint="Nama dosen / asisten lab" />
              </Card>
              <Card title="Indeks Massa Tubuh (IMT)" icon="⚖️">
                <div style={G2}>
                  <Field label="Berat Badan" name="bb" value={d.bb} onChange={upd} type="number" unit="kg" hint="65.5" step="0.1" min={20} max={200} required />
                  <Field label="Tinggi Badan" name="tb" value={d.tb} onChange={upd} type="number" unit="cm" hint="170" step="0.1" min={100} max={250} required />
                </div>
                <DerivedRow label="IMT (Quetelet)" value={imt} unit="kg/m²" kat={imtKat} />
                <p style={{ fontSize:11,color:"#475569",lineHeight:1.7 }}><strong style={{color:"#64748B"}}>Klasifikasi IMT (Kemenkes RI):</strong><br/>&lt;17.0 Sangat Kurus · 17–18.4 Kurus · 18.5–24.9 Normal · 25.0–26.9 Gemuk · ≥27.0 Obesitas</p>
              </Card>
              <button onClick={() => setStep(1)} style={{ padding:"13px",borderRadius:8,border:"none",background:"linear-gradient(90deg,#0EA5E9,#6366F1)",color:"#fff",fontWeight:700,fontSize:14,cursor:"pointer",letterSpacing:".04em" }}>Lanjut → Tekanan Darah</button>
            </div>
          )}

          {/* STEP 1 */}
          {step===1 && (
            <div style={G}>
              <Card title="Tekanan Darah & Denyut Nadi" icon="🫀">
                <p style={{ fontSize:12,color:"#475569" }}>Istirahat minimal 5 menit. Lakukan 2× pengukuran dengan jeda 1–2 menit.</p>
                {[["1","#38BDF8"],["2","#6366F1"]].map(([n,col]) => (
                  <div key={n} style={{ padding:14,border:"1px dashed #1E3A5F",borderRadius:8 }}>
                    <p style={{ fontSize:11,fontWeight:700,color:col,letterSpacing:".08em",textTransform:"uppercase",marginBottom:12 }}>Pengukuran ke-{n}</p>
                    <div style={G2}>
                      <Field label="Sistolik" name={`sis${n}`} value={d[`sis${n}`]} onChange={upd} type="number" unit="mmHg" hint="120" min={50} max={250} />
                      <Field label="Diastolik" name={`dia${n}`} value={d[`dia${n}`]} onChange={upd} type="number" unit="mmHg" hint="80" min={30} max={150} />
                    </div>
                    <div style={{ marginTop:12 }}>
                      <Field label="Denyut Nadi" name={`nadi${n}`} value={d[`nadi${n}`]} onChange={upd} type="number" unit="bpm" hint="72" min={30} max={220} />
                    </div>
                  </div>
                ))}
                <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
                  <p style={{ fontSize:11,fontWeight:700,color:"#94A3B8",letterSpacing:".08em",textTransform:"uppercase" }}>Rata-rata</p>
                  <DerivedRow label="Tekanan Darah Rata-rata" value={avgSis&&avgDia?`${avgSis}/${avgDia}`:null} unit="mmHg" kat={tdKat} />
                  {avgNadi && <DerivedRow label="Denyut Nadi Rata-rata" value={avgNadi} unit="bpm" />}
                </div>
                <p style={{ fontSize:11,color:"#475569",lineHeight:1.7 }}><strong style={{color:"#64748B"}}>Klasifikasi (AHA 2017):</strong><br/>&lt;90/60 Hipotensi · &lt;120/80 Normal · 120–129 Elevated · 130–139/80–89 HT Tk.1 · ≥140/90 HT Tk.2 · ≥180/120 Krisis</p>
              </Card>
              <div style={{ display:"flex",gap:10 }}>
                <button onClick={() => setStep(0)} style={{ flex:1,padding:"12px",borderRadius:8,border:"1.5px solid #1E3A5F",background:"transparent",color:"#94A3B8",fontWeight:700,cursor:"pointer" }}>← Kembali</button>
                <button onClick={() => setStep(2)} style={{ flex:2,padding:"12px",borderRadius:8,border:"none",background:"linear-gradient(90deg,#0EA5E9,#6366F1)",color:"#fff",fontWeight:700,cursor:"pointer" }}>Lanjut → Pengukuran Skinfold</button>
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {step===2 && (
            <div style={G}>
              <Card title="Pilih Metode Skinfold" icon="📐" accent="#0EA5E9">
                <p style={{ fontSize:12,color:"#475569" }}>
                  Pilih jumlah titik pengukuran. Gunakan kaliper skinfold, cubit 3× ambil nilai tengah.
                  {d.sex && <strong style={{color:"#38BDF8"}}> Protokol untuk {d.sex==="L"?"Laki-laki":"Perempuan"} diterapkan.</strong>}
                </p>
                <TitikTabs />
                <div style={{ padding:"10px 14px",background:"#0F1E30",borderLeft:"3px solid #0EA5E9",borderRadius:"0 6px 6px 0" }}>
                  <p style={{ fontSize:11,fontWeight:700,color:"#38BDF8",marginBottom:2 }}>{cfg.label} — {cfg.ref}</p>
                  <p style={{ fontSize:11,color:"#475569" }}>
                    {d.titik==="3" && d.sex==="L" && "Protokol Laki-laki: Dada, Abdomen, Paha"}
                    {d.titik==="3" && d.sex==="P" && "Protokol Perempuan: Trisep, Suprailiak, Paha"}
                    {d.titik==="3" && !d.sex && "⚠️ Isi jenis kelamin di Langkah 1 agar protokol disesuaikan."}
                    {d.titik==="4" && "Trisep, Bisep, Subscapula, Suprailiak — sama untuk semua jenis kelamin."}
                    {d.titik==="7" && "Dada, Mid-axilla, Trisep, Subscapula, Abdomen, Suprailiak, Paha — sama untuk semua jenis kelamin."}
                  </p>
                </div>
              </Card>

              <Card title={`Input Tebal Lipatan Kulit (${cfg.label})`} icon="📏" accent="#6366F1">
                {(!d.sex && d.titik==="3") && (
                  <div style={{ padding:"10px 14px",background:"#1A1000",border:"1px solid #F59E0B",borderRadius:6,fontSize:12,color:"#F59E0B" }}>
                    ⚠️ Lengkapi jenis kelamin di Langkah 1 — protokol 3 titik berbeda antara laki-laki dan perempuan.
                  </div>
                )}
                <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
                  {sites.map((site,idx) => (
                    <SkinfoldSiteRow key={site.key} site={site} idx={idx} value={sfVals[site.key]||""} onChange={updSF} />
                  ))}
                </div>
                {sumSF!==null && <DerivedRow label={`Σ Total ${cfg.label}`} value={sumSF.toFixed(1)} unit="mm" />}
                {calcPct && <DerivedRow label="% Lemak Tubuh" value={calcPct} unit="%" kat={lemakKat} />}
                {!d.usia && sfComplete && <p style={{ fontSize:11,color:"#F59E0B" }}>⚠️ Isi usia di Langkah 1 untuk menghitung % lemak.</p>}
                <p style={{ fontSize:11,color:"#475569",lineHeight:1.7 }}>
                  <strong style={{color:"#64748B"}}>Klasifikasi % Lemak:</strong><br/>
                  {d.sex==="L"?"L: &lt;6% Essential · 6–13% Atlet · 14–17% Fit · 18–24% Rata-rata · ≥25% Obesitas":"P: &lt;14% Essential · 14–20% Atlet · 21–24% Fit · 25–31% Rata-rata · ≥32% Obesitas"}
                </p>
              </Card>

              <Card title="Lingkar Tubuh / WHR (Opsional)" icon="📏" accent="#10B981">
                <p style={{ fontSize:12,color:"#475569" }}>Untuk kalkulasi Waist-to-Hip Ratio (WHR) sebagai indikator risiko sentral.</p>
                <div style={G2}>
                  <Field label="Lingkar Pinggang" name="lingkar_pinggang" value={d.lingkar_pinggang} onChange={upd} type="number" unit="cm" hint="80" step="0.5" />
                  <Field label="Lingkar Pinggul" name="lingkar_pinggul" value={d.lingkar_pinggul} onChange={upd} type="number" unit="cm" hint="95" step="0.5" />
                </div>
                {whr && <DerivedRow label="WHR" value={whr} kat={whrKat} />}
                <p style={{ fontSize:11,color:"#475569" }}>WHO — Laki-laki: Normal &lt;0.90 · Perempuan: Normal &lt;0.85</p>
              </Card>

              <div style={{ display:"flex",gap:10 }}>
                <button onClick={() => setStep(1)} style={{ flex:1,padding:"12px",borderRadius:8,border:"1.5px solid #1E3A5F",background:"transparent",color:"#94A3B8",fontWeight:700,cursor:"pointer" }}>← Kembali</button>
                <button onClick={() => setStep(3)} style={{ flex:2,padding:"12px",borderRadius:8,border:"none",background:"linear-gradient(90deg,#10B981,#0EA5E9)",color:"#fff",fontWeight:700,cursor:"pointer" }}>Lihat Hasil & Cetak →</button>
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {step===3 && (
            <div style={G}>
              <div className="print-only" style={{ textAlign:"center",marginBottom:20,borderBottom:"2px solid #0EA5E9",paddingBottom:12 }}>
                <h2 style={{ fontFamily:"serif",fontSize:18 }}>HASIL PENGUKURAN LAB KESEHATAN OLAHRAGA</h2>
                <p style={{ fontSize:12,color:"#666" }}>S1 Ilmu Keolahragaan – Universitas Ngudi Waluyo</p>
              </div>

              <Card title="Identitas" icon="👤">
                <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,fontSize:14 }}>
                  {[["Nama",d.nama],["NIM",d.nim],["Jenis Kelamin",d.sex==="L"?"Laki-laki":d.sex==="P"?"Perempuan":"—"],["Usia",d.usia?`${d.usia} tahun`:"—"],["Kelas",d.kelas],["Tanggal",d.tanggal],["Praktikan",d.praktikan]].map(([k,v])=>(
                    <div key={k}>
                      <span style={{ fontSize:11,color:"#64748B",textTransform:"uppercase",letterSpacing:".06em",fontWeight:700 }}>{k}</span>
                      <p style={{ fontWeight:600,color:"#E2E8F0",marginTop:2 }}>{v||"—"}</p>
                    </div>
                  ))}
                </div>
              </Card>

              <Card title="Hasil Pengukuran" icon="📋">
                <table style={{ width:"100%",borderCollapse:"collapse" }}>
                  <thead>
                    <tr style={{ borderBottom:"2px solid #1E3A5F" }}>
                      {["Parameter","Nilai","Klasifikasi"].map(h=>(
                        <th key={h} style={{ textAlign:"left",padding:"8px 10px",fontSize:11,color:"#64748B",textTransform:"uppercase",letterSpacing:".06em" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td colSpan={3} style={{ padding:"10px 10px 4px",fontSize:11,fontWeight:700,color:"#38BDF8",letterSpacing:".08em",textTransform:"uppercase" }}>Indeks Massa Tubuh</td></tr>
                    <PrintRow label="Berat Badan" value={d.bb} unit="kg" />
                    <PrintRow label="Tinggi Badan" value={d.tb} unit="cm" />
                    <PrintRow label="IMT" value={imt} unit="kg/m²" kat={imtKat} bold />
                    <tr><td colSpan={3} style={{ padding:"14px 10px 4px",fontSize:11,fontWeight:700,color:"#6366F1",letterSpacing:".08em",textTransform:"uppercase" }}>Tekanan Darah</td></tr>
                    <PrintRow label="TD Pengukuran 1" value={d.sis1&&d.dia1?`${d.sis1}/${d.dia1}`:null} unit="mmHg" />
                    <PrintRow label="TD Pengukuran 2" value={d.sis2&&d.dia2?`${d.sis2}/${d.dia2}`:null} unit="mmHg" />
                    <PrintRow label="TD Rata-rata" value={avgSis&&avgDia?`${avgSis}/${avgDia}`:null} unit="mmHg" kat={tdKat} bold />
                    <PrintRow label="Denyut Nadi Rata-rata" value={avgNadi} unit="bpm" />
                    <tr><td colSpan={3} style={{ padding:"14px 10px 4px",fontSize:11,fontWeight:700,color:"#10B981",letterSpacing:".08em",textTransform:"uppercase" }}>
                      Skinfold {cfg.label} ({cfg.ref})
                    </td></tr>
                    {sites.map(s => <PrintRow key={s.key} label={s.label} value={sfVals[s.key]} unit="mm" />)}
                    {sumSF && <PrintRow label={`Σ Total (${cfg.label})`} value={sumSF.toFixed(1)} unit="mm" />}
                    <PrintRow label="% Lemak Tubuh" value={calcPct} unit="%" kat={lemakKat} bold />
                    {whr && <>
                      <PrintRow label="Lingkar Pinggang" value={d.lingkar_pinggang} unit="cm" />
                      <PrintRow label="Lingkar Pinggul" value={d.lingkar_pinggul} unit="cm" />
                      <PrintRow label="WHR" value={whr} kat={whrKat} bold />
                    </>}
                  </tbody>
                </table>
              </Card>

              <Card title="Tanda Tangan" icon="✍️">
                <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:30 }}>
                  {["Mahasiswa","Praktikan / Penguji"].map(role=>(
                    <div key={role} style={{ textAlign:"center" }}>
                      <p style={{ fontSize:12,color:"#64748B",marginBottom:50 }}>{role}</p>
                      <div style={{ borderTop:"1px solid #1E3A5F",paddingTop:6,fontSize:13,color:"#94A3B8" }}>
                        {role==="Mahasiswa"?(d.nama||"( ________________________ )"):(d.praktikan||"( ________________________ )")}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <div style={{ display:"flex",gap:10 }} className="no-print">
                <button onClick={() => setStep(2)} style={{ flex:1,padding:"12px",borderRadius:8,border:"1.5px solid #1E3A5F",background:"transparent",color:"#94A3B8",fontWeight:700,cursor:"pointer" }}>← Edit Data</button>
                <button onClick={() => window.print()} style={{ flex:2,padding:"12px",borderRadius:8,border:"none",background:"linear-gradient(90deg,#10B981,#0EA5E9)",color:"#fff",fontWeight:700,fontSize:15,cursor:"pointer" }}>🖨️ Cetak / Simpan PDF</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<LabForm />);
