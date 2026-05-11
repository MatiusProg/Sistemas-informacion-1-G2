import { useEffect, useState } from "react";
import AppHeader from "@/components/AppHeader";
import { Input } from "@/components/ui/input";
import { StockService, Stock } from "@/services/StockServices";

export default function StockList() {

    const [productos, setProductos] = useState<Stock[]>([]);
    const [search, setSearch] = useState("");

    useEffect(() => {
        cargarStock();
    }, []);

    const cargarStock = async () => {
        try {
        const data = await StockService.getAll();
        setProductos(data);
        } catch (error) {
        console.error(error);
        }
    };

    const filtered = productos.filter((p) =>
        p.insumo_id.toString().includes(search.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gradient-soft">
        <AppHeader />

        <main className="container py-8 max-w-5xl">

            <div className="mb-6">
            <h1 className="text-3xl font-bold">
                Gestión de Stock
            </h1>

            <p className="text-muted-foreground">
                Control de inventario y existencias
            </p>
            </div>

            <Input
            placeholder="Buscar por ID de insumo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mb-4"
            />

            <div className="bg-card rounded-3xl shadow-card overflow-hidden">

            <table className="w-full">

                <thead>
                <tr className="border-b bg-secondary/50">

                    <th className="p-4 text-left">
                    Insumo
                    </th>

                    <th className="p-4 text-left">
                    Cantidad
                    </th>

                    <th className="p-4 text-left">
                    Stock mínimo
                    </th>

                    <th className="p-4 text-left">
                    Stock maximo
                    </th>

                    <th className="p-4 text-left">
                    Estado
                    </th>

                    <th className="p-4 text-right">
                    Acciones
                    </th>

                </tr>
                </thead>

                <tbody>

                {filtered.map((producto) => (

                    <tr
                    key={producto.id}
                    className="border-b"
                    >

                    <td className="p-4 font-medium">
                        Insumo #{producto.insumo_id}
                    </td>

                    <td className="p-4">
                        {producto.cantidad}
                    </td>

                    <td className="p-4">
                        {producto.stock_min}
                    </td>
                    
                    <td className="p-4">
                    {producto.stock_max}
                    </td> 
                    
                    <td className="p-4">

                        {producto.cantidad === 0 ? (

                        <span className="text-red-500 font-bold">
                            Agotado
                        </span>

                        ) : producto.cantidad <= producto.stock_min ? (

                        <span className="text-yellow-500 font-bold">
                            Bajo
                        </span>

                        ) : (

                        <span className="text-green-600 font-bold">
                            Disponible
                        </span>

                        )}

                    </td>

                    <td className="p-4 text-right">

                        <button
                        onClick={() => alert(`Editar stock ${producto.id}`)}
                        className="bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600"
                        >
                        Editar
                        </button>

                    </td>

                    </tr>

                ))}

                </tbody>

            </table>

            </div>

        </main>
        </div>
    );
}