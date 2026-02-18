/**
 * Proyecto: Simulación de Colisiones 2D Responsivo
 * Autora: Diana Denise Campos Lozano - 9no Semestre
 */

const canvas = document.getElementById("canvasColisiones");
const ctx = canvas.getContext("2d");
const contenedorBoton = document.getElementById("contenedorBotonNext");
const btnNext = document.getElementById("btnSiguienteNivel");

// CARGA DE AUDIOS
const sonidoPop = new Audio('music/pop.mp3');
const sonidoNext = new Audio('music/next.mp3');

canvas.width = 800;
canvas.height = 600;

let pelotas = [];
let eliminadosPorUsuario = 0;
let bolitasFinalizadasNivel = 0; 
let nivel = 1;
let pausadoParaSiguienteNivel = false;

const MAX_NIVELES = 10;
const BOLITAS_POR_NIVEL = 10;

class Pelota {
    constructor(numero, nivelActual) {
        this.numero = numero;
        this.radio = 20;
        this.x = Math.random() * (canvas.width - this.radio * 2) + this.radio;
        this.y = canvas.height + this.radio;
        this.vx = (Math.random() - 0.5) * 6; 
        this.vy = -(Math.random() * 1.5 + (nivelActual * 1.2)); 
        this.colorOriginal = (nivelActual === 10) ? "#d4af37" : "#00f2ff";
        this.color = this.colorOriginal;
        this.opacity = 1;
        this.estaDesapareciendo = false;
        this.marcadaParaEliminar = false;
    }

    dibujar() {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.shadowBlur = 15;
        ctx.shadowColor = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radio, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.strokeStyle = "white";
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.font = "bold 14px 'Courier New'";
        ctx.textAlign = "center";
        ctx.fillStyle = "white";
        ctx.shadowBlur = 0;
        ctx.fillText(this.numero, this.x, this.y + 5);
        ctx.restore();
    }

    actualizar() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x + this.radio > canvas.width || this.x - this.radio < 0) this.vx *= -1;
        if (this.estaDesapareciendo) {
            this.opacity -= 0.05;
            if (this.opacity <= 0) this.marcadaParaEliminar = true;
        }
        if (this.y + this.radio < 0) this.marcadaParaEliminar = true;
    }
}

function detectarColisiones() {
    for (let i = 0; i < pelotas.length; i++) {
        for (let j = i + 1; j < pelotas.length; j++) {
            let p1 = pelotas[i], p2 = pelotas[j];
            let dx = p2.x - p1.x, dy = p2.y - p1.y;
            let dist = Math.sqrt(dx * dx + dy * dy);
            let minDist = p1.radio + p2.radio;
            if (dist < minDist) {
                let overlap = minDist - dist;
                let nx = dx / dist, ny = dy / dist;
                p1.x -= nx * (overlap / 2); p1.y -= ny * (overlap / 2);
                p2.x += nx * (overlap / 2); p2.y += ny * (overlap / 2);
                [p1.vx, p2.vx] = [p2.vx, p1.vx]; [p1.vy, p2.vy] = [p2.vy, p1.vy];
            }
        }
    }
}

// MANEJO DE CLIC RESPONSIVO
canvas.addEventListener("click", (e) => {
    if (pausadoParaSiguienteNivel) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;

    pelotas.forEach(p => {
        const dx = clickX - p.x, dy = clickY - p.y;
        if (Math.sqrt(dx*dx + dy*dy) < p.radio && !p.estaDesapareciendo) {
            sonidoPop.currentTime = 0;
            sonidoPop.play();
            p.estaDesapareciendo = true;
            eliminadosPorUsuario++;
        }
    });
});

btnNext.onclick = () => {
    sonidoNext.currentTime = 0;
    sonidoNext.play();
    nivel++;
    contenedorBoton.style.display = "none";
    iniciarNivel(nivel);
};

function reiniciarJuego() {
    sonidoNext.currentTime = 0;
    sonidoNext.play();
    setTimeout(() => location.reload(), 200);
}

function iniciarNivel(n) {
    pausadoParaSiguienteNivel = false;
    bolitasFinalizadasNivel = 0;
    pelotas = [];
    if (n === 10) canvas.classList.add("nivel-final");
    for (let i = 1; i <= BOLITAS_POR_NIVEL; i++) {
        setTimeout(() => {
            pelotas.push(new Pelota(((n - 1) * 10) + i, n));
        }, i * 600);
    }
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    document.getElementById("val-nivel").innerText = `${nivel}/10`;
    document.getElementById("val-eliminados").innerText = `${eliminadosPorUsuario}/100`;
    document.getElementById("val-progreso").innerText = `${((eliminadosPorUsuario / 100) * 100).toFixed(0)}%`;

    if (!pausadoParaSiguienteNivel) {
        detectarColisiones();
        for (let i = pelotas.length - 1; i >= 0; i--) {
            pelotas[i].actualizar();
            pelotas[i].dibujar();
            if (pelotas[i].marcadaParaEliminar) {
                pelotas.splice(i, 1);
                bolitasFinalizadasNivel++;
                if (bolitasFinalizadasNivel === 10 && nivel < 10) {
                    pausadoParaSiguienteNivel = true;
                    contenedorBoton.style.display = "block";
                }
            }
        }
    }
    if (nivel === 10 && bolitasFinalizadasNivel === 10) {
        ctx.fillStyle = "#ff007a"; ctx.font = "bold 40px Courier"; ctx.textAlign = "center";
        ctx.fillText("SISTEMA COMPLETADO", canvas.width/2, canvas.height/2);
        return;
    }
    requestAnimationFrame(animate);
}

iniciarNivel(nivel);
animate();