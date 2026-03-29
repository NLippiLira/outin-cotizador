import { useState, useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import logo from "../assets/logo.png";

function Cotizador() {
  const pdfRef = useRef();

  const [modoPDF, setModoPDF] = useState(false);
  const [cliente, setCliente] = useState("");
  const [fecha, setFecha] = useState("");

  const [items, setItems] = useState([
    { descripcion: "", cantidad: 1, precio: 0 }
  ]);

  const plantillas = {
    instalacion: { descripcion: "Instalación de cámara (incluye configuración APP)", precio: 30000 },
    camara360: { descripcion: "Cámara 360°", precio: 30000 },
    altura: { descripcion: "Trabajo en altura", precio: 10000 },
    traslado: { descripcion: "Traslado jornada única", precio: 25000 },
    soporte: { descripcion: "Fabricación soporte metálico", precio: 20000 },
  };

  const agregarDesdePlantilla = (tipo) => {
    const p = plantillas[tipo];
    setItems([...items, { descripcion: p.descripcion, cantidad: 1, precio: p.precio }]);
  };

  const actualizarItem = (i, campo, valor) => {
    const nuevos = [...items];
    nuevos[i][campo] = valor;
    setItems(nuevos);
  };

  const eliminarItem = (i) => {
    setItems(items.filter((_, index) => index !== i));
  };

  const subtotal = items.reduce((acc, i) => acc + i.cantidad * i.precio, 0);
  const iva = Math.round(subtotal * 0.19);
  const total = subtotal + iva;

  const clp = (v) =>
    v.toLocaleString("es-CL", { style: "currency", currency: "CLP" });

  // 📄 PDF GENERACIÓN REAL
  const generarPDF = async () => {
    setModoPDF(true);

    setTimeout(async () => {
      const canvas = await html2canvas(pdfRef.current, {
        scale: 3,
        useCORS: true
      });

      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF("p", "mm", "a4");
      pdf.addImage(imgData, "PNG", 0, 0, 210, 297);
      pdf.save("cotizacion.pdf");

      setModoPDF(false);
    }, 300);
  };

  const enviarWhatsApp = async () => {
    await generarPDF();

    const mensaje = `Hola ${cliente || ""} 👋

Te envío la cotización de OUTIN Seguridad 🔒

Quedo atento 👍`;

    const url = `https://wa.me/?text=${encodeURIComponent(mensaje)}`;
    window.open(url, "_blank");
  };

  // 🎨 ESTILOS PDF
  const th = { border: "1px solid #ccc", padding: "8px" };
  const td = { border: "1px solid #ccc", padding: "8px" };
  const tdCenter = { ...td, textAlign: "center" };
  const tdRight = { ...td, textAlign: "right" };

  return (
    <div className="container mt-3">

      {!modoPDF && (
        <>
          {/* BOTONES */}
          <div className="mb-3 d-flex flex-wrap gap-2">
            {Object.keys(plantillas).map((k) => (
              <button key={k} className="btn btn-dark btn-sm"
                onClick={() => agregarDesdePlantilla(k)}>
                {k}
              </button>
            ))}
          </div>

          {/* DATOS */}
          <div className="row mb-3">
            <div className="col-12 col-md-6 mb-2">
              <input className="form-control" placeholder="Cliente"
                onChange={(e) => setCliente(e.target.value)} />
            </div>
            <div className="col-12 col-md-6">
              <input type="date" className="form-control"
                onChange={(e) => setFecha(e.target.value)} />
            </div>
          </div>
        </>
      )}

      {/* 🧾 PDF REAL */}
      <div
        ref={pdfRef}
        style={{
          width: "794px",
          height: "1123px",
          margin: "auto",
          background: "white",
          padding: "40px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          fontFamily: "Arial"
        }}
      >

        {/* HEADER */}
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <img src={logo} style={{ width: "80px" }} />
            <div>
              <div style={{ fontWeight: "bold" }}>OUTIN Seguridad</div>
              <div style={{ fontSize: "12px" }}>Servicios de CCTV</div>
            </div>
          </div>

          <div style={{ textAlign: "right", fontSize: "12px" }}>
            <div><strong>Fecha:</strong> {fecha}</div>
            <div><strong>Cliente:</strong> {cliente}</div>
          </div>
        </div>

        <h2 style={{ textAlign: "center", margin: "20px 0" }}>
          COTIZACIÓN
        </h2>

        {/* TABLA */}
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
          <thead>
            <tr style={{ background: "#eee" }}>
              <th style={th}>Detalle</th>
              <th style={th}>Cant.</th>
              <th style={th}>P.U.</th>
              <th style={th}>Subtotal</th>
            </tr>
          </thead>

          <tbody>
            {items.map((it, i) => (
              <tr key={i}>
                <td style={td}>{it.descripcion}</td>
                <td style={tdCenter}>{it.cantidad}</td>
                <td style={tdRight}>{clp(it.precio)}</td>
                <td style={tdRight}>
                  <strong>{clp(it.cantidad * it.precio)}</strong>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* TOTALES */}
        <div style={{ textAlign: "right", marginTop: "20px" }}>
          <div>Subtotal: {clp(subtotal)}</div>
          <div>IVA (19%): {clp(iva)}</div>
          <div style={{ fontWeight: "bold", fontSize: "16px" }}>
            TOTAL: {clp(total)}
          </div>
        </div>

        {/* NOTAS */}
        <div style={{ textAlign: "center", marginTop: "20px", fontSize: "12px" }}>
          <div><strong>Notas:</strong></div>
          <div>Instalación incluye configuración completa.</div>
          <div>Garantía 12 meses.</div>
          <div>Plan de mantención disponible.</div>
        </div>

        {/* FOOTER */}
        <div style={{ textAlign: "center", fontSize: "10px" }}>
          Nicolás Lippi Lira - 2026<br />
          contacto: +56 9 9798 0146 - nicolaslippilira@outinapp.com
        </div>

      </div>

      {!modoPDF && (
        <div className="text-center mt-3">
          <button className="btn btn-success me-2" onClick={generarPDF}>
            Descargar PDF
          </button>

          <button className="btn btn-success" onClick={enviarWhatsApp}>
            Enviar por WhatsApp
          </button>
        </div>
      )}

    </div>
  );
}

export default Cotizador;