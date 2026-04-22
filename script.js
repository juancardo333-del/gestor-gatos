import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
    getAuth, 
    signInWithPopup, 
    signInWithRedirect, 
    getRedirectResult, 
    GoogleAuthProvider 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// CONFIGURACIÓN DE FIREBASE
const firebaseConfig = {
  apiKey: "AIzaSyDN0cR9KKYRNvw1qMKmHEtg6y3RF3Zr3Xg",
  authDomain: "appgastos-685d9.firebaseapp.com",
  projectId: "appgastos-685d9",
  storageBucket: "appgastos-685d9.firebasestorage.app",
  messagingSenderId: "55227086098",
  appId: "1:55227086098:web:5a22dcd2f4fd98aa546fcb",
  measurementId: "G-KXLZ5Y24EY"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// SELECTORES
const loginScreen = document.getElementById('login-screen');
const mainApp = document.getElementById('main-app');
const userDisplay = document.getElementById('user-display');
const emailInput = document.getElementById('user-email');
const btnGoogle = document.querySelector('.google');
const btnLoginMain = document.getElementById('btn-login-main');
const btnLogout = document.getElementById('btn-logout');
const btnEnviarReporte = document.getElementById('btn-enviar-reporte');

const form = document.getElementById('expense-form');
const list = document.getElementById('expense-list');
const totalDisplay = document.getElementById('total-amount');
const btnCalcular = document.getElementById('btn-calcular');
const btnToggle = document.getElementById('btn-toggle-historial');
const historyContainer = document.getElementById('history-container');

// VARIABLES DE ESTADO
let expenses = []; 
let currentEmail = "";

// --- LÓGICA DE USUARIO ---

function entrarApp(nombre, email) {
    if (!email) return;
    currentEmail = email.toLowerCase();
    loginScreen.style.display = 'none';
    mainApp.style.display = 'block';
    userDisplay.innerText = nombre || currentEmail;

    // Cargar gastos específicos de este correo
    const savedData = localStorage.getItem(`gastos_${currentEmail}`);
    expenses = savedData ? JSON.parse(savedData) : [];
    updateUI();
}

function updateUI() {
    list.innerHTML = '';
    expenses.forEach((item) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span>${item.desc} <small>(${item.cat})</small></span>
            <strong>$${parseFloat(item.monto).toLocaleString('es-CO')}</strong>
        `;
        list.appendChild(li);
    });
    localStorage.setItem(`gastos_${currentEmail}`, JSON.stringify(expenses));
}

// --- AUTENTICACIÓN ---

// Manejar el regreso del login en móviles (Redirect)
getRedirectResult(auth).then((result) => {
    if (result) {
        entrarApp(result.user.displayName, result.user.email);
    }
}).catch((error) => console.error("Error en redirect:", error));

// Click en el botón de Google
btnGoogle.addEventListener('click', async () => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    try {
        if (isMobile) {
            await signInWithRedirect(auth, provider);
        } else {
            const result = await signInWithPopup(auth, provider);
            entrarApp(result.user.displayName, result.user.email);
        }
    } catch (error) {
        alert("Error de autenticación. Verifica que agregaste el dominio a Firebase.");
    }
});

// Login Manual con Correo
btnLoginMain.addEventListener('click', () => {
    const email = emailInput.value.trim();
    if (email.includes('@')) {
        entrarApp(null, email);
    } else {
        alert("Ingresa un correo válido.");
    }
});

// Cerrar Sesión
btnLogout.addEventListener('click', () => {
    location.reload(); // Forma rápida de limpiar el estado
});

// --- FUNCIONALIDADES ---

form.addEventListener('submit', (e) => {
    e.preventDefault();
    const newExpense = {
        desc: document.getElementById('desc').value,
        monto: document.getElementById('monto').value,
        cat: document.getElementById('categoria').value
    };
    expenses.push(newExpense);
    updateUI();
    form.reset();
});

btnToggle.addEventListener('click', () => {
    const isHidden = historyContainer.style.display === 'none';
    historyContainer.style.display = isHidden ? 'block' : 'none';
    btnToggle.innerText = isHidden ? "Ocultar Historial" : "Mostrar Historial";
});

btnCalcular.addEventListener('click', () => {
    let total = expenses.reduce((sum, item) => sum + parseFloat(item.monto), 0);
    totalDisplay.innerText = `$${total.toLocaleString('es-CO')}`;
});

btnEnviarReporte.addEventListener('click', () => {
    if (expenses.length === 0) return alert("No hay gastos.");

    let tabla = `REPORTE PARA: ${currentEmail}\n\n`;
    tabla += "Descripción | Monto | Categoría\n";
    tabla += "-------------------------------\n";
    expenses.forEach(e => {
        tabla += `${e.desc} | $${e.monto} | ${e.cat}\n`;
    });
    
    const total = expenses.reduce((sum, e) => sum + parseFloat(e.monto), 0);
    tabla += `\nTOTAL: $${total.toLocaleString('es-CO')}`;

    window.location.href = `mailto:${currentEmail}?subject=Reporte Gastos&body=${encodeURIComponent(tabla)}`;
});
