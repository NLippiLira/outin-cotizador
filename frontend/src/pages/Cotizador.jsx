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

  // 📄 GENERAR PDF (FIX MOBILE)
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
    }, 500);
  };

  // 📲 WHATSAPP
  const enviarWhatsApp = async () => {
    await generarPDF();

    const mensaje = `Hola ${cliente || ""} 👋

Te envío la cotización de OUTIN Seguridad 🔒

Quedo atento a cualquier duda 👍`;

    const url = `https://wa.me/?text=${encodeURIComponent(mensaje)}`;
    window.open(url, "_blank");
  };

  return (
    <div className="container mt-3">

      {/* INFO MOBILE */}
      {!modoPDF && (
        <p style={{ fontSize: "12px", color: "gray" }}>
          Desliza horizontalmente para ver la cotización completa →
        </p>
      )}

      {/* BOTONES */}
      {!modoPDF && (
        <div className="mb-3 d-flex flex-wrap gap-2">
          {Object.keys(plantillas).map((k) => (
            <button key={k} className="btn btn-dark btn-sm"
              onClick={() => agregarDesdePlantilla(k)}>
              {k}
            </button>
          ))}
        </div>
      )}

      {/* DATOS */}
      {!modoPDF && (
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
      )}

      {/* CONTENEDOR SCROLL MOBILE */}
      <div style={{ overflowX: "auto" }}>

        {/* HOJA PDF REAL */}
        <div
          ref={pdfRef}
          style={{
            width: "794px",        // 🔥 FIX MOBILE
            minHeight: "1123px",   // 🔥 FIX MOBILE
            margin: "auto",
            padding: "40px",
            background: "white",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            fontSize: "12px"
          }}
        >

          {/* HEADER */}
          <div>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div className="d-flex align-items-center gap-2">
                <img src={logo} style={{ width: "70px" }} />
                <div>
                  <strong>OUTIN Seguridad</strong>
                  <div style={{ fontSize: "10px" }}>Servicios de CCTV</div>
                </div>
              </div>

              <div style={{ textAlign: "right" }}>
                <div><strong>Fecha:</strong> {fecha}</div>
                <div><strong>Cliente:</strong> {cliente}</div>
              </div>
            </div>

            <h4 className="text-center mb-3">COTIZACIÓN</h4>

            {/* TABLA */}
            <table className="table table-bordered text-center">
              <thead className="table-secondary">
                <tr>
                  <th>Detalle</th>
                  <th>Cant.</th>
                  <th>P.U.</th>
                  <th>Subtotal</th>
                  {!modoPDF && <th></th>}
                </tr>
              </thead>

              <tbody>
                {items.map((it, i) => (
                  <tr key={i}>
                    <td>
                      {modoPDF ? it.descripcion : (
                        <input className="form-control"
                          value={it.descripcion}
                          onChange={(e) => actualizarItem(i, "descripcion", e.target.value)} />
                      )}
                    </td>

                    <td>
                      {modoPDF ? it.cantidad : (
                        <input type="number" className="form-control"
                          value={it.cantidad}
                          onChange={(e) => actualizarItem(i, "cantidad", Number(e.target.value))} />
                      )}
                    </td>

                    <td>
                      {modoPDF ? clp(it.precio) : (
                        <input type="number" className="form-control"
                          value={it.precio}
                          onChange={(e) => actualizarItem(i, "precio", Number(e.target.value))} />
                      )}
                    </td>

                    <td><strong>{clp(it.cantidad * it.precio)}</strong></td>

                    {!modoPDF && (
                      <td>
                        <button className="btn btn-danger btn-sm"
                          onClick={() => eliminarItem(i)}>X</button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>

            {/* TOTALES */}
            <div className="text-end mt-3">
              <div>Subtotal: {clp(subtotal)}</div>
              <div>IVA (19%): {clp(iva)}</div>
              <h5><strong>TOTAL: {clp(total)}</strong></h5>
            </div>

            {/* NOTAS SIN PUNTOS */}
            <div className="text-center mt-4">
              <strong>Notas:</strong>
              <div>Instalación incluye configuración completa.</div>
              <div>Garantía 12 meses.</div>
              <div>Plan de mantención disponible.</div>
            </div>
          </div>

          {/* FOOTER */}
          <div style={{ textAlign: "center", marginTop: "20px", fontSize: "10px" }}>
            Nicolás Lippi Lira - 2026<br />
            contacto: +56 9 9798 0146 - nicolaslippilira@outinapp.com
          </div>

        </div>
      </div>

      {/* BOTONES */}
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