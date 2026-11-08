// src/controllers/paymentController.js
import fetch from 'node-fetch'; // Certifique-se de ter o node-fetch instalado no backend

export const criarPagamento = async (req, res) => {
    try {
        const { valor, descricao, cliente } = req.body;
        const TOKEN = process.env.PAGBANK_TOKEN;

        const options = {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                reference_id: `PEDIDO-${Date.now()}`,
                customer: {
                    name: cliente.nome,
                    email: cliente.email,
                    tax_id: cliente.cpf // Requerido pelo PagBank
                },
                items: [
                    {
                        name: descricao,
                        quantity: 1,
                        unit_amount: Math.round(valor * 100) // PagBank exige valor em centavos
                    }
                ],
                // Configuração base para cobrança via cartão ou PIX entrará aqui
            })
        };

        const response = await fetch('https://sandbox.api.pagseguro.com/orders', options);
        const data = await response.json();

        if (response.ok) {
            res.status(201).json({ sucesso: true, order: data });
        } else {
            console.error("Erro do PagBank:", data);
            res.status(400).json({ sucesso: false, erro: data });
        }
    } catch (error) {
        console.error("Erro interno:", error);
        res.status(500).json({ erro: 'Falha ao processar pagamento' });
    }
};