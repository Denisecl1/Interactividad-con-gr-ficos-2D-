const canvas = document.getElementById("canvasColisiones");
const ctx = canvas.getContext("2d");
const contenedorBoton = document.getElementById("contenedorBotonNext");
const btnNext = document.getElementById("btnSiguienteNivel");

canvas.width = 800;
canvas.height = 600;

let pelotas = [];
let eliminadosPorUsuario = 0;
let bolitasFinalizadasNivel = 0; 
let nivel = 1;
let pausadoParaSiguienteNivel = false;

const MAX_NIVELES = 10;
const BOLITAS_POR_NIVEL = 10;
let mouseX = 0, mouseY = 0;

class Pelota {
    constructor(numero, nivelActual) {
        this.numero = numero;
        this.radio = 20;
        this.x = Math.random() * (canvas.width - this.radio * 2) + this.radio;
        this.y = canvas.height + this.radio;
        this.vx = (Math.random() - 0.5) * 4; 
        this.vy = -(Math.random() * 1.5 + (nivelActual * 1.2)); 
        this.colorOriginal = (nivelActual === 10) ? "#d4af37" : "#3498db";
        this.color = this.colorOriginal;
        this.opacity = 1;
        this.estaDesapareciendo = false;
        this.marcadaParaEliminar = false;
    }

    dibujar() {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radio, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.strokeStyle = "white";
        ctx.stroke();
        ctx.closePath();
        ctx.fillStyle = "white";
        ctx.font = "bold 14px Arial";
        ctx.textAlign = "center";
        ctx.fillText(this.numero, this.x, this.y + 5);
        ctx.restore();
    }

    actualizar() {
        this.x += this.vx;
        this.y += this.vy;
        const dx = mouseX - this.x;
        const dy = mouseY - this.y;
        if (Math.sqrt(dx*dx + dy*dy) < this.radio) {
            this.color = "#f1c40f"; 
        } else {
            this.color = this.colorOriginal;
        }
        if (this.estaDesapareciendo) {
            this.opacity -= 0.05;
            if (this.opacity <= 0) this.marcadaParaEliminar = true;
        }
        if (this.y + this.radio < 0) this.marcadaParaEliminar = true;
    }
}

// LÓGICA DE COLISIÓN MEJORADA
function detectarColisiones() {
    for (let i = 0; i < pelotas.length; i++) {
        for (let j = i + 1; j < pelotas.length; j++) {
            let p1 = pelotas[i];
            let p2 = pelotas[j];
            let dx = p2.x - p1.x;
            let dy = p2.y - p1.y;
            let distancia = Math.sqrt(dx * dx + dy * dy);
            let distanciaMinima = p1.radio + p2.radio;

            if (distancia < distanciaMinima) {
                // 1. SEPARACIÓN FÍSICA (Para que no se peguen)
                let superposicion = distanciaMinima - distancia;
                let nx = dx / distancia; // Vector normal X
                let ny = dy / distancia; // Vector normal Y
                
                // Las movemos la mitad de la superposición a cada una
                p1.x -= nx * (superposicion / 2);
                p1.y -= ny * (superposicion / 2);
                p2.x += nx * (superposicion / 2);
                p2.y += ny * (superposicion / 2);

                // 2. REBOTE (Intercambio de velocidad)
                [p1.vx, p2.vx] = [p2.vx, p1.vx];
                [p1.vy, p2.vy] = [p2.vy, p1.vy];
            }
        }
    }
}

function iniciarNivel(n) {
    if (n > MAX_NIVELES) return;
    pausadoParaSiguienteNivel = false;
    bolitasFinalizadasNivel = 0;
    pelotas = [];
    if (n === 10) canvas.classList.add("nivel-final");
    for (let i = 1; i <= BOLITAS_POR_NIVEL; i++) {
        setTimeout(() => {
            let numReal = ((n - 1) * BOLITAS_POR_NIVEL) + i;
            pelotas.push(new Pelota(numReal, n));
        }, i * 600); 
    }
}

canvas.addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
});

canvas.addEventListener("click", () => {
    if (pausadoParaSiguienteNivel) return;
    pelotas.forEach(p => {
        const dx = mouseX - p.x;
        const dy = mouseY - p.y;
        if (Math.sqrt(dx*dx + dy*dy) < p.radio && !p.estaDesapareciendo) {
            p.estaDesapareciendo = true;
            eliminadosPorUsuario++;
        }
    });
});

btnNext.onclick = function() {
    nivel++;
    contenedorBoton.style.display = "none";
    iniciarNivel(nivel);
};

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!pausadoParaSiguienteNivel) {
        detectarColisiones();
        for (let i = pelotas.length - 1; i >= 0; i--) {
            let p = pelotas[i];
            p.actualizar();
            p.dibujar();
            if (p.marcadaParaEliminar) {
                pelotas.splice(i, 1);
                bolitasFinalizadasNivel++;
                if (bolitasFinalizadasNivel === BOLITAS_POR_NIVEL) {
                    if (nivel < MAX_NIVELES) {
                        pausadoParaSiguienteNivel = true;
                        contenedorBoton.style.display = "block";
                    }
                }
            }
        }
    } else {
        ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    ctx.fillStyle = (nivel === 10) ? "#d4af37" : "black";
    ctx.font = "bold 18px Consolas";
    ctx.fillText(`NIVEL: ${nivel}/10`, 15, 30);
    ctx.fillText(`ELIMINADAS: ${eliminadosPorUsuario}`, 15, 55);
    ctx.fillText(`PROGRESO: ${((eliminadosPorUsuario / 100) * 100).toFixed(0)}%`, 15, 80);

    if (nivel === 10 && bolitasFinalizadasNivel === 10) {
        ctx.fillStyle = "#d4af37";
        ctx.font = "bold 45px Arial";
        ctx.textAlign = "center";
        ctx.fillText("¡JUEGO TERMINADO!", canvas.width/2, canvas.height/2);
        return;
    }
    requestAnimationFrame(animate);
}

iniciarNivel(nivel);
animate();