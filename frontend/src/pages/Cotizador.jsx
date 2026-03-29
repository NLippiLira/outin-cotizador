import { useState, useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import logo from "../assets/logo.png";

function Cotizador() {
  const pdfRef = useRef();

  // Modo PDF
  const [modoPDF, setModoPDF] = useState(false);

  // Datos cliente
  const [cliente, setCliente] = useState("");
  const [fecha, setFecha] = useState("");

  // Items
  const [items, setItems] = useState([
    { descripcion: "", cantidad: 1, precio: 0 }
  ]);

  // Plantillas rápidas
  const plantillas = {
    instalacion: {
      descripcion: "Instalación de cámara (incluye configuración APP)",
      precio: 30000,
    },
    camara360: {
      descripcion: "Cámara 360°",
      precio: 30000,
    },
    altura: {
      descripcion: "Trabajo en altura",
      precio: 10000,
    },
    traslado: {
      descripcion: "Traslado jornada única",
      precio: 25000,
    },
    soporte: {
      descripcion: "Fabricación soporte metálico",
      precio: 20000,
    },
  };

  const agregarItem = () => {
    setItems([...items, { descripcion: "", cantidad: 1, precio: 0 }]);
  };

  const agregarDesdePlantilla = (tipo) => {
    const plantilla = plantillas[tipo];

    setItems([
      ...items,
      {
        descripcion: plantilla.descripcion,
        cantidad: 1,
        precio: plantilla.precio,
      },
    ]);
  };

  const actualizarItem = (index, campo, valor) => {
    const nuevosItems = [...items];
    nuevosItems[index][campo] = valor;
    setItems(nuevosItems);
  };

  const eliminarItem = (index) => {
    const nuevos = items.filter((_, i) => i !== index);
    setItems(nuevos);
  };

  // Cálculos
  const subtotal = items.reduce(
    (acc, item) => acc + item.cantidad * item.precio,
    0
  );

  const iva = Math.round(subtotal * 0.19);
  const total = Math.round(subtotal + iva);

  const formatearCLP = (valor) => {
    return valor.toLocaleString("es-CL", {
      style: "currency",
      currency: "CLP",
    });
  };

  // Generar PDF
  const generarPDF = async () => {
    setModoPDF(true);

    setTimeout(async () => {
      const canvas = await html2canvas(pdfRef.current);
      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF("p", "mm", "a4");
      pdf.addImage(imgData, "PNG", 5, 5, 200, 0);
      pdf.save("cotizacion.pdf");

      setModoPDF(false);
    }, 500);
  };

  return (
    <div className="container mt-4">

      {!modoPDF && (
        <div className="text-center mb-4">
          <h1 className="fw-bold">OUTIN Seguridad</h1>
          <h5 className="text-muted">Generador de Cotizaciones</h5>
        </div>
      )}

      {!modoPDF && (
        <div className="mb-3">
          <h5>Agregar rápido</h5>
          <div className="d-flex flex-wrap gap-2">
            <button className="btn btn-primary" onClick={() => agregarDesdePlantilla("instalacion")}>Instalación</button>
            <button className="btn btn-success" onClick={() => agregarDesdePlantilla("camara360")}>Cámara</button>
            <button className="btn btn-warning" onClick={() => agregarDesdePlantilla("altura")}>Altura</button>
            <button className="btn btn-secondary" onClick={() => agregarDesdePlantilla("soporte")}>Soporte</button>
            <button className="btn btn-dark" onClick={() => agregarDesdePlantilla("traslado")}>Traslado</button>
          </div>
        </div>
      )}

      {!modoPDF && (
        <div className="row mb-3">
          <div className="col-md-6">
            <input className="form-control" placeholder="Nombre cliente" onChange={(e) => setCliente(e.target.value)} />
          </div>
          <div className="col-md-6">
            <input type="date" className="form-control" onChange={(e) => setFecha(e.target.value)} />
          </div>
        </div>
      )}

      {/* PDF */}
      <div ref={pdfRef} className="p-5 border rounded bg-white shadow">

        {/* HEADER */}
        <div className="d-flex justify-content-between align-items-center mb-4">

          <div className="d-flex align-items-center gap-3">
            <img src={logo} alt="logo" style={{ width: "100px" }} />
            <div>
              <h4 className="mb-0">OUTIN Seguridad</h4>
              <small>Servicios de CCTV</small>
            </div>
          </div>

          <div className="text-end">
            <p className="mb-0"><strong>Fecha:</strong> {fecha}</p>
            <p className="mb-0"><strong>Cliente:</strong> {cliente}</p>
          </div>

        </div>

        <h3 className="text-center mb-4 fw-bold">COTIZACIÓN</h3>

        {/* TABLA */}
        <table className="table table-bordered">
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
            {items.map((item, index) => (
              <tr key={index}>
                <td>
                  {modoPDF ? item.descripcion : (
                    <input className="form-control"
                      value={item.descripcion}
                      onChange={(e) => actualizarItem(index, "descripcion", e.target.value)}
                    />
                  )}
                </td>

                <td>
                  {modoPDF ? item.cantidad : (
                    <input className="form-control" type="number"
                      value={item.cantidad}
                      onChange={(e) => actualizarItem(index, "cantidad", Number(e.target.value))}
                    />
                  )}
                </td>

                <td>
                  {modoPDF ? formatearCLP(item.precio) : (
                    <input className="form-control" type="number"
                      value={item.precio}
                      onChange={(e) => actualizarItem(index, "precio", Number(e.target.value))}
                    />
                  )}
                </td>

                <td className="fw-bold">
                  {formatearCLP(item.cantidad * item.precio)}
                </td>

                {!modoPDF && (
                  <td>
                    <button className="btn btn-danger btn-sm" onClick={() => eliminarItem(index)}>X</button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>

        {!modoPDF && (
          <button className="btn btn-outline-primary mb-3" onClick={agregarItem}>
            + Agregar ítem manual
          </button>
        )}

        {/* TOTALES */}
        <div className="text-end">
          <h5>Subtotal: {formatearCLP(subtotal)}</h5>
          <h5>IVA (19%): {formatearCLP(iva)}</h5>
          <h4 className="fw-bold">TOTAL: {formatearCLP(total)}</h4>
        </div>

        <hr />

        {/* NOTAS */}
        <p><strong>Notas:</strong></p>
        <ul>
          <li>Instalación incluye configuración completa.</li>
          <li>Garantía 12 meses.</li>
          <li>Plan de mantención disponible.</li>
        </ul>

        {/* FOOTER */}
        <hr />

        <div className="text-center mt-4" style={{ fontSize: "12px" }}>
          <p className="mb-1">Nicolás Lippi Lira - 2026</p>
          <p className="mb-0">contacto: +56 9 9798 0146 - nicolaslippilira@outinapp.com</p>
        </div>

      </div>

      {!modoPDF && (
        <div className="text-center mt-4">
          <button className="btn btn-success btn-lg" onClick={generarPDF}>
            Generar PDF
          </button>
        </div>
      )}

    </div>
  );
}

export default Cotizador;