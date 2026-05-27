import { useState } from "react";
import { useForm, type FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  CalendarIcon,
  Lock,
  ShieldCheck,
  ArrowLeft,
  CheckCircle2,
  Wrench,
} from "lucide-react";

import { cn } from "@/lib/utils";
import {
  maskCPF,
  maskPhone,
  validateCPF,
  unmaskDigits,
  maskPartial,
} from "@/lib/masks";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { IdentityData, validateIdentity } from "@/services/api";

// Lista de domínios bloqueados
const FORBIDDEN_DOMAINS = [
  "unesulbahia.edu.br",
  "faculdadezarns.com.br",
  "imepac.edu.br",
];

// Mapeamento de Unidades com seus respectivos IDs (Valores)
const UNIDADES = [
  { id: "10", label: "Zarns Salvador" }, // UNIFTC-SSA
  { id: "20", label: "Zarns Itumbiara" }, // IMEPAC-ITUMB
  { id: "30", label: "Zarns Pouso Alegre" }, // ZARNS-PA
  { id: "40", label: "Unesul Bahia" }, // UNECE-EUN / MEDUNECE-EUN
  { id: "50", label: "IMEPAC Araguari" }, // IMEPAC -ARAGUARI
] as const;

const formSchema = z.object({
  nomeCompleto: z
    .string()
    .trim()
    .min(3, "O nome deve ter no mínimo 3 caracteres")
    .max(100, "Máximo 100 caracteres")
    .regex(
      /^[a-zA-ZÀ-ÿ\s]*$/,
      "O nome não deve conter números ou símbolos especiais",
    ),

  matricula: z.string().trim().max(50, "Máximo 50 caracteres"),

  unidade: z.string({ required_error: "Selecione a sua unidade de ensino" }),

  cpf: z
    .string()
    .min(1, "CPF é obrigatório")
    .refine((val) => validateCPF(val), { message: "CPF inválido" }),
  rg: z.string().trim().max(20, "Máximo 20 caracteres"),

  dataNascimento: z.date({
    required_error: "Data de nascimento é obrigatória",
  }),
  celular: z
    .string()
    .min(1, "Número de celular é obrigatório")
    .refine((val) => unmaskDigits(val).length === 11, {
      message: "Número de celular inválido (deve ter DDD + 9 dígitos)",
    }),
  email: z
    .string()
    .min(1, "E-mail é obrigatório")
    .email("Formato de e-mail inválido")
    .max(255, "Máximo 255 caracteres")
    .refine(
      (email) => {
        const emailLower = email.toLowerCase();
        return !FORBIDDEN_DOMAINS.some((domain) => emailLower.includes(domain));
      },
      {
        message:
          "E-mails institucionais não são aceitos. Use um e-mail pessoal.",
      },
    ),
});

type FormData = z.infer<typeof formSchema>;

interface SubmittedData {
  nomeCompleto: string;
  matricula: string;
  unidadeId: string;
  cpf: string;
  rg: string;
  dataNascimento: string;
  celular: string;
  email: string;
}

export default function IdentityForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isConstruction, setIsConstruction] = useState(false);
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

  async function onSubmit(data: IdentityData) {
    setIsLoading(true);
    try {
      await validateIdentity(data);
      setIsConstruction(true);
    } catch (error: any) {
      console.error("Erro no envio:", error);
      toast({
        variant: "destructive",
        title: "Erro na Validação",
        description: error.message || "Não foi possível validar os seus dados.",
      });
    } finally {
      setIsLoading(false);
    }
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

  if (isConstruction) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[hsl(225,70%,45%)] to-[hsl(270,55%,45%)] flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center p-8 shadow-2xl">
          <Wrench className="w-16 h-16 mx-auto text-primary mb-4 animate-bounce" />
          <h2 className="text-2xl font-bold mb-2 text-foreground">
            Em Construção
          </h2>
          <p className="text-muted-foreground mb-6">
            A etapa de redefinição de senha está sendo finalizada.
          </p>
          <Button onClick={() => setIsConstruction(false)} variant="outline">
            Voltar
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(225,70%,45%)] via-[hsl(248,60%,50%)] to-[hsl(270,55%,45%)] flex flex-col">
      <header className="w-full py-8 px-4 text-center space-y-2">
        <h2 className="text-2xl font-bold tracking-wide text-white drop-shadow">
          Clariens
        </h2>
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
              <form
                onSubmit={form.handleSubmit(onSubmit, onError)}
                className="space-y-5"
              >
                <FormField
                  control={form.control}
                  name="nomeCompleto"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Nome Completo{" "}
                        <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: João da Silva" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="unidade"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Unidade de Ensino{" "}
                        <span className="text-destructive">*</span>
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
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
                  )}
                />

                <FormField
                  control={form.control}
                  name="matricula"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número de Matrícula</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: 2024001234" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cpf"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        CPF <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="000.000.000-00"
                          value={field.value}
                          onChange={(e) =>
                            field.onChange(maskCPF(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="rg"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>RG</FormLabel>
                      <FormControl>
                        <Input placeholder="Número do RG" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dataNascimento"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>
                        Data de Nascimento{" "}
                        <span className="text-destructive">*</span>
                      </FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground",
                              )}
                            >
                              {field.value
                                ? format(field.value, "dd/MM/yyyy", {
                                    locale: ptBR,
                                  })
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
                            disabled={(date) =>
                              date > new Date() || date < new Date("1900-01-01")
                            }
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
                  )}
                />

                <FormField
                  control={form.control}
                  name="celular"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Número de Celular{" "}
                        <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="(00) 00000-0000"
                          value={field.value}
                          onChange={(e) =>
                            field.onChange(maskPhone(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        E-mail Pessoal{" "}
                        <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="seu@email.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-3 rounded-lg border border-border bg-muted/40 p-4 text-xs text-muted-foreground">
                  <Lock className="w-5 h-5 shrink-0 mt-0.5 text-primary" />
                  <p>
                    Seus dados serão usados apenas para{" "}
                    <strong>validação de identidade</strong>.
                  </p>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 text-base font-semibold bg-gradient-to-r from-[hsl(225,70%,45%)] to-[hsl(270,55%,50%)] hover:from-[hsl(225,70%,40%)] hover:to-[hsl(270,55%,45%)] text-white shadow-lg"
                  disabled={isLoading}
                >
                  {isLoading ? "Validando..." : "Confirmar Identidade"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}