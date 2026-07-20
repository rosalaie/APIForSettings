// frontend/src/pages/Clientes.jsx
import { useEffect, useState } from 'react';
import api from '../services/api';

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregarClientes() {
      try {
        const response = await api.get('/users'); // Puxa a rota que atualizamos no server.js
        setClientes(response.data);
      } catch (error) {
        console.error("Erro ao carregar clientes", error);
      } finally {
        setLoading(false);
      }
    }

    carregarClientes();
  }, []);

  if (loading) {
    return <div style={styles.loading}>Carregando clientes...</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2>Clientes Cadastrados</h2>
        <span style={styles.counter}>{clientes.length} clientes no total</span>
      </div>

      <table style={styles.table}>
        <thead>
          <tr style={styles.tableHeader}>
            <th style={styles.th}>ID</th>
            <th style={styles.th}>Nome</th>
            <th style={styles.th}>E-mail</th>
          </tr>
        </thead>
        <tbody>
          {clientes.map((cliente) => (
            <tr key={cliente.id} style={styles.tr}>
              <td style={styles.td}>{cliente.id}</td>
              <td style={styles.td}><strong>{cliente.nome}</strong></td>
              <td style={styles.td}>{cliente.email}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const styles = {
  container: { padding: '30px', background: '#fff', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  counter: { background: '#3a86c8', color: '#fff', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' },
  table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
  tableHeader: { background: '#f8fafc', borderBottom: '2px solid #e2e8f0' },
  th: { padding: '12px 16px', color: '#475569', fontWeight: '600' },
  tr: { borderBottom: '1px solid #f1f5f9' },
  td: { padding: '12px 16px', color: '#334155' },
  loading: { padding: '50px', textAlign: 'center', color: '#64748b' }
};