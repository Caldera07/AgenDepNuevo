import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, User, Phone, Mail, CheckCircle, AlertCircle, Settings, Users, Shield, LogOut, Edit, Trash2, Plus, Eye, EyeOff, UserPlus, Search, Filter } from 'lucide-react';

const SportsBookingApp = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [showLogin, setShowLogin] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);
  const [activeTab, setActiveTab] = useState('booking');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedCourt, setSelectedCourt] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [allBookings, setAllBookings] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editingBooking, setEditingBooking] = useState(null);
  const [managingSchedule, setManagingSchedule] = useState(false);
  const [customSlots, setCustomSlots] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: ''
  });

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    notes: ''
  });

  const courtTypes = [
    { id: 'football', name: 'Fútbol', price: 50000, duration: 90 },
    { id: 'basketball', name: 'Baloncesto', price: 35000, duration: 60 },
    { id: 'tennis', name: 'Tenis', price: 40000, duration: 60 },
    { id: 'volleyball', name: 'Voleibol', price: 30000, duration: 60 }
  ];

  const defaultTimeSlots = [
    '06:00', '07:30', '09:00', '10:30', '12:00',
    '13:30', '15:00', '16:30', '18:00', '19:30', '21:00'
  ];

   // Datos de ejemplo
  const sampleUsers = [
    { id: 1, name: 'Admin', email: 'admin@canchas.com', role: 'admin', phone: '123456789', status: 'active' },
    { id: 2, name: 'Juan Pérez', email: 'juan@email.com', role: 'user', phone: '987654321', status: 'active' },
    { id: 3, name: 'María García', email: 'maria@email.com', role: 'user', phone: '555666777', status: 'blocked' }
  ];

  const sampleBookings = [
    { id: 1, date: '2024-12-15', time: '15:00', courtType: 'football', name: 'Juan Pérez', email: 'juan@email.com', phone: '987654321', notes: 'Partido amistoso', status: 'confirmed', userId: 2 },
    { id: 2, date: '2024-12-16', time: '10:30', courtType: 'basketball', name: 'María García', email: 'maria@email.com', phone: '555666777', notes: 'Entrenamiento', status: 'confirmed', userId: 3 }
  ];

  useEffect(() => {
    setUsers(sampleUsers);
    setAllBookings(sampleBookings);
  }, []);

  useEffect(() => {
    if (currentUser) {
      const userBookings = allBookings.filter(booking => booking.userId === currentUser.id);
      setBookings(userBookings);
    }
  }, [currentUser, allBookings]);

  useEffect(() => {
    if (selectedDate && selectedCourt) {
      fetchAvailableSlots();
    }
  }, [selectedDate, selectedCourt]);

  const handleLogin = async () => {
    setLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const user = users.find(u => u.email === loginData.email && u.status === 'active');
      
      if (user) {
        if (loginData.password === 'admin123' && user.role === 'admin') {
          setCurrentUser(user);
          setShowLogin(false);
          setActiveTab('admin-bookings');
        } else if (loginData.password === '123456' && user.role === 'user') {
          setCurrentUser(user);
          setShowLogin(false);
          setActiveTab('booking');
        } else {
          showNotification('Credenciales incorrectas', 'error');
        }
      } else {
        showNotification('Usuario no encontrado o bloqueado', 'error');
      }
    } catch (error) {
      showNotification('Error al iniciar sesión', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (registerData.password !== registerData.confirmPassword) {
      showNotification('Las contraseñas no coinciden', 'error');
      return;
    }

    setLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newUser = {
        id: users.length + 1,
        name: registerData.name,
        email: registerData.email,
        role: 'user',
        phone: registerData.phone,
        status: 'active'
      };
      
      setUsers([...users, newUser]);
      setCurrentUser(newUser);
      setShowLogin(false);
      setActiveTab('booking');
      showNotification('¡Registro exitoso!', 'success');
    } catch (error) {
      showNotification('Error al registrarse', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setShowLogin(true);
    setActiveTab('booking');
    setLoginData({ email: '', password: '' });
    setRegisterData({ name: '', email: '', password: '', confirmPassword: '', phone: '' });
  };

  const fetchAvailableSlots = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const unavailableSlots = allBookings
        .filter(booking => 
          booking.date === selectedDate && 
          booking.courtType === selectedCourt &&
          booking.status === 'confirmed'
        )
        .map(booking => booking.time);
      
      const timeSlots = customSlots.length > 0 ? customSlots : defaultTimeSlots;
      const available = timeSlots.filter(slot => !unavailableSlots.includes(slot));
      setAvailableSlots(available);
    } catch (error) {
      showNotification('Error al cargar horarios disponibles', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedDate || !selectedTime || !selectedCourt) {
      showNotification('Por favor selecciona fecha, hora y tipo de cancha', 'error');
      return;
    }

    setLoading(true);
    
    try {
      const bookingData = {
        id: allBookings.length + 1,
        date: selectedDate,
        time: selectedTime,
        courtType: selectedCourt,
        name: currentUser.name,
        email: currentUser.email,
        phone: currentUser.phone,
        notes: formData.notes,
        status: 'confirmed',
        userId: currentUser.id
      };

      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setAllBookings([...allBookings, bookingData]);
      showNotification('¡Reserva confirmada exitosamente!', 'success');
      resetForm();
    } catch (error) {
      showNotification('Error al procesar la reserva', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const updatedBookings = allBookings.map(booking => 
        booking.id === bookingId 
          ? { ...booking, status: 'cancelled' }
          : booking
      );
      
      setAllBookings(updatedBookings);
      showNotification('Reserva cancelada exitosamente', 'success');
    } catch (error) {
      showNotification('Error al cancelar la reserva', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBooking = async (bookingId) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const updatedBookings = allBookings.filter(booking => booking.id !== bookingId);
      setAllBookings(updatedBookings);
      showNotification('Reserva eliminada exitosamente', 'success');
    } catch (error) {
      showNotification('Error al eliminar la reserva', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUserStatusChange = async (userId, newStatus) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const updatedUsers = users.map(user => 
        user.id === userId 
          ? { ...user, status: newStatus }
          : user
      );
      
      setUsers(updatedUsers);
      showNotification(`Usuario ${newStatus === 'active' ? 'activado' : 'bloqueado'} exitosamente`, 'success');
    } catch (error) {
      showNotification('Error al cambiar estado del usuario', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCustomSlot = (newSlot) => {
    if (newSlot && !customSlots.includes(newSlot)) {
      setCustomSlots([...customSlots, newSlot].sort());
      showNotification('Horario agregado exitosamente', 'success');
    }
  };

  const handleRemoveCustomSlot = (slotToRemove) => {
    setCustomSlots(customSlots.filter(slot => slot !== slotToRemove));
    showNotification('Horario eliminado exitosamente', 'success');
  };

  const resetForm = () => {
    setSelectedDate('');
    setSelectedTime('');
    setSelectedCourt('');
    setFormData({ name: '', email: '', phone: '', notes: '' });
    setShowForm(false);
  };

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 3);
    return maxDate.toISOString().split('T')[0];
  };

  const selectedCourtData = courtTypes.find(court => court.id === selectedCourt);

  const filteredBookings = allBookings.filter(booking => {
    const matchesSearch = booking.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || booking.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Login/Register Component
  if (showLogin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              {isRegistering ? 'Crear Cuenta' : 'Iniciar Sesión'}
            </h1>
            <p className="text-gray-600">
              {isRegistering ? 'Únete a nuestra plataforma' : 'Accede a tu cuenta'}
            </p>
          </div>

          {notification && (
            <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 ${
              notification.type === 'success' 
                ? 'bg-green-100 border border-green-400 text-green-700' 
                : 'bg-red-100 border border-red-400 text-red-700'
            }`}>
              {notification.type === 'success' ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <AlertCircle className="w-4 h-4" />
              )}
              <span className="text-sm">{notification.message}</span>
            </div>
          )}

          <div className="space-y-4">
            {isRegistering && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre completo
                </label>
                <input
                  type="text"
                  value={registerData.name}
                  onChange={(e) => setRegisterData({...registerData, name: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Tu nombre completo"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={isRegistering ? registerData.email : loginData.email}
                onChange={(e) => {
                  if (isRegistering) {
                    setRegisterData({...registerData, email: e.target.value});
                  } else {
                    setLoginData({...loginData, email: e.target.value});
                  }
                }}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="tu@email.com"
              />
            </div>

            {isRegistering && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono
                </label>
                <input
                  type="tel"
                  value={registerData.phone}
                  onChange={(e) => setRegisterData({...registerData, phone: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Tu número de teléfono"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña
              </label>
              <input
                type="password"
                value={isRegistering ? registerData.password : loginData.password}
                onChange={(e) => {
                  if (isRegistering) {
                    setRegisterData({...registerData, password: e.target.value});
                  } else {
                    setLoginData({...loginData, password: e.target.value});
                  }
                }}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Tu contraseña"
              />
            </div>

            {isRegistering && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmar Contraseña
                </label>
                <input
                  type="password"
                  value={registerData.confirmPassword}
                  onChange={(e) => setRegisterData({...registerData, confirmPassword: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Confirma tu contraseña"
                />
              </div>
            )}
<button
              onClick={isRegistering ? handleRegister : handleLogin}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Procesando...' : (isRegistering ? 'Crear Cuenta' : 'Iniciar Sesión')}
            </button>

            <div className="text-center">
              <button
                onClick={() => setIsRegistering(!isRegistering)}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                {isRegistering ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
              </button>
            </div>

            <div className="text-center mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">Cuentas de prueba:</p>
              <p className="text-xs text-gray-500">
                Admin: admin@canchas.com / admin123<br />
                Usuario: juan@email.com / 123456
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-blue-50 to-green-50">
      {/* Fondo deportivo */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-20 h-20 bg-blue-400 rounded-full animate-bounce" style={{animationDuration: '3s'}}></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-green-400 rounded-full animate-bounce" style={{animationDuration: '4s', animationDelay: '1s'}}></div>
        <div className="absolute bottom-32 left-1/4 w-24 h-24 bg-emerald-400 rounded-full animate-bounce" style={{animationDuration: '5s', animationDelay: '2s'}}></div>
        <div className="absolute bottom-20 right-1/3 w-18 h-18 bg-cyan-400 rounded-full animate-bounce" style={{animationDuration: '3.5s', animationDelay: '0.5s'}}></div>
      </div>
      
      <div className="relative z-10 p-4">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Reserva de Canchas Deportivas
              </h1>
              <p className="text-gray-600">
                Bienvenido, {currentUser?.name} 
                {currentUser?.role === 'admin' && <span className="text-blue-600 font-medium"> (Administrador)</span>}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-8">
            {currentUser?.role === 'admin' ? (
              <>
                <button
                  onClick={() => setActiveTab('admin-bookings')}
                  className={`py-4 px-2 border-b-2 font-medium text-sm ${
                    activeTab === 'admin-bookings' 
                      ? 'border-blue-500 text-blue-600' 
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Todas las Reservas
                </button>
                <button
                  onClick={() => setActiveTab('user-management')}
                  className={`py-4 px-2 border-b-2 font-medium text-sm ${
                    activeTab === 'user-management' 
                      ? 'border-blue-500 text-blue-600' 
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Users className="w-4 h-4 inline mr-2" />
                  Gestión de Usuarios
                </button>
                <button
                  onClick={() => setActiveTab('schedule-management')}
                  className={`py-4 px-2 border-b-2 font-medium text-sm ${
                    activeTab === 'schedule-management' 
                      ? 'border-blue-500 text-blue-600' 
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Clock className="w-4 h-4 inline mr-2" />
                  Gestión de Horarios
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setActiveTab('booking')}
                  className={`py-4 px-2 border-b-2 font-medium text-sm ${
                    activeTab === 'booking' 
                      ? 'border-blue-500 text-blue-600' 
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Nueva Reserva
                </button>
                <button
                  onClick={() => setActiveTab('my-bookings')}
                  className={`py-4 px-2 border-b-2 font-medium text-sm ${
                    activeTab === 'my-bookings' 
                      ? 'border-blue-500 text-blue-600' 
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <User className="w-4 h-4 inline mr-2" />
                  Mis Reservas
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Notification */}
        {notification && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
            notification.type === 'success' 
              ? 'bg-green-100 border border-green-400 text-green-700' 
              : 'bg-red-100 border border-red-400 text-red-700'
          }`}>
            {notification.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span>{notification.message}</span>
          </div>
        )}

        {/* Admin - All Bookings */}
        {activeTab === 'admin-bookings' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">Todas las Reservas</h2>
              <div className="flex gap-4">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar por nombre o email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">Todos los estados</option>
                  <option value="confirmed">Confirmadas</option>
                  <option value="cancelled">Canceladas</option>
                </select>
              </div>
            </div>
<div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Usuario
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fecha y Hora
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cancha
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredBookings.map((booking) => (
                      <tr key={booking.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{booking.name}</div>
                            <div className="text-sm text-gray-500">{booking.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {new Date(booking.date + 'T00:00:00').toLocaleDateString('es-CO')}
                          </div>
                          <div className="text-sm text-gray-500">{booking.time}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {courtTypes.find(c => c.id === booking.courtType)?.name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            booking.status === 'confirmed' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {booking.status === 'confirmed' ? 'Confirmada' : 'Cancelada'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <button
                            onClick={() => handleCancelBooking(booking.id)}
                            disabled={booking.status === 'cancelled'}
                            className="text-yellow-600 hover:text-yellow-900 disabled:opacity-50"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteBooking(booking.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Admin - User Management */}
        {activeTab === 'user-management' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">Gestión de Usuarios</h2>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar usuarios..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Usuario
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rol
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredUsers.map((user) => (
                      <tr key={user.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                            <div className="text-sm text-gray-500">{user.phone}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.role === 'admin' 
                              ? 'bg-purple-100 text-purple-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {user.role === 'admin' ? 'Administrador' : 'Usuario'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {user.status === 'active' ? 'Activo' : 'Bloqueado'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          {user.role !== 'admin' && (
                            <button
                              onClick={() => handleUserStatusChange(user.id, user.status === 'active' ? 'blocked' : 'active')}
                              className={`${
                                user.status === 'active' 
                                  ? 'text-red-600 hover:text-red-900' 
                                  : 'text-green-600 hover:text-green-900'
                              }`}
                            >
                              {user.status === 'active' ? 'Bloquear' : 'Activar'}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Admin - Schedule Management */}
        {activeTab === 'schedule-management' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">Gestión de Horarios</h2>
              <button
                onClick={() => setManagingSchedule(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Agregar Horario
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Horarios Disponibles</h3>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-700 mb-3">Horarios Predeterminados</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {defaultTimeSlots.map(slot => (
                      <div key={slot} className="p-2 bg-gray-100 rounded-lg text-center text-sm">
                        {slot}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-700 mb-3">Horarios Personalizados</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {customSlots.map(slot => (
                      <div key={slot} className="p-2 bg-blue-100 rounded-lg text-center text-sm flex items-center justify-between">
                        <span>{slot}</span>
                        <button
                          onClick={() => handleRemoveCustomSlot(slot)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  {managingSchedule && (
                    <div className="mt-4 p-4 border rounded-lg">
                      <div className="flex gap-2">
                        <input
                          type="time"
                          onChange={(e) => {
                            if (e.target.value) {
                              handleAddCustomSlot(e.target.value);
                              setManagingSchedule(false);
                            }
                          }}
                          className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <button
                          onClick={() => setManagingSchedule(false)}
                          className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* User - New Booking */}
        {activeTab === 'booking' && (
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                <Calendar className="w-6 h-6 text-blue-600" />
                Nueva Reserva
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={getMinDate()}
                    max={getMaxDate()}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Cancha
                  </label>
                  <select
                    value={selectedCourt}
                    onChange={(e) => setSelectedCourt(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Selecciona una cancha</option>
                    {courtTypes.map(court => (
                      <option key={court.id} value={court.id}>
                        {court.name} - ${court.price.toLocaleString()} ({court.duration} min)
                      </option>
                    ))}
                  </select>
                </div>

                {selectedDate && selectedCourt && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Horario Disponible
                    </label>
                    {loading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 gap-2">
                        {availableSlots.map(slot => (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => setSelectedTime(slot)}
                            className={`p-2 rounded-lg border-2 transition-all ${
                              selectedTime === slot
                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                : 'border-gray-300 hover:border-blue-300'
                            }`}
                          >
                            <Clock className="w-4 h-4 inline mr-1" />
                            {slot}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {selectedDate && selectedTime && selectedCourt && !showForm && (
                  <button
                    type="button"
                    onClick={() => setShowForm(true)}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Continuar con la Reserva
                  </button>
                )}

                {showForm && (
                  <div className="space-y-4 border-t pt-6">
                    <h3 className="text-lg font-semibold">Información Adicional</h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Notas adicionales (opcional)
                      </label>
                      <textarea
                        value={formData.notes}
                        onChange={(e) => setFormData({...formData, notes: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows="3"
                        placeholder="Equipamiento necesario, número de jugadores, etc."
                      />
                    </div>

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setShowForm(false)}
                        className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-400 transition-colors"
                      >
                        Volver
                      </button>
                      <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={loading}
                        className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
                      >
                        {loading ? 'Procesando...' : 'Confirmar Reserva'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Booking Summary */}
            <div className="space-y-6">
              {(selectedDate || selectedTime || selectedCourt) && (
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-xl font-semibold mb-4">Resumen de Reserva</h3>
                  
                  <div className="space-y-3">
                    {selectedDate && (
                      <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-blue-600" />
                        <span>
                          <strong>Fecha:</strong> {new Date(selectedDate + 'T00:00:00').toLocaleDateString('es-CO', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    )}
                    
                    {selectedTime && (
                      <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-blue-600" />
                        <span><strong>Hora:</strong> {selectedTime}</span>
                      </div>
                    )}
                    
                    {selectedCourtData && (
                      <div className="flex items-center gap-3">
                        <MapPin className="w-5 h-5 text-blue-600" />
                        <span>
                          <strong>Cancha:</strong> {selectedCourtData.name}<br />
                          <span className="text-sm text-gray-600">
                            Duración: {selectedCourtData.duration} minutos
                          </span>
                        </span>
                      </div>
                    )}
                  </div>

                  {selectedCourtData && (
                    <div className="mt-4 pt-4 border-t">
                      <div className="flex justify-between items-center text-lg font-semibold">
                        <span>Total a pagar:</span>
                        <span className="text-green-600">
                          ${selectedCourtData.price.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-semibold mb-4">Información de las Canchas</h3>
                
                <div className="space-y-4">
                  {courtTypes.map(court => (
                    <div key={court.id} className="border rounded-lg p-4">
                      <h4 className="font-semibold text-lg">{court.name}</h4>
                      <p className="text-gray-600">
                        Duración: {court.duration} minutos
                      </p>
                      <p className="text-green-600 font-semibold">
                        ${court.price.toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* User - My Bookings */}
        {activeTab === 'my-bookings' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Mis Reservas</h2>
            
            {bookings.length === 0 ? (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  No tienes reservas aún
                </h3>
                <p className="text-gray-500 mb-6">
                  Comienza reservando tu primera cancha deportiva
                </p>
                <button
                  onClick={() => setActiveTab('booking')}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Hacer una Reserva
                </button>
              </div>
            ) : (
              <div className="grid gap-6">
                {bookings.map(booking => (
                  <div key={booking.id} className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <MapPin className="w-5 h-5 text-blue-600" />
                          <h3 className="text-lg font-semibold">
                            {courtTypes.find(c => c.id === booking.courtType)?.name}
                          </h3>
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            booking.status === 'confirmed' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {booking.status === 'confirmed' ? 'Confirmada' : 'Cancelada'}
                          </span>
                        </div>
                        
                        <div className="space-y-2 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {new Date(booking.date + 'T00:00:00').toLocaleDateString('es-CO', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span>{booking.time}</span>
                          </div>
                          {booking.notes && (
                            <div className="flex items-start gap-2">
                              <Mail className="w-4 h-4 mt-0.5" />
                              <span>{booking.notes}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-lg font-semibold text-green-600 mb-2">
                          ${courtTypes.find(c => c.id === booking.courtType)?.price.toLocaleString()}
                        </div>
                        {booking.status === 'confirmed' && (
                          <button
                            onClick={() => handleCancelBooking(booking.id)}
                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                          >
                            Cancelar
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
    </div>
  );
};

export default SportsBookingApp;
