const taxa_juro = 0.018;

function getAliquotaParcela(saldo) {
    saldo = parseFloat(saldo);
    if (saldo <= 500) {
        return [0.5, 0];
    } else if (saldo <= 1000) {
        return [0.4, 50];
    } else if (saldo <= 5000) {
        return [0.3, 150];
    } else if (saldo <= 10000) {
        return [0.2, 650];
    } else if (saldo <= 15000) {
        return [0.15, 1150];
    } else if (saldo <= 20000) {
        return [0.1, 1900];
    } else {
        return [0.05, 2900];
    }
}

function calculaSaquesPeriodos(saldo, result = [], t = 0, num_saques = 7) {
    if (t >= num_saques) {
        return result;
    }
    const aliquota_parc = getAliquotaParcela(saldo);
    if (!aliquota_parc) {
        return null;
    }
    const saldo_mes = saldo * aliquota_parc[0] + aliquota_parc[1];
    result.push(parseFloat(saldo_mes.toFixed(2)));
    return calculaSaquesPeriodos(saldo - saldo_mes, result, t + 1, num_saques);
}

function calculaSaldoMes(lista_saques, saldo) {
    lista_saques.forEach(i => {
        const saldo_atual = saldo - i;
        saldo = saldo_atual;
    });
    return saldo;
}

function valorReservado(lista_saques) {
    return lista_saques.reduce((total, i) => total + i, 0);
}

function calculaValorPresenteSaquesComIOF(saldo_inicial, mes_aniversario, dia_aniversario) {
    const lista_saques = calculaSaquesPeriodos(saldo_inicial);
    const hoje = new Date();
    const ano_atual = hoje.getFullYear();
    const mes_atual = hoje.getMonth() + 1;
    const dia_atual = hoje.getDate();
    let result = 0;

    for (let t = 0; t < lista_saques.length; t++) {
        const saque = lista_saques[t];
        const ano_destino = mes_atual <= mes_aniversario ? ano_atual + t : ano_atual + t + 1;
        const data_aniversario = new Date(ano_destino, mes_aniversario - 1, dia_aniversario);
        const diff = parseInt((data_aniversario - hoje) / (1000 * 60 * 60 * 24 * 30));
        const meses_ate_aniversario = Math.max(0, diff);

        let valor_presente = saque / Math.pow((1 + taxa_juro), meses_ate_aniversario);

        const dias_ate_aniversario = Math.max((data_aniversario - hoje) / (1000 * 60 * 60 * 24), 0);
        const iof_diario = valor_presente * 0.000082 * Math.min(dias_ate_aniversario, 365);
        const iof_adicional = valor_presente * 0.0038;
        const iof_total = iof_diario + iof_adicional;

        const valor_final = valor_presente - iof_total;
        result += valor_final;
    }

    return result;
}

function calcularResultado() {
    const saldo = parseFloat(document.getElementById("saldo").value);
    const dia_aniversario = parseInt(document.getElementById("dia").value);
    const mes_aniversario = parseInt(document.getElementById("mes").value);

    const lista_saques = calculaSaquesPeriodos(saldo);
    const aliquota = getAliquotaParcela(saldo);
    const saldo_atual = calculaSaldoMes(lista_saques, saldo);
    const total_reservado = valorReservado(lista_saques);
    const parc_1_taxa = calculaValorPresenteSaquesComIOF(saldo, mes_aniversario, dia_aniversario);

    const resultadoDiv = document.getElementById("total");
    const valorFormatado = parc_1_taxa.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    resultadoDiv.innerHTML = `<p>Receba até: ${valorFormatado}</p>`;
}

// Chama a função de cálculo quando qualquer campo de entrada for alterado
document.getElementById("saldo").addEventListener("input", calcularResultado);
document.getElementById("dia").addEventListener("input", calcularResultado);
document.getElementById("mes").addEventListener("input", calcularResultado);

// Chama a função de cálculo quando o formulário é enviado (apenas para evitar o recarregamento da página)
document.getElementById("saqueForm").addEventListener("submit", function(event) {
    event.preventDefault();
    calcularResultado();
});
