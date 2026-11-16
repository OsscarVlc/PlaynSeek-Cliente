//Valores para desarrollo (ng serve). Apunta al back corriendo de la computadora
export const environment = {
  production: false,
  // API REST (HttpClient)
  apiUrl: 'http://localhost:3000',
  // Servidor de tiempo real (Socket.IO). Hoy es el mismo back que la API.
  socketUrl: 'http://localhost:3000',
};