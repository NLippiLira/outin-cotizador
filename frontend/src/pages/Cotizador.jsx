import { useState } from "react";
import jsPDF from "jspdf";

function Cotizador() {

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

  // 🔥 PDF PROFESIONAL (SIN HTML)
  const generarPDF = () => {
    const pdf = new jsPDF();

    let y = 20;

    // HEADER
    pdf.setFontSize(16);
    pdf.text("OUTIN Seguridad", 10, y);
    y += 6;

    pdf.setFontSize(10);
    pdf.text("Servicios de CCTV", 10, y);

    // DATOS
    pdf.text(`Cliente: ${cliente}`, 140, 20);
    pdf.text(`Fecha: ${fecha}`, 140, 26);

    // TITULO
    y += 10;
    pdf.setFontSize(14);
    pdf.text("COTIZACIÓN", 90, y);

    y += 10;

    // ENCABEZADO TABLA
    pdf.setFontSize(10);
    pdf.text("Detalle", 10, y);
    pdf.text("Cant.", 120, y);
    pdf.text("P.U.", 140, y);
    pdf.text("Subtotal", 170, y, { align: "right" });

    y += 5;

    // LINEA
    pdf.line(10, y, 200, y);
    y += 5;

    // ITEMS
    items.forEach((item) => {
      pdf.text(item.descripcion, 10, y);
      pdf.text(String(item.cantidad), 120, y);
      pdf.text(clp(item.precio), 140, y);
      pdf.text(clp(item.cantidad * item.precio), 170, y, { align: "right" });

      y += 6;
    });

    // TOTALES
    y += 10;
    pdf.text(`Subtotal: ${clp(subtotal)}`, 140, y);
    y += 6;
    pdf.text(`IVA (19%): ${clp(iva)}`, 140, y);
    y += 6;

    pdf.setFontSize(12);
    pdf.text(`TOTAL: ${clp(total)}`, 140, y);

    // NOTAS
    y += 15;
    pdf.setFontSize(10);
    pdf.text("Notas:", 10, y);
    y += 6;
    pdf.text("Instalación incluye configuración completa.", 10, y);
    y += 5;
    pdf.text("Garantía 12 meses.", 10, y);
    y += 5;
    pdf.text("Plan de mantención disponible.", 10, y);

    // FOOTER
    pdf.setFontSize(8);
    pdf.text("Nicolás Lippi Lira - 2026", 105, 285, { align: "center" });
    pdf.text("contacto: +56 9 9798 0146 - nicolaslippilira@outinapp.com", 105, 290, { align: "center" });

    pdf.save("cotizacion.pdf");
  };

  const enviarWhatsApp = () => {
    generarPDF();

    const mensaje = `Hola ${cliente || ""} 👋

Te envío la cotización de OUTIN Seguridad 🔒

Quedo atento 👍`;

    const url = `https://wa.me/?text=${encodeURIComponent(mensaje)}`;
    window.open(url, "_blank");
  };

  return (
    <div className="container mt-3">

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

      {/* TABLA */}
      <table className="table table-bordered text-center">
        <thead className="table-secondary">
          <tr>
            <th>Detalle</th>
            <th>Cant.</th>
            <th>P.U.</th>
            <th>Subtotal</th>
            <th></th>
          </tr>
        </thead>

        <tbody>
          {items.map((it, i) => (
            <tr key={i}>
              <td>
                <input className="form-control"
                  value={it.descripcion}
                  onChange={(e) => actualizarItem(i, "descripcion", e.target.value)} />
              </td>
              <td>
                <input type="number" className="form-control"
                  value={it.cantidad}
                  onChange={(e) => actualizarItem(i, "cantidad", Number(e.target.value))} />
              </td>
              <td>
                <input type="number" className="form-control"
                  value={it.precio}
                  onChange={(e) => actualizarItem(i, "precio", Number(e.target.value))} />
              </td>
              <td><strong>{clp(it.cantidad * it.precio)}</strong></td>
              <td>
                <button className="btn btn-danger btn-sm"
                  onClick={() => eliminarItem(i)}>X</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* TOTALES */}
      <div className="text-end">
        <div>Subtotal: {clp(subtotal)}</div>
        <div>IVA (19%): {clp(iva)}</div>
        <h5><strong>TOTAL: {clp(total)}</strong></h5>
      </div>

      {/* BOTONES */}
      <div className="text-center mt-3">
        <button className="btn btn-success me-2" onClick={generarPDF}>
          Descargar PDF
        </button>

        <button className="btn btn-success" onClick={enviarWhatsApp}>
          Enviar por WhatsApp
        </button>
      </div>

    </div>
  );
}

export default Cotizador;