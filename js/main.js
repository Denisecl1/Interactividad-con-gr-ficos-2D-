/**
 * Proyecto: Simulación de Colisiones 2D - ARCADE MODE
 * Autora: Diana Denise Campos Lozano
 */

const canvas = document.getElementById("canvasColisiones");
const ctx = canvas.getContext("2d");
const contenedorBoton = document.getElementById("contenedorBotonNext");
const btnNext = document.getElementById("btnSiguienteNivel");

// --- CARGA DE AUDIOS ---
const sonidoPop = new Audio('music/pop.mp3');
const sonidoNext = new Audio('music/next.mp3'); // Asegúrate de tener este archivo

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
        this.vx = (Math.random() - 0.5) * 6; 
        this.vy = -(Math.random() * 1.5 + (nivelActual * 1.2)); 
        
        // Colores Neón: Cian para niveles normales, Dorado para el nivel 10
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
        ctx.closePath();

        ctx.fillStyle = "white";
        ctx.shadowBlur = 0; 
        ctx.font = "bold 14px 'Courier New'";
        ctx.textAlign = "center";
        ctx.fillText(this.numero, this.x, this.y + 5);
        
        ctx.restore();
    }

    actualizar() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x + this.radio > canvas.width || this.x - this.radio < 0) {
            this.vx *= -1;
        }

        const dx = mouseX - this.x;
        const dy = mouseY - this.y;
        if (Math.sqrt(dx*dx + dy*dy) < this.radio) {
            this.color = "#ff007a"; 
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
                let superposicion = distanciaMinima - distancia;
                let nx = dx / distancia;
                let ny = dy / distancia;
                
                p1.x -= nx * (superposicion / 2);
                p1.y -= ny * (superposicion / 2);
                p2.x += nx * (superposicion / 2);
                p2.y += ny * (superposicion / 2);

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

// Evento para reventar burbujas (Sonido Pop)
canvas.addEventListener("click", () => {
    if (pausadoParaSiguienteNivel) return;
    pelotas.forEach(p => {
        const dx = mouseX - p.x;
        const dy = mouseY - p.y;
        if (Math.sqrt(dx*dx + dy*dy) < p.radio && !p.estaDesapareciendo) {
            
            // Sonido al reventar
            sonidoPop.currentTime = 0;
            sonidoPop.play();

            p.estaDesapareciendo = true;
            eliminadosPorUsuario++;
        }
    });
});

// Evento para botón de siguiente nivel (Sonido Next)
btnNext.onclick = function() {
    // Sonido al avanzar de fase
    sonidoNext.currentTime = 0;
    sonidoNext.play();

    nivel++;
    contenedorBoton.style.display = "none";
    iniciarNivel(nivel);
};

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    document.getElementById("val-nivel").innerText = `${nivel} / 10`;
    document.getElementById("val-eliminados").innerText = `${eliminadosPorUsuario} / 100`;
    document.getElementById("val-progreso").innerText = `${((eliminadosPorUsuario / 100) * 100).toFixed(0)} %`;

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
        ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    if (nivel === 10 && bolitasFinalizadasNivel === 10) {
        ctx.save();
        ctx.fillStyle = "#ff007a";
        ctx.font = "bold 40px 'Courier New'";
        ctx.textAlign = "center";
        ctx.shadowBlur = 20;
        ctx.shadowColor = "#ff007a";
        ctx.fillText("¡SISTEMA COMPLETADO!", canvas.width/2, canvas.height/2);
        ctx.restore();
        return;
    }
    requestAnimationFrame(animate);
}

iniciarNivel(nivel);
animate();