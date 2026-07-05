const API_URL = "http://localhost:8080/api";

export interface IdentityData {
    nomeCompleto?: string;
    matricula?: string;
    unidade?: string;
    cpf?: string;
    rg?: string;
    dataNascimento?: Date;
    celular?: string;
    email?: string;
}

export const validateIdentity = async (data: IdentityData) => {
    // Aqui fazemos o mapeamento para o formato que o seu Java espera.
    // "unidade" agora é o código da unidade (string), ex.: "UNIFTC-SSA".
    const payload = {
        nome_completo: data.nomeCompleto.toUpperCase(),
        matricula: data.matricula,
        unidade: data.unidade,
        cpf: data.cpf.replace(/\D/g, ""), // Limpa máscara
        rg: data.rg,
        data_nascimento: data.dataNascimento.toISOString().split('T')[0],
        celular: data.celular.replace(/\D/g, ""),
        email: data.email,
    };

    const response = await fetch(`${API_URL}/auth/validate-identity`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Erro na validação de identidade");
    }

    return await response.json();
};