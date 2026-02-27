import { useState } from "react";
import { useForm, type FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, Lock, ShieldCheck, ArrowLeft, CheckCircle2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { maskCPF, maskPhone, validateCPF, unmaskDigits, extractPhoneWithoutDDD, maskPartial } from "@/lib/masks";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
    Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";

// Lista de domínios bloqueados
const FORBIDDEN_DOMAINS = [
    "unesulbahia.edu.br",
    "faculdadezarns.com.br",
    "imepac.edu.br"
];

// Mapeamento de Unidades com seus respectivos IDs (Valores)
// Ajuste os IDs conforme sua regra de negócio (10, 20, 30...)
const UNIDADES = [
    { id: "10", label: "Zarns Salvador" },      // UNIFTC-SSA
    { id: "20", label: "Zarns Itumbiara" },     // IMEPAC-ITUMB
    { id: "30", label: "Zarns Pouso Alegre" },  // ZARNS-PA
    { id: "40", label: "Unesul Bahia" },        // UNECE-EUN / MEDUNECE-EUN (Filtrado no Backend)
    { id: "50", label: "IMEPAC Araguari" }      // IMEPAC -ARAGUARI
] as const;

const formSchema = z.object({
    nomeCompleto: z.string()
        .trim()
        .min(3, "O nome deve ter no mínimo 3 caracteres")
        .max(100, "Máximo 100 caracteres")
        .regex(/^[a-zA-ZÀ-ÿ\s]*$/, "O nome não deve conter números ou símbolos especiais"),

    matricula: z.string().trim().max(50, "Máximo 50 caracteres"),

    // O valor aqui será a string do ID ("10", "20", etc)
    unidade: z.string({ required_error: "Selecione a sua unidade de ensino" }),

    cpf: z.string().min(1, "CPF é obrigatório").refine(
        (val) => validateCPF(val),
        { message: "CPF inválido" }
    ),
    rg: z.string().trim().max(20, "Máximo 20 caracteres"),

    dataNascimento: z.date({ required_error: "Data de nascimento é obrigatória" }),
    celular: z.string().min(1, "Número de celular é obrigatório").refine(
        (val) => unmaskDigits(val).length === 11,
        { message: "Número de celular inválido (deve ter DDD + 9 dígitos)" }
    ),
    email: z.string()
        .min(1, "E-mail é obrigatório")
        .email("Formato de e-mail inválido")
        .max(255, "Máximo 255 caracteres")
        .refine((email) => {
            const emailLower = email.toLowerCase();
            return !FORBIDDEN_DOMAINS.some(domain => emailLower.includes(domain));
        }, {
            message: "E-mails institucionais não são aceitos. Use um e-mail pessoal."
        }),
});

type FormData = z.infer<typeof formSchema>;

interface SubmittedData {
    nomeCompleto: string;
    matricula: string;
    unidadeId: string; // Armazena o ID ("10", "20")
    cpf: string;
    rg: string;
    dataNascimento: string;
    celular: string;
    email: string;
}

export default function IdentityForm() {
    const [submitted, setSubmitted] = useState(false);
    const [submittedData, setSubmittedData] = useState<SubmittedData | null>(null);
    const { toast } = useToast();

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        mode: "onBlur",
        defaultValues: {
            nomeCompleto: "",
            matricula: "",
            cpf: "",
            rg: "",
            celular: "",
            email: "",
            unidade: "",
        },
    });

    function onSubmit(data: FormData) {
        // Preparando o payload para a API
        const payload = {
            nome_completo: data.nomeCompleto.toUpperCase(),
            matricula: data.matricula,
            // Enviando como Inteiro para o Backend Java
            unidade_id: parseInt(data.unidade),
            cpf: unmaskDigits(data.cpf),
            rg: data.rg,
            data_nascimento: format(data.dataNascimento, "yyyy-MM-dd"),
            celular: extractPhoneWithoutDDD(data.celular),
            email: data.email,
        };

        console.log("Payload JSON para API:", JSON.stringify(payload, null, 2));

        setSubmittedData({
            nomeCompleto: data.nomeCompleto,
            matricula: data.matricula,
            unidadeId: data.unidade, // Guarda o ID para buscar o label depois
            cpf: data.cpf,
            rg: data.rg,
            dataNascimento: format(data.dataNascimento, "dd/MM/yyyy"),
            celular: data.celular,
            email: data.email,
        });
        setSubmitted(true);
    }

    function onError(errors: FieldErrors<FormData>) {
        if (errors.email) {
            toast({
                variant: "destructive",
                title: "E-mail inválido",
                description: errors.email.message,
            });
        }
    }

    function handleReset() {
        setSubmitted(false);
        setSubmittedData(null);
        form.reset();
    }

    // Helper para pegar o nome da unidade baseado no ID salvo
    function getUnidadeLabel(id: string) {
        return UNIDADES.find(u => u.id === id)?.label || id;
    }

    if (submitted && submittedData) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[hsl(225,70%,45%)] via-[hsl(248,60%,50%)] to-[hsl(270,55%,45%)] flex flex-col">
                <header className="w-full py-6 px-4 text-center">
                    <h2 className="text-2xl font-bold tracking-wide text-white drop-shadow">Clariens</h2>
                </header>

                <main className="flex-1 flex items-center justify-center px-4 pb-8">
                    <Card className="w-full max-w-lg shadow-2xl border-0">
                        <CardContent className="p-8 text-center space-y-6">
                            <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                                <CheckCircle2 className="w-9 h-9 text-green-600" />
                            </div>
                            <h1 className="text-xl font-semibold text-foreground">
                                Solicitação enviada com sucesso!
                            </h1>
                            <p className="text-muted-foreground text-sm">
                                Sua solicitação foi recebida. Confira o resumo:
                            </p>

                            <div className="text-left space-y-2 bg-muted/50 rounded-lg p-4 text-sm">
                                <div className="flex justify-between border-b pb-2 mb-2">
                                    <span className="text-muted-foreground">Nome</span>
                                    <span className="font-medium text-right">{submittedData.nomeCompleto}</span>
                                </div>

                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Unidade</span>
                                    {/* Mostra o Nome (Label) e não o ID (10, 20...) */}
                                    <span className="font-medium">{getUnidadeLabel(submittedData.unidadeId)}</span>
                                </div>

                                {submittedData.matricula && (
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Matrícula</span>
                                        <span className="font-medium">{maskPartial(submittedData.matricula)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">CPF</span>
                                    <span className="font-medium">{maskPartial(submittedData.cpf, 6)}</span>
                                </div>
                                {submittedData.rg && (
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">RG</span>
                                        <span className="font-medium">{maskPartial(submittedData.rg)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Celular</span>
                                    <span className="font-medium">{maskPartial(submittedData.celular, 5)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">E-mail</span>
                                    <span className="font-medium">{maskPartial(submittedData.email, 8)}</span>
                                </div>
                            </div>

                            <Button onClick={handleReset} variant="outline" className="gap-2">
                                <ArrowLeft className="w-4 h-4" />
                                Voltar ao início
                            </Button>
                        </CardContent>
                    </Card>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[hsl(225,70%,45%)] via-[hsl(248,60%,50%)] to-[hsl(270,55%,45%)] flex flex-col">
            <header className="w-full py-8 px-4 text-center space-y-2">
                <h2 className="text-2xl font-bold tracking-wide text-white drop-shadow">Clariens</h2>
                <div className="flex items-center justify-center gap-2 mt-4">
                    <ShieldCheck className="w-6 h-6 text-white/80" />
                    <h1 className="text-xl md:text-2xl font-semibold text-white">
                        Confirmação de Identidade
                    </h1>
                </div>
                <p className="text-white/80 text-sm max-w-md mx-auto">
                    Preencha os dados abaixo para validar sua identidade.
                </p>
            </header>

            <main className="flex-1 flex items-start justify-center px-4 pb-8">
                <Card className="w-full max-w-lg shadow-2xl border-0">
                    <CardContent className="p-6 md:p-8">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit, onError)} className="space-y-5">

                                {/* Nome Completo */}
                                <FormField control={form.control} name="nomeCompleto" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nome Completo <span className="text-destructive">*</span></FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ex: João da Silva" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />

                                {/* Campo Unidade com Select e IDs */}
                                <FormField control={form.control} name="unidade" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Unidade de Ensino <span className="text-destructive">*</span></FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecione sua unidade" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {UNIDADES.map((uni) => (
                                                    <SelectItem key={uni.id} value={uni.id}>
                                                        {uni.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )} />

                                {/* Matrícula */}
                                <FormField control={form.control} name="matricula" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Número de Matrícula</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ex: 2024001234" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />

                                {/* CPF */}
                                <FormField control={form.control} name="cpf" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>CPF <span className="text-destructive">*</span></FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="000.000.000-00"
                                                value={field.value}
                                                onChange={(e) => field.onChange(maskCPF(e.target.value))}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />

                                {/* RG */}
                                <FormField control={form.control} name="rg" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>RG</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Número do RG" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />

                                {/* Data de Nascimento */}
                                <FormField control={form.control} name="dataNascimento" render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>Data de Nascimento <span className="text-destructive">*</span></FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant="outline"
                                                        className={cn(
                                                            "w-full pl-3 text-left font-normal",
                                                            !field.value && "text-muted-foreground"
                                                        )}
                                                    >
                                                        {field.value
                                                            ? format(field.value, "dd/MM/yyyy", { locale: ptBR })
                                                            : "Selecione a data"}
                                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value}
                                                    onSelect={field.onChange}
                                                    disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                                                    initialFocus
                                                    className="p-3 pointer-events-auto"
                                                    captionLayout="dropdown-buttons"
                                                    fromYear={1940}
                                                    toYear={new Date().getFullYear()}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )} />

                                {/* Celular */}
                                <FormField control={form.control} name="celular" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Número de Celular <span className="text-destructive">*</span></FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="(00) 00000-0000"
                                                value={field.value}
                                                onChange={(e) => field.onChange(maskPhone(e.target.value))}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />

                                {/* E-mail */}
                                <FormField control={form.control} name="email" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>E-mail Pessoal <span className="text-destructive">*</span></FormLabel>
                                        <FormControl>
                                            <Input type="email" placeholder="seu@email.com" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />

                                {/* LGPD Notice */}
                                <div className="flex gap-3 rounded-lg border border-border bg-muted/40 p-4 text-xs text-muted-foreground">
                                    <Lock className="w-5 h-5 shrink-0 mt-0.5 text-primary" />
                                    <p>
                                        Seus dados serão usados apenas para <strong>validação de identidade</strong>.
                                    </p>
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full h-12 text-base font-semibold bg-gradient-to-r from-[hsl(225,70%,45%)] to-[hsl(270,55%,50%)] hover:from-[hsl(225,70%,40%)] hover:to-[hsl(270,55%,45%)] text-white shadow-lg"
                                >
                                    Confirmar Identidade
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}