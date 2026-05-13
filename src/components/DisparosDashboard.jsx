import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

export default function DisparosDashboard() {
    const [usuariosConDisparos, setUsuariosConDisparos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDisparos = async () => {
            try {
                const usuariosSnapshot = await getDocs(collection(db, "usuarios"));

                const dataFull = await Promise.all(
                    usuariosSnapshot.docs.map(async (userDoc) => {
                        const userData = userDoc.data();
                        const idUsuario = userDoc.id;

                        // Subcolección de disparos
                        const disparosRef = collection(db, "usuarios", idUsuario, "disparos");
                        const disparosSnap = await getDocs(disparosRef);

                        const disparos = disparosSnap.docs.map(doc => ({
                            id: doc.id,
                            ...doc.data()
                        }));

                        return {
                            idUsuario,
                            email: userData.email || "Sin email",
                            disparos
                        };
                    })
                );

                setUsuariosConDisparos(dataFull);
            } catch (error) {
                console.error("Error cargando disparos:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDisparos();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"></div>
                <p className="text-slate-400 mt-4 animate-pulse">Cargando registros de balística...</p>
            </div>
        );
    }

    const totalDisparosGlobales = usuariosConDisparos.reduce((acc, curr) => acc + curr.disparos.length, 0);

    return (
        <div className="space-y-10">
            {/* Encabezado Principal */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/5 p-8 rounded-3xl border border-white/10 backdrop-blur-xl shadow-2xl relative overflow-hidden">
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none"></div>
                <div className="relative z-10">
                    <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-green-400">
                        Registro de Disparos
                    </h1>
                    <p className="text-slate-400 mt-2 text-lg">Consulta las métricas y la precisión de los tiros de cada estudiante</p>
                </div>

                <div className="relative z-10 flex items-center gap-3 bg-slate-900/50 py-2 px-4 rounded-full border border-slate-700/50">
                    <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
                    <span className="text-sm font-medium text-slate-300">
                        {totalDisparosGlobales} Disparos Globales
                    </span>
                </div>
            </header>

            {/* Lista de Usuarios */}
            <div className="grid grid-cols-1 gap-8">
                {usuariosConDisparos.map((user) => (
                    <div key={user.idUsuario} className="bg-slate-800/40 rounded-3xl border border-slate-700/50 shadow-2xl backdrop-blur-sm overflow-hidden hover:border-cyan-500/30 transition-all duration-500 group">

                        {/* Header de Tarjeta */}
                        <div className="bg-gradient-to-r from-slate-900/80 to-slate-800/80 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-700/50">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center text-xl font-bold text-white shadow-lg shadow-cyan-500/20 transform group-hover:scale-105 transition-transform duration-300">
                                    {user.idUsuario.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h2 className="text-white font-bold text-xl">{user.idUsuario}</h2>
                                    <p className="text-slate-400 text-sm">{user.email}</p>
                                </div>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="text-sm text-slate-400">Total de Disparos</span>
                                <span className="text-2xl font-bold text-white">{user.disparos.length}</span>
                            </div>
                        </div>

                        {/* Tabla */}
                        <div className="p-6">
                            {user.disparos.length > 0 ? (
                                <div className="bg-slate-900/50 rounded-2xl border border-slate-700/50 overflow-hidden overflow-x-auto">
                                    <table className="w-full text-left text-sm whitespace-nowrap">
                                        <thead className="bg-slate-800/80 text-slate-300 border-b border-slate-700">
                                            <tr>
                                                <th className="px-6 py-4 font-semibold">#</th>
                                                <th className="px-6 py-4 font-semibold">Ángulo</th>
                                                <th className="px-6 py-4 font-semibold">Distancia</th>
                                                <th className="px-6 py-4 font-semibold">Altura Máx.</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-700/50">
                                            {user.disparos.map((disparo, index) => (
                                                <tr key={disparo.id} className="hover:bg-white/5 transition-colors">
                                                    <td className="px-6 py-4 text-slate-400">{index + 1}</td>
                                                    <td className="px-6 py-4">
                                                        <span className="px-2.5 py-1 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                                                            {Number(disparo.angulo || 0).toFixed(1)}°
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="px-2.5 py-1 rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20">
                                                            {Number(disparo.distancia || 0).toFixed(2)} m
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                                                            {Number(disparo.altura || 0).toFixed(2)} m
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-10 bg-slate-900/30 rounded-2xl border border-dashed border-slate-700">
                                    <p className="text-slate-500">Sin datos de disparos</p>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}