import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { deliveryApi } from '../../api/delivery';
import { pelangganApi } from '../../api/master';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { ArrowLeft } from 'lucide-react';
const DeliveryOrderForm = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        pelanggan_id: '', nama_penerima: '', alamat_pengiriman: '', kota: '', telepon: '', nominal_cod: 0,
    });
    const [loading, setLoading] = useState(false);
    const [pelanggan, setPelanggan] = useState([]);
    useEffect(() => {
        pelangganApi.getAll().then(res => setPelanggan(res.data));
    }, []);
    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await deliveryApi.createOrder({
                ...form,
                nominal_cod: form.nominal_cod || null,
                pelanggan_id: form.pelanggan_id || null,
            });
            navigate('/delivery/orders');
        }
        catch (err) {
            console.error(err);
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsxs(Card, { title: "BUAT ORDER PENGIRIMAN", glow: "cyan", children: [_jsxs("button", { onClick: () => navigate('/delivery/orders'), className: "flex items-center gap-1 text-text-dim hover:text-neon-cyan mb-4", children: [_jsx(ArrowLeft, { className: "w-4 h-4" }), " KEMBALI"] }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4 max-w-xl", children: [_jsxs("div", { children: [_jsx("label", { className: "text-xs font-semibold tracking-[1px] uppercase text-text-dim", children: "Pelanggan" }), _jsxs("select", { name: "pelanggan_id", value: form.pelanggan_id, onChange: handleChange, className: "input-neon w-full mt-1", required: true, children: [_jsx("option", { value: "", children: "-- Pilih Pelanggan --" }), pelanggan.map(p => _jsx("option", { value: p.id, children: p.nama }, p.id))] })] }), _jsx(Input, { label: "Nama Penerima", name: "nama_penerima", value: form.nama_penerima, onChange: handleChange, required: true }), _jsx(Input, { label: "Alamat", name: "alamat_pengiriman", value: form.alamat_pengiriman, onChange: handleChange, required: true }), _jsx(Input, { label: "Kota", name: "kota", value: form.kota, onChange: handleChange, required: true }), _jsx(Input, { label: "Telepon", name: "telepon", value: form.telepon, onChange: handleChange }), _jsx(Input, { label: "Nominal COD (opsional)", type: "number", name: "nominal_cod", value: form.nominal_cod, onChange: handleChange }), _jsxs("div", { className: "flex gap-3 pt-4", children: [_jsx(Button, { type: "submit", isLoading: loading, children: "SIMPAN" }), _jsx(Button, { variant: "secondary", type: "button", onClick: () => navigate('/delivery/orders'), children: "BATAL" })] })] })] }));
};
export default DeliveryOrderForm;
