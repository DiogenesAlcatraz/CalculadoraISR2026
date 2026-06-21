// Reloj Digital y Fecha del Sistema
function updateClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    document.getElementById('clock').textContent = `${hours}:${minutes}:${seconds}`;
    
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('date').textContent = now.toLocaleDateString('es-MX', options);
}
setInterval(updateClock, 1000);
updateClock();

// TARIFA MENSUAL ISR OFICIAL 2026 (Ajustada por inflación)
const tarifaISR2026 = [
    { limInf: 0.01, limSup: 844.59, cuota: 0.00, pct: 1.92 },
    { limInf: 844.60, limSup: 7168.51, cuota: 16.22, pct: 6.40 },
    { limInf: 7168.52, limSup: 12598.02, cuota: 420.95, pct: 10.88 },
    { limInf: 12598.03, limSup: 14644.64, cuota: 1011.68, pct: 16.00 },
    { limInf: 14644.65, limSup: 17533.64, cuota: 1339.14, pct: 17.92 },
    { limInf: 17533.65, limSup: 35362.83, cuota: 1856.84, pct: 21.36 },
    { limInf: 35362.84, limSup: 55736.68, cuota: 5665.16, pct: 23.52 },
    { limInf: 55736.69, limSup: 106410.50, cuota: 10457.09, pct: 30.00 },
    { limInf: 106410.51, limSup: 141880.66, cuota: 25659.23, pct: 32.00 },
    { limInf: 141880.67, limSup: 425641.99, cuota: 37009.69, pct: 34.00 },
    { limInf: 425642.00, limSup: Infinity, cuota: 133488.54, pct: 35.00 }
];

// LÓGICA DEL SUBSIDIO PARA EL EMPLEO 2026
// Beneficio fijo de $535.65 mensuales para quienes ganan hasta $11,492.66
function calcularSubsidio2026(ingreso) {
    if (ingreso > 0 && ingreso <= 11492.66) {
        return 535.65;
    }
    return 0.00;
}

// Renderizar tabla de referencia al iniciar
const tbodyTarifa = document.querySelector('#tabla-tarifa tbody');
tarifaISR2026.forEach((r, index) => {
    const tr = document.createElement('tr');
    tr.id = `fila-tarifa-${index}`;
    tr.innerHTML = `
        <td>$${r.limInf.toLocaleString('es-MX', {minimumFractionDigits: 2})}</td>
        <td>${r.limSup === Infinity ? 'En adelante' : '$' + r.limSup.toLocaleString('es-MX', {minimumFractionDigits: 2})}</td>
        <td>$${r.cuota.toLocaleString('es-MX', {minimumFractionDigits: 2})}</td>
        <td>${r.pct}%</td>
    `;
    tbodyTarifa.appendChild(tr);
});

// Función de cálculo
function calcularISR() {
    const ingreso = parseFloat(document.getElementById('ingreso').value);

    if (isNaN(ingreso) || ingreso <= 0) {
        alert("Por favor, ingrese un monto válido mayor a 0.");
        return;
    }

    // Limpiar estilos previos
    tarifaISR2026.forEach((_, index) => {
        document.getElementById(`fila-tarifa-${index}`).classList.remove('highlight');
    });

    // Encontrar renglón de la tarifa 2026
    let renglon = tarifaISR2026.find(r => ingreso >= r.limInf && ingreso <= r.limSup);
    let renglonIndex = tarifaISR2026.indexOf(renglon);
    
    if(renglonIndex !== -1) {
        document.getElementById(`fila-tarifa-${renglonIndex}`).classList.add('highlight');
    }

    // Operaciones matemáticas de impuestos
    const limInferior = renglon.limInf;
    const excedente = ingreso - limInferior;
    const porcentaje = renglon.pct / 100;
    const impuestoMarginal = excedente * porcentaje;
    const cuotaFija = renglon.cuota;
    const isrDeterminado = impuestoMarginal + cuotaFija;
    const subsidio = calcularSubsidio2026(ingreso);
    
    let resultadoFinal = isrDeterminado - subsidio;
    let tipoResultado = "";
    let neto = 0;

    if (resultadoFinal > 0) {
        tipoResultado = "ISR a Retener";
        neto = ingreso - resultadoFinal;
    } else {
        tipoResultado = "Subsidio a Entregar";
        resultadoFinal = Math.abs(resultadoFinal);
        neto = ingreso + resultadoFinal;
    }

    const f = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });

    // Rellenar desglose a la derecha
    document.getElementById('proc-ingreso').textContent = f.format(ingreso);
    document.getElementById('proc-lim-inf').textContent = f.format(limInferior);
    document.getElementById('proc-excedente').textContent = f.format(excedente);
    document.getElementById('proc-porcentaje').textContent = `${renglon.pct}%`;
    document.getElementById('proc-imp-marg').textContent = f.format(impuestoMarginal);
    document.getElementById('proc-cuota').textContent = f.format(cuotaFija);
    document.getElementById('proc-isr-det').textContent = f.format(isrDeterminado);
    document.getElementById('proc-sub-entregar').textContent = f.format(subsidio);
    document.getElementById('proc-resultado').textContent = `${tipoResultado}: ${f.format(resultadoFinal)}`;

    // Rellenar resumen a la izquierda
    document.getElementById('res-ingreso').textContent = f.format(ingreso);
    document.getElementById('res-isr-det').textContent = f.format(isrDeterminado);
    document.getElementById('res-subsidio').textContent = f.format(subsidio);
    
    document.getElementById('label-resultado').textContent = tipoResultado === "ISR a Retener" ? "Neto a Recibir:" : "Total a Recibir (con Subsidio):";
    document.getElementById('res-final').textContent = f.format(neto);
}