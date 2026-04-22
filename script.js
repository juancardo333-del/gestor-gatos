import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

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

// --- LÓGICA DE ALMACENAMIENTO POR USUARIO ---

// 1. FUNCIÓN DE ACCESO
function entrarApp(nombre, email) {
    currentEmail = email.toLowerCase(); // Normalizamos el correo
    loginScreen.style.display = 'none';
    mainApp.style.display = 'block';
    userDisplay.innerText = nombre || currentEmail;

    // CARGAR SOLO LOS GASTOS DE ESTE CORREO
    const savedData = localStorage.getItem(`gastos_${currentEmail}`);
    expenses = savedData ? JSON.parse(savedData) : [];
    
    updateUI();
}

// 2. ACTUALIZAR INTERFAZ Y GUARDAR POR CORREO
function updateUI() {
    list.innerHTML = '';
    expenses.forEach((item) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span>${item.desc} (${item.cat})</span>
            <strong>$${parseFloat(item.monto).toLocaleString('es-CO')}</strong>
        `;
        list.appendChild(li);
    });
    
    // GUARDAMOS CON UNA LLAVE ÚNICA: gastos_correo@ejemplo.com
    localStorage.setItem(`gastos_${currentEmail}`, JSON.stringify(expenses));
}

// --- EVENTOS ---

// LOGIN GOOGLE
btnGoogle.addEventListener('click', async () => {
    try {
        const result = await signInWithPopup(auth, provider);
        entrarApp(result.user.displayName, result.user.email);
    } catch (error) {
        console.error(error);
        alert("Error de conexión. Verifica los dominios autorizados.");
    }
});

// LOGIN MANUAL
btnLoginMain.addEventListener('click', () => {
    const email = emailInput.value.trim();
    if (email.includes('@')) {
        entrarApp(null, email);
    } else {
        alert("Ingresa un correo válido.");
    }
});

// REGISTRAR GASTO
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

// MOSTRAR/OCULTAR HISTORIAL
btnToggle.addEventListener('click', () => {
    const isHidden = historyContainer.style.display === 'none';
    historyContainer.style.display = isHidden ? 'block' : 'none';
    btnToggle.innerText = isHidden ? "Ocultar Historial" : "Mostrar Historial";
});

// CALCULAR SUMA
btnCalcular.addEventListener('click', () => {
    let total = expenses.reduce((sum, item) => sum + parseFloat(item.monto), 0);
    totalDisplay.innerText = `$${total.toLocaleString('es-CO')}`;
});

// ENVIAR REPORTE
btnEnviarReporte.addEventListener('click', () => {
    if (expenses.length === 0) return alert("No hay gastos registrados.");

    let tablaTexto = `REPORTE DE GASTOS PARA: ${currentEmail}\n\n`;
    tablaTexto += "Descripción | Categoría | Monto\n";
    tablaTexto += "---------------------------------\n";
    
    expenses.forEach(e => {
        tablaTexto += `${e.desc} | ${e.cat} | $${e.monto}\n`;
    });

    const total = expenses.reduce((sum, e) => sum + parseFloat(e.monto), 0);
    tablaTexto += `\nTOTAL ACUMULADO: $${total.toLocaleString('es-CO')}`;

    const mailtoLink = `mailto:${currentEmail}?subject=Reporte de Gastos&body=${encodeURIComponent(tablaTexto)}`;
    window.location.href = mailtoLink;
});